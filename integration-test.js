#!/usr/bin/env node

/**
 * Session Communicator Integration Test
 * Tests the MCP server with real session communication
 */

import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SESSION_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.claude-flow', 'sessions-test');

// Override session directory for testing
process.env.HOME = path.dirname(SESSION_DIR);

async function runTest(name, testFn) {
  try {
    console.log(`\n🧪 Running: ${name}`);
    await testFn();
    console.log(`✅ Passed: ${name}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed: ${name}`);
    console.error(`   Error: ${error.message}`);
    return false;
  }
}

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

async function cleanup() {
  try {
    await fs.rm(SESSION_DIR, { recursive: true, force: true });
  } catch (error) {
    // Ignore cleanup errors
  }
}

async function main() {
  console.log('🚀 Session Communicator Integration Tests\n');
  console.log(`📁 Test directory: ${SESSION_DIR}\n`);

  await cleanup();

  const results = [];

  // Test 1: Send and receive messages
  results.push(await runTest('Send and receive messages', async () => {
    const sessionId = 'test-session-1';

    // Send message
    const sendResult = await execCLI([
      'send',
      '--session', sessionId,
      '--message', 'Hello from integration test',
      '--priority', 'high',
      '--metadata', JSON.stringify({ testId: 'test-1' })
    ]);

    if (!sendResult.success) throw new Error('Failed to send message');

    // Receive messages
    const receiveResult = await execCLI([
      'receive',
      '--session', sessionId
    ]);

    if (receiveResult.count !== 1) {
      throw new Error(`Expected 1 message, got ${receiveResult.count}`);
    }

    if (receiveResult.messages[0].message !== 'Hello from integration test') {
      throw new Error('Message content mismatch');
    }
  }));

  // Test 2: Save and load state
  results.push(await runTest('Save and load state', async () => {
    const sessionId = 'test-session-2';
    const state = {
      agents: ['coder', 'reviewer'],
      tasks: ['task-1', 'task-2'],
      metrics: { tokensUsed: 5000 }
    };

    // Save state
    const saveResult = await execCLI([
      'save-state',
      '--session', sessionId,
      '--namespace', 'swarm',
      '--state', JSON.stringify(state)
    ]);

    if (!saveResult.success) throw new Error('Failed to save state');

    // Load state
    const loadResult = await execCLI([
      'load-state',
      '--session', sessionId,
      '--namespace', 'swarm'
    ]);

    if (!loadResult.state) throw new Error('No state loaded');
    if (JSON.stringify(loadResult.state.state) !== JSON.stringify(state)) {
      throw new Error('State mismatch');
    }
  }));

  // Test 3: List sessions
  results.push(await runTest('List sessions', async () => {
    // Create multiple sessions
    await execCLI(['send', '--session', 'session-a', '--message', 'Test A']);
    await execCLI(['send', '--session', 'session-b', '--message', 'Test B']);
    await execCLI(['send', '--session', 'session-c', '--message', 'Test C']);

    // List sessions
    const listResult = await execCLI(['list']);

    if (listResult.total < 3) {
      throw new Error(`Expected at least 3 sessions, got ${listResult.total}`);
    }
  }));

  // Test 4: Priority filtering
  results.push(await runTest('Priority message handling', async () => {
    const sessionId = 'test-session-priority';

    // Send messages with different priorities
    await execCLI(['send', '--session', sessionId, '--message', 'Low priority', '--priority', 'low']);
    await execCLI(['send', '--session', sessionId, '--message', 'High priority', '--priority', 'high']);
    await execCLI(['send', '--session', sessionId, '--message', 'Normal priority', '--priority', 'normal']);

    // Receive all messages
    const result = await execCLI(['receive', '--session', sessionId]);

    if (result.count !== 3) {
      throw new Error(`Expected 3 messages, got ${result.count}`);
    }

    // Verify priorities
    const priorities = result.messages.map(m => m.priority);
    if (!priorities.includes('low') || !priorities.includes('high') || !priorities.includes('normal')) {
      throw new Error('Missing priority levels');
    }
  }));

  // Test 5: Namespace filtering
  results.push(await runTest('Namespace filtering', async () => {
    const sessionId = 'test-session-namespace';

    // Send messages with different namespaces
    await execCLI([
      'send',
      '--session', sessionId,
      '--message', 'Swarm message',
      '--metadata', JSON.stringify({ namespace: 'swarm' })
    ]);

    await execCLI([
      'send',
      '--session', sessionId,
      '--message', 'Task message',
      '--metadata', JSON.stringify({ namespace: 'tasks' })
    ]);

    // Receive with namespace filter
    const result = await execCLI([
      'receive',
      '--session', sessionId,
      '--namespace', 'swarm'
    ]);

    if (result.count !== 1) {
      throw new Error(`Expected 1 message, got ${result.count}`);
    }

    if (result.messages[0].message !== 'Swarm message') {
      throw new Error('Namespace filtering failed');
    }
  }));

  // Test 6: Delete session
  results.push(await runTest('Delete session', async () => {
    const sessionId = 'test-session-delete';

    // Create session
    await execCLI(['send', '--session', sessionId, '--message', 'To be deleted']);

    // Delete session
    const deleteResult = await execCLI(['delete', '--session', sessionId, '--force']);

    if (!deleteResult.success) throw new Error('Failed to delete session');

    // Verify deletion
    const listResult = await execCLI(['list']);
    const found = listResult.sessions.find(s => s.sessionId === sessionId);

    if (found) throw new Error('Session still exists after deletion');
  }));

  // Test 7: Clear session data
  results.push(await runTest('Clear session data', async () => {
    const sessionId = 'test-session-clear';

    // Create session with messages and state
    await execCLI(['send', '--session', sessionId, '--message', 'Message 1']);
    await execCLI(['send', '--session', sessionId, '--message', 'Message 2']);
    await execCLI([
      'save-state',
      '--session', sessionId,
      '--state', JSON.stringify({ test: true })
    ]);

    // Clear all data
    await execCLI(['clear', '--session', sessionId, '--all']);

    // Verify cleared
    const receiveResult = await execCLI(['receive', '--session', sessionId]);
    const loadResult = await execCLI(['load-state', '--session', sessionId]);

    if (receiveResult.count !== 0) {
      throw new Error('Messages not cleared');
    }

    if (loadResult.state !== null) {
      throw new Error('State not cleared');
    }
  }));

  // Test 8: Unread message tracking
  results.push(await runTest('Unread message tracking', async () => {
    const sessionId = 'test-session-unread';

    // Send unread messages
    await execCLI(['send', '--session', sessionId, '--message', 'Unread 1']);
    await execCLI(['send', '--session', sessionId, '--message', 'Unread 2']);

    // List sessions with unread
    const listResult = await execCLI(['receive']);

    const session = listResult.sessions.find(s => s.sessionId === sessionId);
    if (!session || session.unreadCount !== 2) {
      throw new Error('Unread count incorrect');
    }

    // Mark as read
    await execCLI(['receive', '--session', sessionId]);

    // Verify read
    const listResult2 = await execCLI(['receive']);
    const session2 = listResult2.sessions.find(s => s.sessionId === sessionId);

    if (session2) {
      throw new Error('Session still has unread messages');
    }
  }));

  // Cleanup
  await cleanup();

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Results Summary');
  console.log('='.repeat(50));

  const passed = results.filter(r => r).length;
  const failed = results.filter(r => !r).length;

  console.log(`\n✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / results.length) * 100).toFixed(1)}%\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch(error => {
  console.error('\n💥 Test suite failed:', error);
  process.exit(1);
});
