"use client";

import { ClaudeIcon } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { IDEType } from "@/hooks";

interface IDEIconProps {
  ide: IDEType | null;
  className?: string;
}

// Emoji fallbacks for the IDEs without a dedicated brand mark
const EMOJI: Record<IDEType, string> = {
  "claude-code": "✳️",
  cursor: "🖱️",
  vscode: "💻",
  windsurf: "🏄",
  intellij: "🧠",
  unknown: "🖥️",
};

/**
 * Renders an IDE's icon: Claude's asterisk mark for Claude Code, emoji for the rest.
 */
export function IDEIcon({ ide, className }: IDEIconProps) {
  if (ide === "claude-code") {
    return <ClaudeIcon className={cn("w-4 h-4 text-[#D97757]", className)} />;
  }
  return <span className={className}>{ide ? EMOJI[ide] : EMOJI.unknown}</span>;
}
