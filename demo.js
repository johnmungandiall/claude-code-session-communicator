#!/usr/bin/env node

/**
 * Demo script showing Session Communicator capabilities
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function execCLI(args) {
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

async function demo() {
  console.log('🎬 Session Communicator Demo\n');

  // Demo 1: Basic messaging
  console.log('📨 Demo 1: Basic Messaging');
  console.log('─'.repeat(50));

  await execCLI([
    'send',
    '--session', 'demo-session',
    '--message', 'Hello from Session A!',
    '--priority', 'normal'
  ]);
  console.log('✓ Sent message to demo-session');

  const messages = await execCLI(['receive', '--session', 'demo-session']);
  console.log(`✓ Received ${messages.count} message(s)`);
  console.log(`  Message: "${messages.messages[0].message}"`);
  console.log();

  // Demo 2: Priority messaging
  console.log('🚨 Demo 2: Priority Messaging');
  console.log('─'.repeat(50));

  await execCLI([
    'send',
    '--session', 'priority-demo',
    '--message', 'Low priority task',
    '--priority', 'low'
  ]);

  await execCLI([
    'send',
    '--session', 'priority-demo',
    '--message', 'URGENT: Critical error!',
    '--priority', 'high'
  ]);

  await execCLI([
    'send',
    '--session', 'priority-demo',
    '--message', 'Normal task',
    '--priority', 'normal'
  ]);

  console.log('✓ Sent 3 messages with different priorities');

  const priorityMessages = await execCLI(['receive', '--session', 'priority-demo']);
  console.log(`✓ Received ${priorityMessages.count} messages`);

  priorityMessages.messages.forEach((msg, i) => {
    const icon = msg.priority === 'high' ? '🔴' : msg.priority === 'normal' ? '🟡' : '🟢';
    console.log(`  ${icon} [${msg.priority}] ${msg.message}`);
  });
  console.log();

  // Demo 3: State management
  console.log('💾 Demo 3: State Management');
  console.log('─'.repeat(50));

  const state = {
    swarmTopology: 'hierarchical',
    activeAgents: ['coder-1', 'reviewer-1', 'tester-1'],
    taskQueue: ['task-1', 'task-2', 'task-3'],
    metrics: {
      tokensUsed: 45000,
      tasksCompleted: 12,
      avgTaskTime: 120
    }
  };

  await execCLI([
    'save-state',
    '--session', 'state-demo',
    '--namespace', 'swarm',
    '--state', JSON.stringify(state)
  ]);
  console.log('✓ Saved swarm state');

  const loadedState = await execCLI([
    'load-state',
    '--session', 'state-demo',
    '--namespace', 'swarm'
  ]);

  console.log('✓ Loaded swarm state:');
  console.log(`  Topology: ${loadedState.state.state.swarmTopology}`);
  console.log(`  Active Agents: ${loadedState.state.state.activeAgents.length}`);
  console.log(`  Tasks in Queue: ${loadedState.state.state.taskQueue.length}`);
  console.log(`  Tokens Used: ${loadedState.state.state.metrics.tokensUsed}`);
  console.log();

  // Demo 4: Multi-session coordination
  console.log('🤝 Demo 4: Multi-Session Coordination');
  console.log('─'.repeat(50));

  const workers = ['worker-1', 'worker-2', 'worker-3'];

  console.log('✓ Coordinator distributing tasks to workers...');
  for (const worker of workers) {
    await execCLI([
      'send',
      '--session', worker,
      '--message', `Process batch-${worker}`,
      '--metadata', JSON.stringify({
        coordinator: 'coordinator-session',
        batchId: `batch-${worker}`,
        priority: 'normal'
      })
    ]);
    console.log(`  → Sent task to ${worker}`);
  }

  console.log('\n✓ Workers reporting back...');
  for (const worker of workers) {
    await execCLI([
      'send',
      '--session', 'coordinator-session',
      '--message', `Batch completed by ${worker}`,
      '--metadata', JSON.stringify({
        worker,
        recordsProcessed: Math.floor(Math.random() * 1000) + 500,
        status: 'success'
      })
    ]);
    console.log(`  ← ${worker} completed task`);
  }

  const coordinatorMessages = await execCLI([
    'receive',
    '--session', 'coordinator-session'
  ]);
  console.log(`\n✓ Coordinator received ${coordinatorMessages.count} completion reports`);
  console.log();

  // Demo 5: Session listing
  console.log('📋 Demo 5: Session Management');
  console.log('─'.repeat(50));

  const sessions = await execCLI(['list']);
  console.log(`✓ Total active sessions: ${sessions.total}`);

  sessions.sessions.slice(0, 5).forEach(session => {
    console.log(`  • ${session.sessionId}`);
    console.log(`    Messages: ${session.messageCount} (${session.unreadCount} unread)`);
    console.log(`    States: ${session.stateCount}`);
    console.log(`    Last Activity: ${session.lastActivity || 'N/A'}`);
  });

  if (sessions.total > 5) {
    console.log(`  ... and ${sessions.total - 5} more`);
  }
  console.log();

  // Demo 6: Cleanup
  console.log('🧹 Demo 6: Cleanup');
  console.log('─'.repeat(50));

  const sessionsToDelete = ['demo-session', 'priority-demo', 'state-demo'];

  for (const sessionId of sessionsToDelete) {
    await execCLI(['delete', '--session', sessionId, '--force']);
    console.log(`✓ Deleted ${sessionId}`);
  }

  console.log('\n✨ Demo completed!\n');
  console.log('📚 Learn more:');
  console.log('  • README: src/mcp-servers/session-communicator/README.md');
  console.log('  • Examples: docs/session-communicator-examples.md');
  console.log('  • Quick Ref: docs/session-communicator-quickref.md\n');
}

demo().catch(error => {
  console.error('\n❌ Demo failed:', error.message);
  process.exit(1);
});
