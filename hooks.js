#!/usr/bin/env node

/**
 * Session Communicator Hook Integration
 * Automatically save/restore session state using Claude Code hooks
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HOME = process.env.HOME || process.env.USERPROFILE;
const HOOKS_DIR = path.join(HOME, '.claude', 'hooks');

async function execCLI(args) {
  return new Promise((resolve, reject) => {
    const cliPath = path.join(__dirname, 'cli.js');
    const proc = spawn('node', [cliPath, ...args]);

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`CLI exited with code ${code}: ${stderr}`));
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

// Hook: session-start
const sessionStartHook = `#!/bin/bash
# Session Communicator - Auto-restore session state

SESSION_ID="$1"

if [ -z "$SESSION_ID" ]; then
  echo "No session ID provided"
  exit 0
fi

# Load previous session state
STATE=$(node "${__dirname}/cli.js" load-state --session "$SESSION_ID" --namespace "auto-save" 2>/dev/null)

if [ $? -eq 0 ] && [ -n "$STATE" ]; then
  echo "✓ Restored session state from previous session"
  echo "$STATE" | jq -r '.state.state' 2>/dev/null || echo "$STATE"
else
  echo "No previous session state found"
fi
`;

// Hook: session-end
const sessionEndHook = `#!/bin/bash
# Session Communicator - Auto-save session state

SESSION_ID="$1"

if [ -z "$SESSION_ID" ]; then
  echo "No session ID provided"
  exit 0
fi

# Collect session state
STATE_JSON=$(cat <<EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "sessionId": "$SESSION_ID",
  "workingDirectory": "$(pwd)",
  "gitBranch": "$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'N/A')",
  "gitCommit": "$(git rev-parse --short HEAD 2>/dev/null || echo 'N/A')"
}
EOF
)

# Save session state
node "${__dirname}/cli.js" save-state \\
  --session "$SESSION_ID" \\
  --namespace "auto-save" \\
  --state "$STATE_JSON" 2>/dev/null

if [ $? -eq 0 ]; then
  echo "✓ Session state saved for future restoration"
else
  echo "⚠ Failed to save session state"
fi
`;

// Hook: post-task
const postTaskHook = `#!/bin/bash
# Session Communicator - Notify on task completion

SESSION_ID="$1"
TASK_ID="$2"
TASK_STATUS="$3"

if [ -z "$SESSION_ID" ] || [ -z "$TASK_ID" ]; then
  exit 0
fi

# Check if there's a coordinator session
COORDINATOR=$(cat ~/.claude-flow/coordinator-session 2>/dev/null)

if [ -n "$COORDINATOR" ] && [ "$COORDINATOR" != "$SESSION_ID" ]; then
  # Notify coordinator of task completion
  node "${__dirname}/cli.js" send \\
    --session "$COORDINATOR" \\
    --message "Task $TASK_ID completed with status: $TASK_STATUS" \\
    --priority "normal" \\
    --metadata "{\\"taskId\\":\\"$TASK_ID\\",\\"status\\":\\"$TASK_STATUS\\",\\"worker\\":\\"$SESSION_ID\\"}" \\
    2>/dev/null
fi
`;

async function installHooks() {
  console.log('🔧 Installing Session Communicator Hooks\n');

  try {
    // Ensure hooks directory exists
    await fs.mkdir(HOOKS_DIR, { recursive: true });

    // Install session-start hook
    const sessionStartPath = path.join(HOOKS_DIR, 'session-start');
    await fs.writeFile(sessionStartPath, sessionStartHook, { mode: 0o755 });
    console.log('✓ Installed session-start hook');

    // Install session-end hook
    const sessionEndPath = path.join(HOOKS_DIR, 'session-end');
    await fs.writeFile(sessionEndPath, sessionEndHook, { mode: 0o755 });
    console.log('✓ Installed session-end hook');

    // Install post-task hook
    const postTaskPath = path.join(HOOKS_DIR, 'post-task');
    await fs.writeFile(postTaskPath, postTaskHook, { mode: 0o755 });
    console.log('✓ Installed post-task hook');

    console.log('\n📍 Hooks installed at:', HOOKS_DIR);
    console.log('\n✨ Features enabled:');
    console.log('  • Auto-save session state on exit');
    console.log('  • Auto-restore session state on start');
    console.log('  • Task completion notifications to coordinator');
    console.log('\n⚠️  Restart Claude Code to activate hooks');

  } catch (error) {
    console.error('❌ Hook installation failed:', error.message);
    process.exit(1);
  }
}

async function uninstallHooks() {
  console.log('🗑️  Uninstalling Session Communicator Hooks\n');

  try {
    const hooks = ['session-start', 'session-end', 'post-task'];

    for (const hook of hooks) {
      const hookPath = path.join(HOOKS_DIR, hook);
      try {
        await fs.unlink(hookPath);
        console.log(`✓ Removed ${hook} hook`);
      } catch (error) {
        if (error.code !== 'ENOENT') {
          console.log(`⚠ Could not remove ${hook}: ${error.message}`);
        }
      }
    }

    console.log('\n✨ Hooks uninstalled successfully');

  } catch (error) {
    console.error('❌ Hook uninstallation failed:', error.message);
    process.exit(1);
  }
}

// CLI
const command = process.argv[2];

if (command === 'install') {
  installHooks();
} else if (command === 'uninstall') {
  uninstallHooks();
} else {
  console.log('Usage:');
  console.log('  node hooks.js install    - Install session hooks');
  console.log('  node hooks.js uninstall  - Remove session hooks');
  process.exit(1);
}
