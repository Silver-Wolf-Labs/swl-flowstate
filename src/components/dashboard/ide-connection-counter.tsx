"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Monitor, MonitorOff, Clock, Zap } from "lucide-react";
import { useIDEConnection } from "@/hooks";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface IDEConnectionCounterProps {
  variant?: "compact" | "full";
  className?: string;
}

export function IDEConnectionCounter({ variant = "compact", className }: IDEConnectionCounterProps) {
  const {
    isConnected,
    connectedIDE,
    liveSessionTime,
    formatTimeShort,
    getIDEDisplayName,
  } = useIDEConnection();
  
  const [showTooltip, setShowTooltip] = useState(false);

  if (variant === "compact") {
    return (
      <motion.div
        className={cn(
          "relative flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
          isConnected
            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
            : "bg-muted/50 text-muted-foreground border border-border cursor-pointer",
          className
        )}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        onMouseEnter={() => !isConnected && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => !isConnected && setShowTooltip(!showTooltip)}
      >
        {isConnected ? (
          <>
            <motion.div
              className="w-2 h-2 rounded-full bg-emerald-500"
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <Monitor className="w-4 h-4" />
            <span className="font-mono">{formatTimeShort(liveSessionTime)}</span>
          </>
        ) : (
          <>
            <MonitorOff className="w-4 h-4" />
            <span>Disconnected</span>
          </>
        )}
        
        {/* Tooltip for disconnected state */}
        <AnimatePresence>
          {showTooltip && !isConnected && (
            <motion.div
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-popover border border-border rounded-lg shadow-lg text-xs whitespace-nowrap z-50"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
            >
              <p className="font-medium text-foreground">IDE Disconnected</p>
              <p className="text-muted-foreground mt-1">
                Run &quot;flowstate init&quot; in your IDE to connect
              </p>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-popover border-r border-b border-border" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  // Full variant with more details
  return (
    <motion.div
      className={cn(
        "relative p-4 rounded-xl border transition-all",
        isConnected
          ? "bg-emerald-500/5 border-emerald-500/20"
          : "bg-muted/30 border-border",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onMouseEnter={() => !isConnected && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            isConnected ? "bg-emerald-500/10" : "bg-muted"
          )}>
            {isConnected ? (
              <Monitor className="w-5 h-5 text-emerald-500" />
            ) : (
              <MonitorOff className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          <div>
            <p className={cn(
              "font-medium",
              isConnected ? "text-emerald-500" : "text-muted-foreground"
            )}>
              {isConnected ? getIDEDisplayName(connectedIDE) : "IDE Disconnected"}
            </p>
            <p className="text-xs text-muted-foreground">
              {isConnected ? "Connected via MCP" : "Run 'flowstate init' to connect"}
            </p>
          </div>
        </div>
        
        {isConnected && (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-500" />
            <span className="font-mono text-lg font-bold text-emerald-500">
              {formatTimeShort(liveSessionTime)}
            </span>
          </div>
        )}
      </div>
      
      {isConnected && (
        <motion.div
          className="mt-3 flex items-center gap-2 text-xs text-emerald-500/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Zap className="w-3 h-3" />
          <span>Session active • Syncing with dashboard</span>
        </motion.div>
      )}
    </motion.div>
  );
}

