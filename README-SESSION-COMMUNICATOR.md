# Session Communicator MCP Server

## ✨ What Was Created

A complete MCP server for cross-session communication in Claude Code with full RuFlo V3 integration.

## 📦 Package Structure

```
src/mcp-servers/session-communicator/
├── index.js              # MCP server with 6 tools
├── cli.js                # CLI with 8 commands
├── bridge.js             # Claude Code memory bridge
├── hooks.js              # Hook installer/uninstaller
├── install.js            # Auto-installer
├── demo.js               # Interactive demo
├── integration-test.js   # Integration tests (8 tests, 100% pass)
├── package.json          # Package configuration
├── vitest.config.js      # Test configuration
└── README.md             # Complete documentation
```

## 🎯 Core Features

### 1. MCP Tools (6 tools)
- `session_send_message` - Send messages between sessions
- `session_receive_messages` - Receive and filter messages
- `session_save_state` - Save session state
- `session_load_state` - Load session state
- `session_list` - List all sessions
- `session_delete` - Delete sessions

### 2. CLI Commands (8 commands)
- `send` - Send message to session
- `receive` - Receive messages from session
- `save-state` - Save session state
- `load-state` - Load session state
- `list` - List all sessions
- `delete` - Delete session
- `watch` - Watch for new messages in real-time
- `clear` - Clear session data

### 3. Integration Tools
- **Bridge** - Connect with Claude Code memory system
- **Hooks** - Automatic state management via Claude Code hooks

## 🚀 Quick Start

```bash
# Already installed and configured!
# MCP server is in: ~/.claude/mcp.json
# Hooks are in: ~/.claude/hooks/

# Run demo
cd C:/Users/Johnx/src/mcp-servers/session-communicator
npm run demo

# Run tests
npm run test:integration
```

## 📝 Usage Examples

### In Claude Code (MCP Tools)

```javascript
// Send message
await mcp__session-communicator__session_send_message({
  sessionId: "worker-1",
  message: "Task completed",
  priority: "high"
});

// Receive messages
const msgs = await mcp__session-communicator__session_receive_messages({
  sessionId: "worker-1"
});

// Save state
await mcp__session-communicator__session_save_state({
  sessionId: "current",
  state: { agents: ["coder"], tasks: [] }
});

// Load state
const state = await mcp__session-communicator__session_load_state({
  sessionId: "current"
});
```

### CLI Commands

```bash
# Send message
npx session-communicator send -s session-id -m "message"

# Receive messages
npx session-communicator receive -s session-id

# Watch for messages
npx session-communicator watch -s session-id

# List sessions
npx session-communicator list
```

## 🔗 Integration Features

### Memory Bridge
```bash
# Import Claude Code memories into session
node bridge.js import my-session

# Export session state to project
node bridge.js export my-session my-project

# Bidirectional sync
node bridge.js sync my-session my-project
```

### Automatic Hooks
When installed, hooks automatically:
- **session-start**: Restore previous session state
- **session-end**: Save current session state
- **post-task**: Notify coordinator of task completion

## ✅ Test Results

```
🚀 Session Communicator Integration Tests

✅ Send and receive messages
✅ Save and load state
✅ List sessions
✅ Priority message handling
✅ Namespace filtering
✅ Delete session
✅ Clear session data
✅ Unread message tracking

Success Rate: 100.0%
```

## 🎬 Demo Output

```
📨 Demo 1: Basic Messaging
✓ Sent message to demo-session
✓ Received 1 message(s)

🚨 Demo 2: Priority Messaging
✓ Sent 3 messages with different priorities
🔴 [high] URGENT: Critical error!
🟡 [normal] Normal task
🟢 [low] Low priority task

💾 Demo 3: State Management
✓ Saved swarm state
✓ Loaded swarm state:
  Topology: hierarchical
  Active Agents: 3
  Tasks in Queue: 3

🤝 Demo 4: Multi-Session Coordination
✓ Coordinator distributing tasks to workers...
✓ Workers reporting back...
✓ Coordinator received 3 completion reports
```

## 📚 Documentation

- **README.md** - Complete feature documentation
- **examples.md** - 13 detailed usage examples
- **quickref.md** - Quick reference guide
- **complete.md** - Full implementation details
- **summary.md** - Implementation summary

## 🔧 Configuration

### MCP Server
Automatically configured in `~/.claude/mcp.json`:
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

### Hooks
Installed in `~/.claude/hooks/`:
- `session-start` - Auto-restore state
- `session-end` - Auto-save state
- `post-task` - Task notifications

## 💾 Storage

Session data stored in `~/.claude-flow/sessions/`:
```
~/.claude-flow/sessions/
├── session-abc123/
│   ├── messages.json
│   └── state.json
└── session-def456/
    ├── messages.json
    └── state.json
```

## 🎯 Use Cases

1. **Multi-Session Swarm Coordination**
   - Distribute tasks across worker sessions
   - Collect results from workers
   - Coordinate complex workflows

2. **Session State Restoration**
   - Save work in progress
   - Resume from previous session
   - Maintain context across restarts

3. **Cross-Session Communication**
   - Send messages between sessions
   - Priority-based task queuing
   - Real-time notifications

4. **Memory Synchronization**
   - Bridge Claude Code and AgentDB
   - Unified memory across systems
   - Persistent knowledge base

## 🔐 Security

- Sessions isolated by ID
- No cross-session data leakage
- Local filesystem storage only
- No network communication

## ⚡ Next Steps

1. **Restart Claude Code** to activate the MCP server
2. **Try the demo**: `npm run demo`
3. **Read examples**: `docs/session-communicator-examples.md`
4. **Use in swarms** for multi-session coordination

## 📦 NPM Scripts

```bash
npm start              # Start MCP server
npm run dev            # Development mode with watch
npm test               # Run unit tests
npm run test:watch     # Watch mode for tests
npm run test:integration  # Run integration tests
npm run demo           # Run interactive demo
npm run hooks:install  # Install Claude Code hooks
npm run hooks:uninstall  # Uninstall hooks
```

---

**Status**: ✅ Complete and ready to use!

The Session Communicator MCP server is fully implemented, tested, documented, and integrated with Claude Code. Restart Claude Code to start using it.
