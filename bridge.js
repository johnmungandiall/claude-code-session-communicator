#!/usr/bin/env node

/**
 * Session Bridge - Connect Session Communicator with RuFlo Memory
 * Enables unified memory across sessions and AgentDB
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HOME = process.env.HOME || process.env.USERPROFILE;
const SESSION_DIR = path.join(HOME, '.claude-flow', 'sessions');
const MEMORY_DIR = path.join(HOME, '.claude', 'projects');

async function execCLI(args) {
  return new Promise((resolve, reject) => {
    const cliPath = path.join(__dirname, 'cli.js');
    const proc = spawn('node', [cliPath, ...args]);

    let stdout = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`CLI exited with code ${code}`));
      } else {
        try {
          resolve(JSON.parse(stdout));
        } catch {
          resolve(stdout);
        }
      }
    });
  });
}

async function importClaudeMemories(sessionId) {
  console.log(`📥 Importing Claude Code memories into session ${sessionId}...\n`);

  try {
    // Find all memory files
    const projectDirs = await fs.readdir(MEMORY_DIR);
    let totalImported = 0;

    for (const projectDir of projectDirs) {
      const memoryPath = path.join(MEMORY_DIR, projectDir, 'memory');

      try {
        const memoryFiles = await fs.readdir(memoryPath);

        for (const file of memoryFiles) {
          if (!file.endsWith('.md')) continue;

          const filePath = path.join(memoryPath, file);
          const content = await fs.readFile(filePath, 'utf-8');

          // Parse frontmatter
          const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
          if (!frontmatterMatch) continue;

          const frontmatter = frontmatterMatch[1];
          const body = frontmatterMatch[2];

          const nameMatch = frontmatter.match(/name:\s*(.+)/);
          const typeMatch = frontmatter.match(/type:\s*(.+)/);
          const descMatch = frontmatter.match(/description:\s*(.+)/);

          if (!nameMatch || !typeMatch) continue;

          const name = nameMatch[1].trim();
          const type = typeMatch[1].trim();
          const description = descMatch ? descMatch[1].trim() : '';

          // Store in session state
          await execCLI([
            'save-state',
            '--session', sessionId,
            '--namespace', `memory-${type}`,
            '--state', JSON.stringify({
              name,
              type,
              description,
              content: body.trim(),
              source: 'claude-code',
              importedAt: new Date().toISOString()
            })
          ]);

          console.log(`✓ Imported: ${name} (${type})`);
          totalImported++;
        }
      } catch (error) {
        // Skip directories without memory folder
        continue;
      }
    }

    console.log(`\n✨ Imported ${totalImported} memories into session ${sessionId}`);

  } catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  }
}

async function exportToClaudeMemory(sessionId, projectName) {
  console.log(`📤 Exporting session ${sessionId} state to Claude Code memory...\n`);

  try {
    const memoryPath = path.join(MEMORY_DIR, projectName, 'memory');
    await fs.mkdir(memoryPath, { recursive: true });

    // Load all session states
    const states = await execCLI(['load-state', '--session', sessionId]);

    if (!states.state) {
      console.log('No state found to export');
      return;
    }

    // Export as memory file
    const memoryFile = path.join(memoryPath, `session-${sessionId}.md`);
    const content = `---
name: Session ${sessionId} State
description: Exported session state from Session Communicator
type: project
---

# Session State Export

**Session ID:** ${sessionId}
**Exported:** ${new Date().toISOString()}
**Namespace:** ${states.namespace || 'default'}

## State Data

\`\`\`json
${JSON.stringify(states.state.state, null, 2)}
\`\`\`

## History

Total state snapshots: ${states.historyCount}
`;

    await fs.writeFile(memoryFile, content);
    console.log(`✓ Exported to: ${memoryFile}`);

  } catch (error) {
    console.error('❌ Export failed:', error.message);
    process.exit(1);
  }
}

async function syncBidirectional(sessionId, projectName) {
  console.log(`🔄 Bidirectional sync: Session ${sessionId} ↔ Project ${projectName}\n`);

  await importClaudeMemories(sessionId);
  console.log();
  await exportToClaudeMemory(sessionId, projectName);

  console.log('\n✨ Sync completed!');
}

async function listSessions() {
  console.log('📋 Available Sessions\n');

  const sessions = await execCLI(['list']);

  if (sessions.total === 0) {
    console.log('No sessions found');
    return;
  }

  sessions.sessions.forEach(session => {
    console.log(`• ${session.sessionId}`);
    console.log(`  Messages: ${session.messageCount} (${session.unreadCount} unread)`);
    console.log(`  States: ${session.stateCount}`);
    console.log(`  Last Activity: ${session.lastActivity || 'N/A'}`);
    console.log();
  });
}

// CLI
const command = process.argv[2];
const sessionId = process.argv[3];
const projectName = process.argv[4];

if (command === 'import' && sessionId) {
  importClaudeMemories(sessionId);
} else if (command === 'export' && sessionId && projectName) {
  exportToClaudeMemory(sessionId, projectName);
} else if (command === 'sync' && sessionId && projectName) {
  syncBidirectional(sessionId, projectName);
} else if (command === 'list') {
  listSessions();
} else {
  console.log('Session Bridge - Connect Session Communicator with Claude Code Memory\n');
  console.log('Usage:');
  console.log('  node bridge.js import <session-id>');
  console.log('    Import Claude Code memories into session');
  console.log();
  console.log('  node bridge.js export <session-id> <project-name>');
  console.log('    Export session state to Claude Code memory');
  console.log();
  console.log('  node bridge.js sync <session-id> <project-name>');
  console.log('    Bidirectional sync between session and project');
  console.log();
  console.log('  node bridge.js list');
  console.log('    List all available sessions');
  console.log();
  console.log('Examples:');
  console.log('  node bridge.js import my-session');
  console.log('  node bridge.js export my-session my-project');
  console.log('  node bridge.js sync my-session my-project');
  process.exit(1);
}
