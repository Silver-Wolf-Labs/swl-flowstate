"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Monitor, Clock, Calendar, TrendingUp, Zap, History, BarChart3 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from "@/components/ui";
import { useIDEConnection, type IDEType } from "@/hooks";
import { cn } from "@/lib/utils";
import { IDEConnectionCounter } from "./ide-connection-counter";

type TabType = "current" | "cumulative" | "history";

export function IDEAnalytics() {
  const [activeTab, setActiveTab] = useState<TabType>("current");
  const {
    isConnected,
    connectedIDE,
    activeIDEs,
    liveSessionTime,
    history,
    configuredIDEs,
    isSetupComplete,
    formatTime,
    formatTimeShort,
    getIDEDisplayName,
    getIDEIcon,
  } = useIDEConnection();

  const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: "current", label: "Current Session", icon: Zap },
    { id: "cumulative", label: "Cumulative", icon: TrendingUp },
    { id: "history", label: "History", icon: History },
  ];

  // Get last 7 days for history chart
  const getLast7Days = () => {
    const days: { date: string; label: string; time: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split("T")[0];
      const dayLabel = date.toLocaleDateString("en-US", { weekday: "short" });
      days.push({
        date: key,
        label: dayLabel,
        time: history.dailyHistory[key] || 0,
      });
    }
    return days;
  };

  const last7Days = getLast7Days();
  const maxDayTime = Math.max(...last7Days.map(d => d.time), 1);

  // Clients live right now. Falls back to the headline IDE for older API
  // responses that don't report a client list.
  const connectedClients = activeIDEs.length > 0
    ? activeIDEs
    : (isConnected && connectedIDE ? [connectedIDE] : []);

  // Per-client cumulative totals, busiest first
  const ideTotals = Object.entries(history.ideBreakdown || {})
    .map(([ide, entry]) => ({ ide: ide as IDEType, ...entry }))
    .filter(entry => entry.totalTime > 0 || entry.sessionsCount > 0)
    .sort((a, b) => b.totalTime - a.totalTime);

  return (
    <Card variant="gradient">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5 text-primary" />
              IDE Connection Analytics
            </CardTitle>
            <CardDescription>Track your IDE connection time</CardDescription>
          </div>
          <IDEConnectionCounter variant="compact" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Tab navigation */}
        <div className="flex gap-1 p-1 bg-secondary/50 rounded-lg">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all",
                  activeTab === tab.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {activeTab === "current" && (
            <motion.div
              key="current"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <IDEConnectionCounter variant="full" />

              {isConnected && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <StatBox
                      icon={Clock}
                      label="Session Duration"
                      value={formatTimeShort(liveSessionTime)}
                      color="emerald"
                    />
                    <StatBox
                      icon={Monitor}
                      label={connectedClients.length > 1 ? "Connected Clients" : "Connected IDE"}
                      value={
                        connectedClients.length > 1
                          ? `${connectedClients.length}`
                          : getIDEDisplayName(connectedIDE)
                      }
                      color="blue"
                    />
                  </div>

                  {/* Every client currently connected via MCP */}
                  <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
                    <p className="text-xs text-muted-foreground mb-2">Connected right now:</p>
                    <div className="flex flex-wrap gap-2">
                      {connectedClients.map((ide) => (
                        <span
                          key={ide}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-500"
                        >
                          <motion.span
                            className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                            animate={{ opacity: [1, 0.4, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                          <span>{getIDEIcon(ide)}</span>
                          {getIDEDisplayName(ide)}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {activeTab === "cumulative" && (
            <motion.div
              key="cumulative"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatBox
                  icon={Clock}
                  label="Today"
                  value={formatTime(history.todayConnectionTime)}
                  color="violet"
                />
                <StatBox
                  icon={Calendar}
                  label="This Week"
                  value={formatTime(history.weekConnectionTime)}
                  color="cyan"
                />
                <StatBox
                  icon={TrendingUp}
                  label="All Time"
                  value={formatTime(history.totalConnectionTime)}
                  color="orange"
                />
                <StatBox
                  icon={Zap}
                  label="Sessions"
                  value={history.sessionsCount.toString()}
                  color="emerald"
                />
              </div>

              {/* Time per client */}
              {ideTotals.length > 0 && (
                <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
                  <p className="text-xs text-muted-foreground mb-2">Time by client:</p>
                  <div className="space-y-2">
                    {ideTotals.map(({ ide, totalTime, sessionsCount }) => {
                      const isLive = connectedClients.includes(ide);
                      return (
                        <div key={ide} className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <span>{getIDEIcon(ide)}</span>
                            <span className="font-medium">{getIDEDisplayName(ide)}</span>
                            {isLive && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                                Live
                              </span>
                            )}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            <span className="font-mono text-foreground">{formatTime(totalTime)}</span>
                            {" · "}
                            {sessionsCount} session{sessionsCount === 1 ? "" : "s"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Configured IDEs */}
              {isSetupComplete && configuredIDEs.length > 0 && (
                <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
                  <p className="text-xs text-muted-foreground mb-2">Configured IDEs:</p>
                  <div className="flex flex-wrap gap-2">
                    {configuredIDEs.map((ide) => (
                      <Badge key={ide} variant="outline" className="text-xs">
                        {getIDEDisplayName(ide)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Weekly bar chart */}
              <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-medium text-sm">Last 7 Days</h4>
                    <p className="text-xs text-muted-foreground">IDE connection time per day</p>
                  </div>
                  <Badge variant="outline">
                    <BarChart3 className="w-3 h-3 mr-1" />
                    Weekly
                  </Badge>
                </div>
                <div className="flex items-end justify-between gap-2 h-24">
                  {last7Days.map((day, index) => (
                    <div key={day.date} className="flex flex-col items-center gap-1 flex-1">
                      <motion.div
                        className={cn(
                          "w-full rounded-t-sm",
                          day.time > 0 ? "bg-gradient-to-t from-primary to-accent" : "bg-secondary"
                        )}
                        initial={{ height: 0 }}
                        animate={{
                          height: day.time > 0
                            ? `${Math.max((day.time / maxDayTime) * 100, 5)}%`
                            : "4px"
                        }}
                        transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
                        title={formatTime(day.time)}
                      />
                      <span className="text-[10px] text-muted-foreground">{day.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Last session info */}
              {history.lastSessionDate && (
                <div className="p-3 rounded-lg bg-muted/30 border border-border/50 text-sm">
                  <span className="text-muted-foreground">Last session: </span>
                  <span className="font-medium">
                    {new Date(history.lastSessionDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

// StatBox component
interface StatBoxProps {
  icon: React.ElementType;
  label: string;
  value: string;
  color: "emerald" | "blue" | "violet" | "cyan" | "orange";
}

const colorClasses = {
  emerald: "bg-emerald-500/10 text-emerald-500",
  blue: "bg-blue-500/10 text-blue-500",
  violet: "bg-violet-500/10 text-violet-500",
  cyan: "bg-cyan-500/10 text-cyan-500",
  orange: "bg-orange-500/10 text-orange-500",
};

function StatBox({ icon: Icon, label, value, color }: StatBoxProps) {
  return (
    <motion.div
      className="p-3 rounded-xl bg-secondary/50 border border-border/50"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className={cn("p-2 rounded-lg w-fit mb-2", colorClasses[color])}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </motion.div>
  );
}

