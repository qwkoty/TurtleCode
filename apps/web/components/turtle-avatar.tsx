"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Settings } from "lucide-react";
import { AgentStatus } from "@/lib/store";

interface TurtleAvatarProps {
  status: AgentStatus;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "w-1.5 h-1.5",
  md: "w-2.5 h-2.5",
  lg: "w-4 h-4",
};

const colorMap: Record<string, string> = {
  h: "bg-emerald-400",
  e: "bg-slate-950",
  s: "bg-emerald-500",
  g: "bg-emerald-700",
  d: "bg-emerald-900",
  l: "bg-brand-highlight",
  ".": "bg-transparent",
};

const headRows = [
  "...h...",
  "..hhh..",
  ".hhehh.",
  "..hhh..",
  "...s...",
];

const bodyRows = [
  "..s.s..",
  ".ggggg.",
  "ggglggg",
  "ggggggg",
  "ggggggg",
  "ggggggg",
  "ggggggg",
  ".ggggg.",
  "..ttt..",
];

export function TurtleAvatar({ status, size = "md" }: TurtleAvatarProps) {
  const pixel = sizeMap[size];

  const containerVariants = {
    idle: {
      y: [0, -4, 0],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
    },
    thinking: {
      y: [0, -2, 0],
      transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
    },
    editing: {
      y: [0, -5, 0],
      transition: { duration: 0.35, repeat: Infinity, ease: "linear" },
    },
    plugin: {
      y: [0, -3, 0],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
    },
    complete: {
      y: [0, -10, 0],
      scale: [1, 1.12, 1],
      transition: { duration: 0.6, repeat: 2, ease: "easeOut" },
    },
  };

  const headVariants = {
    idle: { x: 0 },
    thinking: {
      x: [-3, 3, -3],
      transition: { duration: 0.8, repeat: Infinity, ease: "easeInOut" },
    },
    editing: { x: 0 },
    plugin: { x: 0 },
    complete: { rotate: [0, -10, 10, 0], transition: { duration: 0.5, repeat: 2 } },
  };

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* 思考气泡点 */}
      {status === "thinking" && (
        <div className="mb-1 flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-1 w-1 rounded-full bg-brand-highlight"
              animate={{ opacity: [0.2, 1, 0.2], y: [0, -3, 0] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}

      <motion.div
        className="relative flex flex-col items-center"
        animate={status}
        variants={containerVariants}
      >
        {/* 头部 */}
        <motion.div
          className="grid grid-cols-7 gap-0"
          animate={status}
          variants={headVariants}
        >
          {headRows.map((row, ri) => (
            <div key={ri} className="contents">
              {row.split("").map((cell, ci) => (
                <div
                  key={`${ri}-${ci}`}
                  className={`${pixel} ${colorMap[cell] || "bg-transparent"} rounded-[1px]`}
                />
              ))}
            </div>
          ))}
        </motion.div>

        {/* 身体 / 壳 */}
        <div className="relative">
          <div className="grid grid-cols-7 gap-0">
            {bodyRows.map((row, ri) => (
              <div key={ri} className="contents">
                {row.split("").map((cell, ci) => {
                  const isTail = cell === "t";
                  return (
                    <div
                      key={`${ri}-${ci}`}
                      className={`${pixel} ${
                        isTail ? "bg-emerald-500" : colorMap[cell] || "bg-transparent"
                      } rounded-[1px]`}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* 插件齿轮徽章 */}
          {status === "plugin" && (
            <motion.div
              className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary text-white shadow-lg ring-2 ring-slate-900/80"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Settings className="h-3 w-3" />
            </motion.div>
          )}

          {/* 编辑模式头盔高光 */}
          {status === "editing" && (
            <motion.div
              className="pointer-events-none absolute inset-0 rounded-lg bg-brand-highlight/10"
              animate={{ opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            />
          )}
        </div>

        {/* 完成提示 */}
        <AnimatePresence>
          {status === "complete" && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="absolute -bottom-5 whitespace-nowrap rounded-full bg-brand-primary/90 px-2 py-0.5 text-[10px] font-semibold text-white shadow-lg"
            >
              任务完成
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
