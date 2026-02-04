import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import os from "os";

type IDEType = "cursor" | "vscode" | "windsurf" | "intellij";

interface DetectedIDE {
  id: IDEType;
  name: string;
  detected: boolean;
  configPath: string;
  icon: string;
}

// IDE configuration paths by OS
function getIDEPaths(): Record<IDEType, { paths: string[]; configDir: string; name: string; icon: string }> {
  const homeDir = os.homedir();
  const platform = os.platform();

  if (platform === "darwin") {
    // macOS
    return {
      cursor: {
        paths: ["/Applications/Cursor.app", `${homeDir}/Applications/Cursor.app`],
        configDir: `${homeDir}/.cursor`,
        name: "Cursor",
        icon: "🖱️",
      },
      vscode: {
        paths: [
          "/Applications/Visual Studio Code.app",
          `${homeDir}/Applications/Visual Studio Code.app`,
        ],
        configDir: `${homeDir}/Library/Application Support/Code/User`,
        name: "VS Code",
        icon: "💻",
      },
      windsurf: {
        paths: ["/Applications/Windsurf.app", `${homeDir}/Applications/Windsurf.app`],
        configDir: `${homeDir}/.windsurf`,
        name: "Windsurf",
        icon: "🏄",
      },
      intellij: {
        paths: [
          "/Applications/IntelliJ IDEA.app",
          "/Applications/IntelliJ IDEA CE.app",
          `${homeDir}/Applications/IntelliJ IDEA.app`,
        ],
        configDir: `${homeDir}/Library/Application Support/JetBrains`,
        name: "IntelliJ IDEA",
        icon: "🧠",
      },
    };
  } else if (platform === "win32") {
    // Windows
    const appData = process.env.APPDATA || `${homeDir}/AppData/Roaming`;
    const localAppData = process.env.LOCALAPPDATA || `${homeDir}/AppData/Local`;
    return {
      cursor: {
        paths: [
          `${localAppData}/Programs/Cursor/Cursor.exe`,
          `C:/Program Files/Cursor/Cursor.exe`,
        ],
        configDir: `${appData}/Cursor`,
        name: "Cursor",
        icon: "🖱️",
      },
      vscode: {
        paths: [
          `${localAppData}/Programs/Microsoft VS Code/Code.exe`,
          `C:/Program Files/Microsoft VS Code/Code.exe`,
        ],
        configDir: `${appData}/Code/User`,
        name: "VS Code",
        icon: "💻",
      },
      windsurf: {
        paths: [
          `${localAppData}/Programs/Windsurf/Windsurf.exe`,
          `C:/Program Files/Windsurf/Windsurf.exe`,
        ],
        configDir: `${appData}/Windsurf`,
        name: "Windsurf",
        icon: "🏄",
      },
      intellij: {
        paths: [
          `C:/Program Files/JetBrains/IntelliJ IDEA/bin/idea64.exe`,
          `${localAppData}/JetBrains/Toolbox/apps/IDEA-U`,
        ],
        configDir: `${appData}/JetBrains`,
        name: "IntelliJ IDEA",
        icon: "🧠",
      },
    };
  } else {
    // Linux
    return {
      cursor: {
        paths: ["/usr/bin/cursor", `${homeDir}/.local/bin/cursor`],
        configDir: `${homeDir}/.config/Cursor`,
        name: "Cursor",
        icon: "🖱️",
      },
      vscode: {
        paths: ["/usr/bin/code", "/usr/share/code/code"],
        configDir: `${homeDir}/.config/Code/User`,
        name: "VS Code",
        icon: "💻",
      },
      windsurf: {
        paths: ["/usr/bin/windsurf", `${homeDir}/.local/bin/windsurf`],
        configDir: `${homeDir}/.config/Windsurf`,
        name: "Windsurf",
        icon: "🏄",
      },
      intellij: {
        paths: [
          "/usr/bin/idea",
          `${homeDir}/.local/share/JetBrains/Toolbox/apps/IDEA-U`,
        ],
        configDir: `${homeDir}/.config/JetBrains`,
        name: "IntelliJ IDEA",
        icon: "🧠",
      },
    };
  }
}

async function checkPathExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function detectIDE(
  id: IDEType,
  config: { paths: string[]; configDir: string; name: string; icon: string }
): Promise<DetectedIDE> {
  let detected = false;

  for (const p of config.paths) {
    if (await checkPathExists(p)) {
      detected = true;
      break;
    }
  }

  // Also check if config directory exists (IDE was used before)
  if (!detected && (await checkPathExists(config.configDir))) {
    detected = true;
  }

  return {
    id,
    name: config.name,
    detected,
    configPath: path.join(config.configDir, "mcp.json"),
    icon: config.icon,
  };
}

export async function GET() {
  try {
    const idePaths = getIDEPaths();
    const detectionPromises = Object.entries(idePaths).map(([id, config]) =>
      detectIDE(id as IDEType, config)
    );

    const ides = await Promise.all(detectionPromises);

    return NextResponse.json({ ides });
  } catch (error) {
    console.error("IDE detection error:", error);
    return NextResponse.json({ error: "Failed to detect IDEs" }, { status: 500 });
  }
}

