#!/usr/bin/env node

/**
 * Session Communicator CLI
 * Command-line interface for cross-session communication
 */

import { Command } from 'commander';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SESSION_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.claude-flow', 'sessions');

const program = new Command();

// Helpers
async function getSessionPath(sessionId, type = 'messages') {
  const dir = path.join(SESSION_DIR, sessionId);
  await fs.mkdir(dir, { recursive: true });
  return path.join(dir, `${type}.json`);
}

async function readSessionData(sessionId, type = 'messages') {
  try {
    const filePath = await getSessionPath(sessionId, type);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

async function writeSessionData(sessionId, data, type = 'messages') {
  const filePath = await getSessionPath(sessionId, type);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// Commands
program
  .name('session-communicator')
  .description('Cross-session communication and state management')
  .version('1.0.0');

program
  .command('send')
  .description('Send a message to another session')
  .requiredOption('-s, --session <id>', 'Target session ID')
  .requiredOption('-m, --message <text>', 'Message content')
  .option('-p, --priority <level>', 'Priority level (low|normal|high)', 'normal')
  .option('--metadata <json>', 'Metadata as JSON string')
  .action(async (options) => {
    const messages = await readSessionData(options.session, 'messages');
    const newMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      message: options.message,
      priority: options.priority,
      metadata: options.metadata ? JSON.parse(options.metadata) : {},
      read: false,
    };

    messages.push(newMessage);
    await writeSessionData(options.session, messages, 'messages');

    console.log(JSON.stringify({
      success: true,
      messageId: newMessage.id,
      sessionId: options.session,
      timestamp: newMessage.timestamp,
    }, null, 2));
  });

program
  .command('receive')
  .description('Receive messages from sessions')
  .option('-s, --session <id>', 'Session ID (omit for all sessions)')
  .option('-n, --namespace <ns>', 'Filter by namespace')
  .option('--since <timestamp>', 'Only messages after this ISO timestamp')
  .option('--unread-only', 'Only show unread messages')
  .action(async (options) => {
    if (!options.session) {
      // List all sessions with unread messages
      const sessions = await fs.readdir(SESSION_DIR);
      const unreadSessions = [];

      for (const sid of sessions) {
        const messages = await readSessionData(sid, 'messages');
        const unread = messages.filter(m => !m.read);
        if (unread.length > 0) {
          unreadSessions.push({
            sessionId: sid,
            unreadCount: unread.length,
            latestMessage: unread[unread.length - 1],
          });
        }
      }

      console.log(JSON.stringify({ sessions: unreadSessions }, null, 2));
      return;
    }

    let messages = await readSessionData(options.session, 'messages');

    if (options.since) {
      const sinceDate = new Date(options.since);
      messages = messages.filter(m => new Date(m.timestamp) > sinceDate);
    }

    if (options.namespace) {
      messages = messages.filter(m => m.metadata?.namespace === options.namespace);
    }

    if (options.unreadOnly) {
      messages = messages.filter(m => !m.read);
    }

    // Mark as read
    if (!options.unreadOnly) {
      const allMessages = await readSessionData(options.session, 'messages');
      allMessages.forEach(m => m.read = true);
      await writeSessionData(options.session, allMessages, 'messages');
    }

    console.log(JSON.stringify({ messages, count: messages.length }, null, 2));
  });

program
  .command('save-state')
  .description('Save session state')
  .requiredOption('-s, --session <id>', 'Session ID')
  .requiredOption('--state <json>', 'State data as JSON string')
  .option('-n, --namespace <ns>', 'State namespace', 'default')
  .action(async (options) => {
    const states = await readSessionData(options.session, 'state');
    const stateEntry = {
      id: `state-${Date.now()}`,
      timestamp: new Date().toISOString(),
      namespace: options.namespace,
      state: JSON.parse(options.state),
    };

    states.push(stateEntry);
    await writeSessionData(options.session, states, 'state');

    console.log(JSON.stringify({
      success: true,
      stateId: stateEntry.id,
      sessionId: options.session,
      namespace: options.namespace,
    }, null, 2));
  });

program
  .command('load-state')
  .description('Load session state')
  .requiredOption('-s, --session <id>', 'Session ID')
  .option('-n, --namespace <ns>', 'Filter by namespace')
  .action(async (options) => {
    let states = await readSessionData(options.session, 'state');

    if (options.namespace) {
      states = states.filter(s => s.namespace === options.namespace);
    }

    const latestState = states.length > 0 ? states[states.length - 1] : null;

    console.log(JSON.stringify({
      sessionId: options.session,
      namespace: options.namespace,
      state: latestState,
      historyCount: states.length,
    }, null, 2));
  });

program
  .command('list')
  .description('List all sessions')
  .option('--active-only', 'Only show sessions with recent activity')
  .action(async (options) => {
    const sessions = await fs.readdir(SESSION_DIR);
    const sessionInfo = [];

    for (const sessionId of sessions) {
      const messages = await readSessionData(sessionId, 'messages');
      const states = await readSessionData(sessionId, 'state');
      const unreadCount = messages.filter(m => !m.read).length;

      const lastActivity = messages.length > 0
        ? messages[messages.length - 1].timestamp
        : states.length > 0
          ? states[states.length - 1].timestamp
          : null;

      if (options.activeOnly && unreadCount === 0) continue;

      sessionInfo.push({
        sessionId,
        messageCount: messages.length,
        unreadCount,
        stateCount: states.length,
        lastActivity,
      });
    }

    console.log(JSON.stringify({ sessions: sessionInfo, total: sessionInfo.length }, null, 2));
  });

program
  .command('delete')
  .description('Delete a session')
  .requiredOption('-s, --session <id>', 'Session ID to delete')
  .option('--force', 'Skip confirmation')
  .action(async (options) => {
    if (!options.force) {
      console.error('Use --force to confirm deletion');
      process.exit(1);
    }

    const sessionPath = path.join(SESSION_DIR, options.session);
    await fs.rm(sessionPath, { recursive: true, force: true });

    console.log(JSON.stringify({ success: true, sessionId: options.session, deleted: true }, null, 2));
  });

program
  .command('watch')
  .description('Watch for new messages in real-time')
  .requiredOption('-s, --session <id>', 'Session ID to watch')
  .option('-i, --interval <ms>', 'Polling interval in milliseconds', '1000')
  .action(async (options) => {
    let lastMessageId = null;

    console.error(`Watching session ${options.session} for new messages...`);

    setInterval(async () => {
      const messages = await readSessionData(options.session, 'messages');
      const unread = messages.filter(m => !m.read);

      for (const msg of unread) {
        if (msg.id !== lastMessageId) {
          console.log(JSON.stringify({
            type: 'new_message',
            sessionId: options.session,
            message: msg,
          }, null, 2));
          lastMessageId = msg.id;
        }
      }
    }, parseInt(options.interval));
  });

program
  .command('clear')
  .description('Clear messages or state from a session')
  .requiredOption('-s, --session <id>', 'Session ID')
  .option('--messages', 'Clear messages')
  .option('--state', 'Clear state')
  .option('--all', 'Clear both messages and state')
  .action(async (options) => {
    if (options.all || options.messages) {
      await writeSessionData(options.session, [], 'messages');
      console.log(`Cleared messages for session ${options.session}`);
    }

    if (options.all || options.state) {
      await writeSessionData(options.session, [], 'state');
      console.log(`Cleared state for session ${options.session}`);
    }

    if (!options.all && !options.messages && !options.state) {
      console.error('Specify --messages, --state, or --all');
      process.exit(1);
    }
  });

program.parse();
