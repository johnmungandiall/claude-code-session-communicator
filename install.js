#!/usr/bin/env node

/**
 * Session Communicator Installation Script
 * Automatically configures the MCP server in Claude Code
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HOME = process.env.HOME || process.env.USERPROFILE;
const MCP_CONFIG_PATH = path.join(HOME, '.claude', 'mcp.json');

async function install() {
  console.log('🚀 Installing Session Communicator MCP Server...\n');

  try {
    // Read existing MCP config
    let mcpConfig = { mcpServers: {} };
    try {
      const configData = await fs.readFile(MCP_CONFIG_PATH, 'utf-8');
      mcpConfig = JSON.parse(configData);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      console.log('📝 Creating new MCP configuration file...');
    }

    // Add session-communicator server
    const serverPath = path.join(__dirname, 'index.js');
    mcpConfig.mcpServers['session-communicator'] = {
      command: 'node',
      args: [serverPath],
    };

    // Ensure .claude directory exists
    await fs.mkdir(path.dirname(MCP_CONFIG_PATH), { recursive: true });

    // Write updated config
    await fs.writeFile(MCP_CONFIG_PATH, JSON.stringify(mcpConfig, null, 2));

    console.log('✅ Session Communicator MCP Server installed successfully!\n');
    console.log('📍 Configuration location:', MCP_CONFIG_PATH);
    console.log('📍 Server location:', serverPath);
    console.log('\n📚 Available tools:');
    console.log('  - session_send_message');
    console.log('  - session_receive_messages');
    console.log('  - session_save_state');
    console.log('  - session_load_state');
    console.log('  - session_list');
    console.log('  - session_delete');
    console.log('\n🔧 CLI commands:');
    console.log('  npx session-communicator send --session <id> --message <text>');
    console.log('  npx session-communicator receive --session <id>');
    console.log('  npx session-communicator list');
    console.log('  npx session-communicator watch --session <id>');
    console.log('\n📖 Documentation: docs/session-communicator-examples.md');
    console.log('\n⚠️  Restart Claude Code to activate the MCP server');

  } catch (error) {
    console.error('❌ Installation failed:', error.message);
    process.exit(1);
  }
}

install();
