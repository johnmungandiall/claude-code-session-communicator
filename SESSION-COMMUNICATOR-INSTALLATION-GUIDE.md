# Session Communicator MCP Server - Installation & Usage Guide

## 🚀 Installation Verification

### ✅ What's Already Installed

The Session Communicator MCP Server is **fully installed and configured**:

```
✅ MCP Server: ~/.claude/mcp.json
✅ Hooks: ~/.claude/hooks/ (3 hooks)
✅ Dependencies: 161 packages
✅ Tests: 8/8 passing (100%)
✅ Demo: 6/6 scenarios working
✅ Documentation: 13 files (English + Telugu)
```

### 📁 Installation Locations

```
C:/Users/Johnx/
├── src/mcp-servers/session-communicator/    # Core implementation
├── docs/                                      # Documentation
├── tests/                                     # Test files
├── .claude/
│   ├── mcp.json                              # MCP configuration
│   └── hooks/                                # Installed hooks
└── SESSION-COMMUNICATOR-*.md                 # Quick reference files
```

---

## 🎯 Quick Start (5 Minutes)

### Step 1: Restart Claude Code

⚠️ **IMPORTANT**: You must restart Claude Code to activate the MCP server.

```bash
# Close Claude Code completely
# Then reopen it
```

### Step 2: Verify Installation

After restart, check if the MCP server is active:

```javascript
// Try listing sessions
const sessions = await mcp__session-communicator__session_list({});
console.log('MCP server is active!', sessions);
```

### Step 3: Send Your First Message

```javascript
// Send a test message
await mcp__session-communicator__session_send_message({
  sessionId: "test-session",
  message: "Hello from Session Communicator!",
  priority: "normal"
});

// Receive the message
const messages = await mcp__session-communicator__session_receive_messages({
  sessionId: "test-session"
});

console.log('Received:', messages.messages[0].message);
```

---

## 💻 Using the CLI

### Basic Commands

```bash
# Navigate to the installation directory
cd C:/Users/Johnx/src/mcp-servers/session-communicator

# Send a message
npx session-communicator send \
  --session my-session \
  --message "Hello World" \
  --priority normal

# Receive messages
npx session-communicator receive --session my-session

# List all sessions
npx session-communicator list

# Save state
npx session-communicator save-state \
  --session my-session \
  --state '{"key":"value"}'

# Load state
npx session-communicator load-state --session my-session

# Watch for new messages (real-time)
npx session-communicator watch --session my-session

# Delete a session
npx session-communicator delete --session old-session --force

# Clear session data
npx session-communicator clear --session my-session --all
```

---

## 🎬 Running the Demo

### Interactive Demo

```bash
cd C:/Users/Johnx/src/mcp-servers/session-communicator
npm run demo
```

**What the demo shows:**
1. Basic messaging between sessions
2. Priority-based message handling
3. State save and restore
4. Multi-session coordination
5. Session management
6. Cleanup operations

### Expected Output

```
🎬 Session Communicator Demo

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
✓ Loaded swarm state

... and more
```

---

## 🧪 Running Tests

### Integration Tests

```bash
cd C:/Users/Johnx/src/mcp-servers/session-communicator
npm run test:integration
```

**Expected Result:**
```
✅ Passed: 8
❌ Failed: 0
📈 Success Rate: 100.0%
```

### Unit Tests

```bash
npm test
```

---

## 📚 Documentation Quick Access

### English Documentation

| File | Purpose | Read Time |
|------|---------|-----------|
| `README-SESSION-COMMUNICATOR.md` | Project overview | 5 min |
| `docs/session-communicator-quickref.md` | Quick reference | 10 min |
| `docs/session-communicator-examples.md` | 13 examples | 30 min |
| `docs/session-communicator-complete.md` | Complete guide | 60 min |

### Telugu Documentation (తెలుగు)

