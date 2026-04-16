# Session Communicator MCP Server

A Model Context Protocol (MCP) server for cross-session communication and state management in Claude Code.

## Quick Start

```bash
# Install
cd src/mcp-servers/session-communicator
npm install

# The MCP server is automatically configured in ~/.claude/mcp.json

# Restart Claude Code to activate
```

## Features

✅ **Cross-Session Messaging** - Send and receive messages between different Claude Code sessions  
✅ **State Persistence** - Save and restore session state across sessions  
✅ **Priority Queuing** - Support for low/normal/high priority messages  
✅ **Namespace Filtering** - Organize messages and state by namespace  
✅ **Real-Time Watching** - Monitor sessions for new messages in real-time  
✅ **Session Management** - List, query, and delete sessions  
✅ **CLI & MCP Tools** - Use via Claude Code MCP tools or command-line interface

## MCP Tools

### session_send_message
Send a message to another session.

```javascript
mcp__session-communicator__session_send_message({
  sessionId: "target-session-id",
  message: "Task completed successfully",
  priority: "high",
  metadata: {
    taskId: "task-123",
    result: "success"
  }
})
```

### session_receive_messages
Receive messages from sessions.

```javascript
// Get messages for specific session
mcp__session-communicator__session_receive_messages({
  sessionId: "my-session-id",
  since: "2026-04-16T10:00:00Z"
})

// List all sessions with unread messages
mcp__session-communicator__session_receive_messages({})
```

### session_save_state
Save session state for later restoration.

```javascript
mcp__session-communicator__session_save_state({
  sessionId: "my-session-id",
  state: {
    activeAgents: ["coder", "reviewer"],
    taskQueue: ["task-1", "task-2"],
    metrics: { tokensUsed: 5000 }
  },
  namespace: "swarm-state"
})
```

### session_load_state
Load previously saved session state.

```javascript
mcp__session-communicator__session_load_state({
  sessionId: "my-session-id",
  namespace: "swarm-state"
})
```

### session_list
List all sessions with activity summary.

```javascript
mcp__session-communicator__session_list({})
```

### session_delete
Delete a session and all its data.

```javascript
mcp__session-communicator__session_delete({
  sessionId: "old-session-id"
})
```

## CLI Commands

```bash
# Send a message
npx session-communicator send \
  --session target-session \
  --message "Hello from CLI" \
  --priority high

# Receive messages
npx session-communicator receive --session my-session

# List all sessions with unread messages
npx session-communicator receive

# Save state
npx session-communicator save-state \
  --session my-session \
  --namespace swarm \
  --state '{"agents":["coder","reviewer"]}'

# Load state
npx session-communicator load-state \
  --session my-session \
  --namespace swarm

# List all sessions
npx session-communicator list

# Watch for new messages in real-time
npx session-communicator watch --session my-session

# Delete a session
npx session-communicator delete --session old-session --force

# Clear session data
npx session-communicator clear --session my-session --all
```

## Use Cases

### 1. Multi-Session Swarm Coordination

```javascript
// Coordinator session distributes tasks
const workers = ["worker-1", "worker-2", "worker-3"];

for (const worker of workers) {
  await mcp__session-communicator__session_send_message({
    sessionId: worker,
    message: "Process batch",
    metadata: { batchId: `batch-${worker}` }
  });
}

// Workers report back
await mcp__session-communicator__session_send_message({
  sessionId: "coordinator",
  message: "Batch completed",
  metadata: { recordsProcessed: 1000 }
});
```

### 2. Session State Restoration

```javascript
// Save state before ending session
await mcp__session-communicator__session_save_state({
  sessionId: "current-session",
  state: {
    swarmTopology: "hierarchical",
    activeAgents: ["coder-1", "reviewer-1"],
    completedTasks: 15
  }
});

// Restore in new session
const restored = await mcp__session-communicator__session_load_state({
  sessionId: "current-session"
});
```

### 3. Priority-Based Task Queue

```javascript
// Send high-priority alert
await mcp__session-communicator__session_send_message({
  sessionId: "worker-1",
  message: "Critical error detected",
  priority: "high"
});

// Process messages by priority
const messages = await mcp__session-communicator__session_receive_messages({
  sessionId: "worker-1"
});

const highPriority = messages.messages.filter(m => m.priority === "high");
```

## Storage

Session data is stored in `~/.claude-flow/sessions/`:

```
~/.claude-flow/sessions/
├── session-abc123/
│   ├── messages.json
│   └── state.json
└── session-def456/
    ├── messages.json
    └── state.json
```

## Integration with RuFlo

Works seamlessly with RuFlo V3:

- Complements `memory_store` and `memory_search` for unified memory
- Integrates with `hooks_session-start` and `hooks_session-end` hooks
- Enables cross-session swarm coordination
- Supports distributed agent communication

## Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm test -- --coverage
```

## Development

```bash
# Start in development mode with auto-reload
npm run dev

# Run the MCP server
npm start
```

## Configuration

The MCP server is automatically configured in `~/.claude/mcp.json`:

```json
{
  "mcpServers": {
    "session-communicator": {
      "command": "node",
      "args": ["C:/Users/Johnx/src/mcp-servers/session-communicator/index.js"]
    }
  }
}
```

## Documentation

- [Examples](../../../docs/session-communicator-examples.md) - Comprehensive usage examples
- [README](./README.md) - This file

## Security

- Sessions are isolated by ID
- No cross-session data leakage
- Local filesystem storage only
- No network communication
- Sensitive data should be encrypted before storing

## License

MIT

## Support

- Issues: https://github.com/ruvnet/ruflo/issues
- Documentation: https://github.com/ruvnet/ruflo
