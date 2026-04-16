#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SESSION_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.claude-flow', 'sessions');

// Ensure session directory exists
await fs.mkdir(SESSION_DIR, { recursive: true });

// Schema definitions
const SessionMessageSchema = z.object({
  sessionId: z.string().describe('Target session ID'),
  message: z.string().describe('Message content'),
  priority: z.enum(['low', 'normal', 'high']).optional().default('normal'),
  metadata: z.record(z.any()).optional(),
});

const SessionStateSchema = z.object({
  sessionId: z.string().describe('Session ID'),
  state: z.record(z.any()).describe('State data to save'),
  namespace: z.string().optional().default('default'),
});

const SessionQuerySchema = z.object({
  sessionId: z.string().optional().describe('Specific session ID (omit for all)'),
  namespace: z.string().optional().describe('Filter by namespace'),
  since: z.string().optional().describe('ISO timestamp - only messages after this time'),
});

// Session storage helpers
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

// Tool implementations
async function sendMessage(args) {
  const { sessionId, message, priority, metadata } = SessionMessageSchema.parse(args);

  const messages = await readSessionData(sessionId, 'messages');
  const newMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    message,
    priority,
    metadata: metadata || {},
    read: false,
  };

  messages.push(newMessage);
  await writeSessionData(sessionId, messages, 'messages');

  return {
    content: [{
      type: 'text',
      text: JSON.stringify({
        success: true,
        messageId: newMessage.id,
        sessionId,
        timestamp: newMessage.timestamp,
      }, null, 2),
    }],
  };
}

async function receiveMessages(args) {
  const { sessionId, namespace, since } = SessionQuerySchema.parse(args);

  if (!sessionId) {
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

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ sessions: unreadSessions }, null, 2),
      }],
    };
  }

  let messages = await readSessionData(sessionId, 'messages');

  // Filter by timestamp if provided
  if (since) {
    const sinceDate = new Date(since);
    messages = messages.filter(m => new Date(m.timestamp) > sinceDate);
  }

  // Filter by namespace if provided
  if (namespace) {
    messages = messages.filter(m => m.metadata?.namespace === namespace);
  }

  // Mark as read
  messages.forEach(m => m.read = true);
  await writeSessionData(sessionId, messages, 'messages');

  return {
    content: [{
      type: 'text',
      text: JSON.stringify({ messages, count: messages.length }, null, 2),
    }],
  };
}

async function saveState(args) {
  const { sessionId, state, namespace } = SessionStateSchema.parse(args);

  const states = await readSessionData(sessionId, 'state');
  const stateEntry = {
    id: `state-${Date.now()}`,
    timestamp: new Date().toISOString(),
    namespace,
    state,
  };

  states.push(stateEntry);
  await writeSessionData(sessionId, states, 'state');

  return {
    content: [{
      type: 'text',
      text: JSON.stringify({
        success: true,
        stateId: stateEntry.id,
        sessionId,
        namespace,
      }, null, 2),
    }],
  };
}

async function loadState(args) {
  const { sessionId, namespace } = SessionQuerySchema.parse(args);

  if (!sessionId) {
    throw new Error('sessionId is required for loading state');
  }

  let states = await readSessionData(sessionId, 'state');

  if (namespace) {
    states = states.filter(s => s.namespace === namespace);
  }

  // Return most recent state
  const latestState = states.length > 0 ? states[states.length - 1] : null;

  return {
    content: [{
      type: 'text',
      text: JSON.stringify({
        sessionId,
        namespace,
        state: latestState,
        historyCount: states.length,
      }, null, 2),
    }],
  };
}

async function listSessions() {
  const sessions = await fs.readdir(SESSION_DIR);
  const sessionInfo = [];

  for (const sessionId of sessions) {
    const messages = await readSessionData(sessionId, 'messages');
    const states = await readSessionData(sessionId, 'state');
    const unreadCount = messages.filter(m => !m.read).length;

    sessionInfo.push({
      sessionId,
      messageCount: messages.length,
      unreadCount,
      stateCount: states.length,
      lastActivity: messages.length > 0
        ? messages[messages.length - 1].timestamp
        : states.length > 0
          ? states[states.length - 1].timestamp
          : null,
    });
  }

  return {
    content: [{
      type: 'text',
      text: JSON.stringify({ sessions: sessionInfo, total: sessionInfo.length }, null, 2),
    }],
  };
}

async function deleteSession(args) {
  const { sessionId } = z.object({ sessionId: z.string() }).parse(args);

  const sessionPath = path.join(SESSION_DIR, sessionId);
  await fs.rm(sessionPath, { recursive: true, force: true });

  return {
    content: [{
      type: 'text',
      text: JSON.stringify({ success: true, sessionId, deleted: true }, null, 2),
    }],
  };
}

// MCP Server setup
const server = new Server(
  {
    name: 'session-communicator',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'session_send_message',
      description: 'Send a message to another session for cross-session communication',
      inputSchema: {
        type: 'object',
        properties: {
          sessionId: { type: 'string', description: 'Target session ID' },
          message: { type: 'string', description: 'Message content' },
          priority: { type: 'string', enum: ['low', 'normal', 'high'], default: 'normal' },
          metadata: { type: 'object', description: 'Optional metadata' },
        },
        required: ['sessionId', 'message'],
      },
    },
    {
      name: 'session_receive_messages',
      description: 'Receive messages from other sessions. Omit sessionId to list all sessions with unread messages',
      inputSchema: {
        type: 'object',
        properties: {
          sessionId: { type: 'string', description: 'Session ID (omit for all sessions)' },
          namespace: { type: 'string', description: 'Filter by namespace' },
          since: { type: 'string', description: 'ISO timestamp - only messages after this time' },
        },
      },
    },
    {
      name: 'session_save_state',
      description: 'Save session state for later restoration',
      inputSchema: {
        type: 'object',
        properties: {
          sessionId: { type: 'string', description: 'Session ID' },
          state: { type: 'object', description: 'State data to save' },
          namespace: { type: 'string', default: 'default', description: 'State namespace' },
        },
        required: ['sessionId', 'state'],
      },
    },
    {
      name: 'session_load_state',
      description: 'Load previously saved session state',
      inputSchema: {
        type: 'object',
        properties: {
          sessionId: { type: 'string', description: 'Session ID' },
          namespace: { type: 'string', description: 'Filter by namespace' },
        },
        required: ['sessionId'],
      },
    },
    {
      name: 'session_list',
      description: 'List all sessions with their activity summary',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'session_delete',
      description: 'Delete a session and all its data',
      inputSchema: {
        type: 'object',
        properties: {
          sessionId: { type: 'string', description: 'Session ID to delete' },
        },
        required: ['sessionId'],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'session_send_message':
        return await sendMessage(args);
      case 'session_receive_messages':
        return await receiveMessages(args);
      case 'session_save_state':
        return await saveState(args);
      case 'session_load_state':
        return await loadState(args);
      case 'session_list':
        return await listSessions();
      case 'session_delete':
        return await deleteSession(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ error: error.message, stack: error.stack }, null, 2),
      }],
      isError: true,
    };
  }
});

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);

console.error('Session Communicator MCP server running on stdio');
