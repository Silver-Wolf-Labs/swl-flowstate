import { NextRequest, NextResponse } from "next/server";
import path from "path";
import os from "os";
import { promises as fs } from "fs";

type IDEType = "cursor" | "vscode" | "windsurf" | "intellij";

interface MCPConfig {
  mcpServers: {
    flowstate: {
      command: string;
      args: string[];
      env: Record<string, string>;
    };
  };
}

// Find the run-server.sh path
async function findRunServerPath(): Promise<string> {
  // Try common locations
  const possiblePaths = [
    // Current working directory (development)
    path.join(process.cwd(), "src/mcp/run-server.sh"),
    // Relative to this file
    path.join(__dirname, "../../../../mcp/run-server.sh"),
    // Home directory installations
    path.join(os.homedir(), "swl-flowstate/src/mcp/run-server.sh"),
    path.join(os.homedir(), "flowstate/src/mcp/run-server.sh"),
    path.join(os.homedir(), "projects/flowstate/src/mcp/run-server.sh"),
    // Common dev directories
    path.join(os.homedir(), "Developer/swl-flowstate/src/mcp/run-server.sh"),
    path.join(os.homedir(), "dev/swl-flowstate/src/mcp/run-server.sh"),
    path.join(os.homedir(), "code/swl-flowstate/src/mcp/run-server.sh"),
  ];

  for (const p of possiblePaths) {
    try {
      await fs.access(p);
      return p;
    } catch {
      // Continue to next path
    }
  }

  // Default to cwd-based path
  return path.join(process.cwd(), "src/mcp/run-server.sh");
}

// Get config file path for each IDE
function getConfigPath(ide: IDEType): string {
  const homeDir = os.homedir();
  const platform = os.platform();

  const paths: Record<string, Record<IDEType, string>> = {
    darwin: {
      cursor: `${homeDir}/.cursor/mcp.json`,
      vscode: `${homeDir}/Library/Application Support/Code/User/mcp.json`,
      windsurf: `${homeDir}/.windsurf/mcp.json`,
      intellij: `${homeDir}/Library/Application Support/JetBrains/mcp.json`,
    },
    win32: {
      cursor: `${process.env.APPDATA || homeDir + "/AppData/Roaming"}/Cursor/mcp.json`,
      vscode: `${process.env.APPDATA || homeDir + "/AppData/Roaming"}/Code/User/mcp.json`,
      windsurf: `${process.env.APPDATA || homeDir + "/AppData/Roaming"}/Windsurf/mcp.json`,
      intellij: `${process.env.APPDATA || homeDir + "/AppData/Roaming"}/JetBrains/mcp.json`,
    },
    linux: {
      cursor: `${homeDir}/.config/Cursor/mcp.json`,
      vscode: `${homeDir}/.config/Code/User/mcp.json`,
      windsurf: `${homeDir}/.config/Windsurf/mcp.json`,
      intellij: `${homeDir}/.config/JetBrains/mcp.json`,
    },
  };

  const platformPaths = paths[platform] || paths.linux;
  return platformPaths[ide];
}

// Generate MCP config for an IDE
function generateMCPConfig(runServerPath: string): MCPConfig {
  return {
    mcpServers: {
      flowstate: {
        command: runServerPath,
        args: [],
        env: {},
      },
    },
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { selectedIDEs } = body as { selectedIDEs: IDEType[] };

    if (!selectedIDEs || selectedIDEs.length === 0) {
      return NextResponse.json(
        { error: "No IDEs selected" },
        { status: 400 }
      );
    }

    const runServerPath = await findRunServerPath();
    const mcpConfig = generateMCPConfig(runServerPath);

    const configs: Record<IDEType, MCPConfig> = {} as Record<IDEType, MCPConfig>;
    const paths: Record<IDEType, string> = {} as Record<IDEType, string>;

    for (const ide of selectedIDEs) {
      configs[ide] = mcpConfig;
      paths[ide] = getConfigPath(ide);
    }

    return NextResponse.json({
      configs,
      paths,
      runServerPath,
    });
  } catch (error) {
    console.error("MCP config generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate MCP config" },
      { status: 500 }
    );
  }
}

// GET endpoint to just get the run-server.sh path
export async function GET() {
  try {
    const runServerPath = await findRunServerPath();
    return NextResponse.json({ runServerPath });
  } catch (error) {
    console.error("Error finding run-server.sh:", error);
    return NextResponse.json(
      { error: "Failed to find run-server.sh" },
      { status: 500 }
    );
  }
}

