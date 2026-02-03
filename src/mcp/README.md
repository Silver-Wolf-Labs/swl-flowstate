# FlowState MCP Server

An MCP (Model Context Protocol) server that integrates FlowState productivity features with IDEs like Cursor, VS Code, and other MCP-compatible tools.

## Documentation

For complete documentation, see the [Developer Guide](../../docs/DEVELOPER-GUIDE.md).

## Quick Start

```bash
# Run the server manually
npx tsx flowstate-server.ts
```

## Files

| File | Purpose |
|------|---------|
| `flowstate-server.ts` | MCP server implementation |
| `run-server.sh` | Server launcher script (handles NVM) |

## Requirements

- Node.js 18+
- tsx (installed via npx)
