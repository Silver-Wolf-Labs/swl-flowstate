// Setup wizard types and interfaces

export type SetupStep = 'welcome' | 'env-vars' | 'ide-detection' | 'mcp-config' | 'complete';

export type IDEType = 'claude-code' | 'cursor' | 'vscode' | 'windsurf' | 'intellij';

export interface DetectedIDE {
  id: IDEType;
  name: string;
  detected: boolean;
  configPath: string;
  icon: string;
}

export interface MCPConfig {
  mcpServers: {
    flowstate: {
      command: string;
      args: string[];
      env: Record<string, string>;
    };
  };
}

export interface EnvVarsConfig {
  spotifyClientId?: string;
  spotifyClientSecret?: string;
  appleMusicDeveloperToken?: string;
  soundcloudClientId?: string;
  youtubeApiKey?: string;
}

export interface SetupState {
  currentStep: SetupStep;
  envVars: EnvVarsConfig;
  detectedIDEs: DetectedIDE[];
  selectedIDEs: IDEType[];
  mcpConfigured: boolean;
  isComplete: boolean;
}

export const IDE_INFO: Record<IDEType, { name: string; icon: string; configFileName: string }> = {
  'claude-code': {
    name: 'Claude Code',
    icon: '✳️',
    configFileName: '.mcp.json',
  },
  cursor: {
    name: 'Cursor',
    icon: '🖱️',
    configFileName: 'mcp.json',
  },
  vscode: {
    name: 'VS Code',
    icon: '💻',
    configFileName: 'mcp.json',
  },
  windsurf: {
    name: 'Windsurf',
    icon: '🏄',
    configFileName: 'mcp.json',
  },
  intellij: {
    name: 'IntelliJ IDEA',
    icon: '🧠',
    configFileName: 'mcp.json',
  },
};

export const SETUP_STEPS: { id: SetupStep; title: string; description: string }[] = [
  {
    id: 'welcome',
    title: 'Welcome',
    description: 'Get started with FlowState',
  },
  {
    id: 'env-vars',
    title: 'Music Services',
    description: 'Configure optional music integrations',
  },
  {
    id: 'ide-detection',
    title: 'IDE Detection',
    description: 'Detect and select your IDEs',
  },
  {
    id: 'mcp-config',
    title: 'MCP Setup',
    description: 'Configure IDE integration',
  },
  {
    id: 'complete',
    title: 'Complete',
    description: 'Setup finished!',
  },
];

