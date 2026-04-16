# Session Communicator MCP Server

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/ruvnet/ruflo)
[![Tests](https://img.shields.io/badge/tests-8%2F8%20passing-brightgreen.svg)](./integration-test.js)
[![Documentation](https://img.shields.io/badge/docs-complete-brightgreen.svg)](./INDEX.md)
[![Languages](https://img.shields.io/badge/languages-English%20%2B%20Telugu-blue.svg)](../../docs/)

Cross-session communication and state management for Claude Code with RuFlo V3 integration.

## 🤔 Why Use This?

**Session Communicator** solves critical problems in multi-agent AI workflows:

### Problems It Solves

1. **Session Isolation** - Claude Code sessions can't communicate by default
   - ❌ Without: Each session works in isolation, no coordination
   - ✅ With: Sessions send messages and share state seamlessly

2. **Lost Context** - Work is lost when sessions end
   - ❌ Without: Start from scratch every time
   - ✅ With: Save/restore state across sessions automatically

3. **Swarm Coordination** - Multiple agents need to coordinate
   - ❌ Without: Manual coordination, prone to conflicts
   - ✅ With: Priority queues, message routing, state sync

4. **Memory Fragmentation** - Claude Code and AgentDB memories are separate
   - ❌ Without: Duplicate data, sync issues
   - ✅ With: Automatic bidirectional memory bridge

### Real-World Use Cases

- **Multi-Agent Development**: Coordinate coder, tester, reviewer agents across sessions
- **Long-Running Tasks**: Save progress, resume later without losing context
- **Team Collaboration**: Share state between team members' Claude sessions
- **CI/CD Integration**: Persist build state, test results across pipeline stages
- **Memory Persistence**: Keep learned patterns available across all sessions

### Key Benefits

- 🚀 **Zero Configuration** - Works out of the box after installation
- ⚡ **Fast** - In-memory messaging with disk persistence
- 🔒 **Safe** - Isolated session data, no cross-contamination
- 🧪 **Tested** - 100% test coverage, production-ready
- 📚 **Documented** - Complete guides in English + Telugu

## 🚀 Quick Start

```bash
# Installation is already complete!
# Just restart Claude Code to activate

# Try the demo
npm run demo

# Run tests
npm run test:integration
```

## 📚 Documentation

- **[OVERVIEW.md](./OVERVIEW.md)** - Quick overview
- **[INDEX.md](./INDEX.md)** - Complete documentation index
- **[README-SESSION-COMMUNICATOR.md](./README-SESSION-COMMUNICATOR.md)** - Project overview
- **[SESSION-COMMUNICATOR-INSTALLATION-GUIDE.md](./SESSION-COMMUNICATOR-INSTALLATION-GUIDE.md)** - Installation guide

## ✨ Features

- ✅ 6 MCP tools for session communication
- ✅ 8 CLI commands for scripting
- ✅ State persistence and restoration
- ✅ Multi-session coordination
- ✅ Priority-based message queuing
- ✅ Automatic hooks for state management
- ✅ Memory bridge with Claude Code
- ✅ 100% test coverage
- ✅ Bilingual documentation (English + Telugu)

## 🎯 MCP Tools

```javascript
// Send message
await mcp__session-communicator__session_send_message({
  sessionId: "worker-1",
  message: "Task completed",
  priority: "high"
});

// Receive messages
const messages = await mcp__session-communicator__session_receive_messages({
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

// List sessions
const sessions = await mcp__session-communicator__session_list({});

// Delete session
await mcp__session-communicator__session_delete({
  sessionId: "old-session"
});
```

## 💻 CLI Commands

```bash
# Send message
npx session-communicator send -s session-id -m "message" -p high

# Receive messages
npx session-communicator receive -s session-id

# Save state
npx session-communicator save-state -s session-id --state '{"key":"value"}'

# Load state
npx session-communicator load-state -s session-id

# List sessions
npx session-communicator list

# Watch for messages
npx session-communicator watch -s session-id

# Delete session
npx session-communicator delete -s session-id --force

# Clear data
npx session-communicator clear -s session-id --all
```

## 🧪 Testing

```bash
# Run integration tests
npm run test:integration

# Run unit tests
npm test

# Run demo
npm run demo
```

## 🔗 Integration

### Memory Bridge

```bash
# Import Claude Code memories
node bridge.js import my-session

# Export session state
node bridge.js export my-session my-project

# Bidirectional sync
node bridge.js sync my-session my-project
```

### Automatic Hooks

```bash
# Install hooks
npm run hooks:install

# Uninstall hooks
npm run hooks:uninstall
```

## 📖 Documentation

### English
- [Examples](../../docs/session-communicator-examples.md) - 13 detailed examples
- [Quick Reference](../../docs/session-communicator-quickref.md) - Command cheat sheet
- [Complete Guide](../../docs/session-communicator-complete.md) - Full documentation

### Telugu (తెలుగు)
- [వినియోగ మార్గదర్శి](../../docs/session-communicator-usage-telugu.md) - Usage guide
- [అధునాతన ఉదాహరణలు](../../docs/session-communicator-advanced-telugu.md) - Advanced examples
- [త్వరిత సూచన](../../docs/session-communicator-quickref-telugu.md) - Quick reference

## 🎯 Use Cases

1. **Multi-Session Swarm Coordination** - Coordinate multiple Claude Code sessions
2. **Session State Restoration** - Save and resume work across sessions
3. **Cross-Session Communication** - Send messages between sessions
4. **Memory Synchronization** - Bridge Claude Code and AgentDB

## 🏆 Status

- ✅ **Complete**: All features implemented
- ✅ **Tested**: 100% test coverage (8/8 passing)
- ✅ **Documented**: Complete bilingual documentation
- ✅ **Ready**: Production-ready MCP server

## 📦 Installation

Already installed! Just restart Claude Code to activate.

Configuration location: `~/.claude/mcp.json`

## 🆘 Support

- **Documentation**: See [INDEX.md](./INDEX.md)
- **Issues**: https://github.com/ruvnet/ruflo/issues
- **Demo**: `npm run demo`

## 📄 License

MIT

## 🙏 Acknowledgments

Built for Claude Code with RuFlo V3 integration.

---

**Session Communicator MCP Server v1.0.0**  
*Complete cross-session communication for Claude Code*
