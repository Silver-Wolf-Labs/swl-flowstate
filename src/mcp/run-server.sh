#!/bin/bash

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Run the FlowState MCP server
npx tsx /Users/fabriziomendez/swl-flowstate/src/mcp/flowstate-server.ts