| ఫైల్ | ఉద్దేశం | చదవడానికి సమయం |
|------|---------|-----------------|
| `docs/session-communicator-quickref-telugu.md` | త్వరిత సూచన | 10 నిమిషాలు |
| `docs/session-communicator-usage-telugu.md` | వినియోగ మార్గదర్శి | 45 నిమిషాలు |
| `docs/session-communicator-advanced-telugu.md` | అధునాతన ఉదాహరణలు | 60 నిమిషాలు |

---

## 🎯 Common Use Cases

### Use Case 1: Basic Message Exchange

```javascript
// Session A sends a message
await mcp__session-communicator__session_send_message({
  sessionId: "session-b",
  message: "Task completed successfully",
  priority: "high",
  metadata: {
    taskId: "task-123",
    result: "success"
  }
});

// Session B receives the message
const messages = await mcp__session-communicator__session_receive_messages({
  sessionId: "session-b"
});

console.log(messages.messages[0].message);
// Output: "Task completed successfully"
```

### Use Case 2: State Persistence

```javascript
// Before ending session - save state
await mcp__session-communicator__session_save_state({
  sessionId: "current-session",
  state: {
    activeAgents: ["coder-1", "reviewer-1"],
    taskQueue: ["task-1", "task-2"],
    completedTasks: 15
  },
  namespace: "swarm-state"
});

// In new session - restore state
const restored = await mcp__session-communicator__session_load_state({
  sessionId: "current-session",
  namespace: "swarm-state"
});

console.log(restored.state.state.activeAgents);
// Output: ["coder-1", "reviewer-1"]
```

### Use Case 3: Multi-Session Coordination

```javascript
// Coordinator distributes tasks to workers
const workers = ["worker-1", "worker-2", "worker-3"];

for (const worker of workers) {
  await mcp__session-communicator__session_send_message({
    sessionId: worker,
    message: "Process your assigned batch",
    metadata: {
      coordinator: "coordinator-session",
      batchId: `batch-${worker}`
    }
  });
}

// Workers report back
// (In worker session)
await mcp__session-communicator__session_send_message({
  sessionId: "coordinator-session",
  message: "Batch processing completed",
  metadata: {
    workerId: "worker-1",
    recordsProcessed: 1000
  }
});

// Coordinator collects results
const results = await mcp__session-communicator__session_receive_messages({
  sessionId: "coordinator-session"
});

console.log(`Received ${results.count} completion reports`);
```

---

## 🔧 Configuration Details

### MCP Server Configuration

**Location**: `~/.claude/mcp.json`

```json
{
  "mcpServers": {
    "session-communicator": {
      "command": "node",
      "args": [
        "C:/Users/Johnx/src/mcp-servers/session-communicator/index.js"
      ]
    }
  }
}
```

### Hook Configuration

**Location**: `~/.claude/hooks/`

**Installed Hooks:**

1. **session-start** - Automatically restores previous session state
2. **session-end** - Automatically saves current session state
3. **post-task** - Notifies coordinator sessions of task completion

**To manage hooks:**

```bash
# Install hooks
cd C:/Users/Johnx/src/mcp-servers/session-communicator
npm run hooks:install

# Uninstall hooks
npm run hooks:uninstall
```

---

## 🔍 Troubleshooting

### Issue 1: MCP Server Not Found

**Symptom**: `mcp__session-communicator__*` tools not available

**Solution**:
1. Verify MCP configuration: `cat ~/.claude/mcp.json`
2. Restart Claude Code completely
3. Check server path is correct

### Issue 2: CLI Commands Not Working

**Symptom**: `npx session-communicator` command not found

**Solution**:
```bash
# Navigate to installation directory
cd C:/Users/Johnx/src/mcp-servers/session-communicator

# Verify installation
npm list

# Reinstall if needed
npm install
```

### Issue 3: Hooks Not Triggering

**Symptom**: State not auto-saving/restoring

**Solution**:
```bash
# Reinstall hooks
cd C:/Users/Johnx/src/mcp-servers/session-communicator
npm run hooks:uninstall
npm run hooks:install

# Verify hooks exist
ls -la ~/.claude/hooks/
```

