# Session Communicator MCP Server

## 📁 Project Files

This directory contains all the summary and overview documentation for the Session Communicator MCP Server.

### Quick Access Files

- **README-SESSION-COMMUNICATOR.md** - Project overview and quick start
- **SESSION-COMMUNICATOR-COMPLETE.md** - Complete project summary
- **SESSION-COMMUNICATOR-PROJECT-COMPLETE.md** - Comprehensive report
- **SESSION-COMMUNICATOR-INSTALLATION-GUIDE.md** - Installation and usage guide
- **SESSION-COMMUNICATOR-FILE-INVENTORY.md** - Complete file inventory

### Main Documentation

For complete documentation, see:
- `docs/` directory - All English and Telugu documentation
- `README.md` - Technical documentation
- Online: https://github.com/ruvnet/ruflo

### Quick Start

```bash
# Run demo
npm run demo

# Run tests
npm run test:integration

# Install hooks
npm run hooks:install
```

### MCP Tools

After restarting Claude Code, use these tools:

```javascript
// Send message
await mcp__session-communicator__session_send_message({
  sessionId: "worker-1",
  message: "Hello!"
});

// Receive messages
await mcp__session-communicator__session_receive_messages({
  sessionId: "worker-1"
});

// Save state
await mcp__session-communicator__session_save_state({
  sessionId: "current",
  state: { key: "value" }
});

// Load state
await mcp__session-communicator__session_load_state({
  sessionId: "current"
});

// List sessions
await mcp__session-communicator__session_list({});

// Delete session
await mcp__session-communicator__session_delete({
  sessionId: "old-session"
});
```

### CLI Commands

```bash
# Send message
npx session-communicator send -s session-id -m "message"

# Receive messages
npx session-communicator receive -s session-id

# List sessions
npx session-communicator list

# Watch for messages
npx session-communicator watch -s session-id
```

### Status

✅ **Complete and Ready to Use**

- MCP Server: Configured
- Hooks: Installed
- Tests: 100% passing
- Demo: Working
- Documentation: Complete (English + Telugu)

### Next Step

⚠️ **Restart Claude Code** to activate the MCP server!
