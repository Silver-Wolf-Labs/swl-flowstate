# MCP Setup Guide

Set up FlowState's IDE integration with Model Context Protocol.

---

## 🎯 What is MCP?

**Model Context Protocol (MCP)** allows AI assistants in your IDE to interact with external tools and services. FlowState uses MCP to let you control your productivity dashboard directly from Cursor, VS Code, or any MCP-compatible editor.

---

## 🚀 Cursor IDE Setup

### Step 1: Locate your MCP config

Cursor stores MCP configuration in:
```
~/.cursor/mcp.json
```

Or in your project:
```
./mcp-config.json
```

### Step 2: Add FlowState server

Add to your `mcp.json`:

```json
{
  "mcpServers": {
    "flowstate": {
      "command": "/absolute/path/to/swl-flowstate/src/mcp/run-server.sh",
      "args": []
    }
  }
}
```

> ⚠️ **Important**: Use the absolute path to `run-server.sh`

### Step 3: Restart Cursor

Restart your IDE to load the new MCP server.

### Step 4: Test it

Say to your AI assistant:
```
"flowstate init"
```

---

## 🔧 Troubleshooting

### "spawn npx ENOENT" Error

**Cause**: Cursor can't find Node.js (common with NVM)

**Fix**: The `run-server.sh` script handles this by loading NVM:

```bash
#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
npx tsx /path/to/flowstate-server.ts
```

### Server Not Connecting

1. Check the server is running:
   ```bash
   curl http://localhost:3000/api/flowstate
   ```

2. Verify the path in `mcp.json` is correct

3. Check Cursor's MCP logs for errors

### Mood Not Syncing to Web UI

1. Ensure the web server is running (`npm run dev`)
2. Check browser console for errors
3. The sync API polls every 500ms

---

## 📁 File Locations

| File | Purpose |
|------|---------|
| `src/mcp/flowstate-server.ts` | MCP server implementation |
| `src/mcp/run-server.sh` | Server launcher script |
| `src/app/api/flowstate/route.ts` | Sync API endpoint |
| `src/hooks/use-flowstate-sync.ts` | Web UI sync hook |
| `.flowstate-state.json` | State file (auto-created) |
| `mcp-config.json` | Cursor MCP configuration |

---

## 🔌 VS Code Setup

> Coming soon - VS Code MCP extension in development

For now, you can use the REST API directly:

```bash
# Set mood
curl -X POST http://localhost:3000/api/flowstate \
  -H "Content-Type: application/json" \
  -d '{"currentMood": "focus"}'

# Get status
curl http://localhost:3000/api/flowstate
```

---

## 🛠️ Custom Integration

### Running the MCP Server Manually

```bash
cd src/mcp
npx tsx flowstate-server.ts
```

### MCP Protocol

FlowState uses **stdio transport** - the server communicates via stdin/stdout using JSON-RPC 2.0.

### Adding Custom Tools

Edit `src/mcp/flowstate-server.ts`:

```typescript
// Add to tools list
{
  name: "my_custom_tool",
  description: "What it does",
  inputSchema: {
    type: "object",
    properties: {
      param: { type: "string" }
    }
  }
}

// Add handler in switch statement
case "my_custom_tool": {
  // Your logic here
  return { content: [{ type: "text", text: "Result" }] };
}
```

---

## 📡 Architecture

```
┌─────────────┐     stdio      ┌─────────────────┐
│   Cursor    │ ◄────────────► │  MCP Server     │
│   (IDE)     │   JSON-RPC     │  (flowstate)    │
└─────────────┘                └────────┬────────┘
                                        │
                                   HTTP POST
                                        │
                                        ▼
┌─────────────┐    polling     ┌─────────────────┐
│   Browser   │ ◄────────────► │  Next.js API    │
│   (Web UI)  │   500ms        │  /api/flowstate │
└─────────────┘                └─────────────────┘
```

---

<p align="center">
  Need help? Open an issue on GitHub.
</p>