### Issue 4: Tests Failing

**Symptom**: Integration tests not passing

**Solution**:
```bash
# Clean and reinstall
cd C:/Users/Johnx/src/mcp-servers/session-communicator
rm -rf node_modules package-lock.json
npm install

# Run tests again
npm run test:integration
```

---

## 📊 Monitoring & Debugging

### Check Session Storage

```bash
# View all sessions
ls -la ~/.claude-flow/sessions/

# View specific session
cat ~/.claude-flow/sessions/my-session/messages.json
cat ~/.claude-flow/sessions/my-session/state.json
```

### Enable Debug Mode

```bash
# Set debug environment variable
export DEBUG=session-communicator:*

# Run CLI with debug output
npx session-communicator list
```

### View Logs

```bash
# Check hook execution logs
tail -f ~/.claude/logs/hooks.log

# Check MCP server logs
tail -f ~/.claude/logs/mcp.log
```

---

## 🎓 Learning Path

### Beginner (2-3 hours)

1. **Read**: `README-SESSION-COMMUNICATOR.md` (10 min)
2. **Read**: `docs/session-communicator-quickref.md` (15 min)
3. **Try**: Run the demo (10 min)
4. **Practice**: Send and receive messages (30 min)
5. **Practice**: Save and load state (30 min)
6. **Read**: Basic examples (45 min)

### Intermediate (4-5 hours)

1. **Read**: `docs/session-communicator-complete.md` (60 min)
2. **Read**: `docs/session-communicator-examples.md` (60 min)
3. **Practice**: Multi-session coordination (90 min)
4. **Practice**: Integration with hooks (30 min)
5. **Build**: Simple coordinator-worker system (60 min)

### Advanced (6+ hours)

1. **Read**: `docs/session-communicator-advanced-telugu.md` (90 min)
2. **Study**: Advanced patterns (120 min)
3. **Build**: Production swarm system (180 min)
4. **Integrate**: With RuFlo V3 (60 min)

---

## 🌐 Language Support

### Switch to Telugu Documentation

```bash
# Quick reference in Telugu
cat docs/session-communicator-quickref-telugu.md

# Complete usage guide in Telugu
cat docs/session-communicator-usage-telugu.md

# Advanced examples in Telugu
cat docs/session-communicator-advanced-telugu.md
```

---

## 📞 Getting Help

### Documentation

- **Quick Start**: `README-SESSION-COMMUNICATOR.md`
- **Quick Reference**: `docs/session-communicator-quickref.md`
- **Complete Guide**: `docs/session-communicator-complete.md`
- **Examples**: `docs/session-communicator-examples.md`
- **Telugu Docs**: `docs/session-communicator-*-telugu.md`

### Support Channels

- **Issues**: https://github.com/ruvnet/ruflo/issues
- **Demo**: `npm run demo`
- **Tests**: `npm run test:integration`

### Quick Commands Reference

```bash
# Demo
npm run demo

# Tests
npm run test:integration

# Hooks
npm run hooks:install
npm run hooks:uninstall

# CLI
npx session-communicator --help
```

---

## ✅ Verification Checklist

Before using Session Communicator, verify:

- [ ] Claude Code has been restarted
- [ ] MCP server appears in Claude Code settings
- [ ] `mcp__session-communicator__*` tools are available
- [ ] Demo runs successfully
- [ ] Tests pass (100%)
- [ ] Hooks are installed (optional)
- [ ] Documentation is accessible

---

## 🎉 You're Ready!

Session Communicator MCP Server is now fully installed and ready to use.

**Next Steps:**
1. ✅ Restart Claude Code (if not done)
2. ✅ Try the demo: `npm run demo`
3. ✅ Read quick reference
4. ✅ Start building!

**Happy coding with Session Communicator!** 🚀

---

*Session Communicator MCP Server v1.0.0*  
*Installation & Usage Guide*  
*Built for Claude Code with RuFlo V3 Integration*
