"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { AgentStatus } from "@/lib/store";

interface TurtleAvatarProps {
  status: AgentStatus;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { wrap: "h-8 w-8", text: "text-[8px]" },
  md: { wrap: "h-12 w-12", text: "text-[10px]" },
  lg: { wrap: "h-16 w-16", text: "text-xs" },
};

const statusConfig: Record<AgentStatus, { label: string; color: string }> = {
  idle: { label: "待机", color: "#22d3ee" },
  thinking: { label: "思考中", color: "#f59e0b" },
  editing: { label: "编辑中", color: "#3b82f6" },
  plugin: { label: "调用插件", color: "#a855f7" },
  complete: { label: "完成", color: "#10b981" },
};

export function TurtleAvatar({ status, size = "md" }: TurtleAvatarProps) {
  const { wrap, text } = sizeMap[size];
  const { label, color } = statusConfig[status];
  const isThinking = status === "thinking";
  const isEditing = status === "editing";
  const isPlugin = status === "plugin";
  const isComplete = status === "complete";

  return (
    <div className={`relative ${wrap}`}>
      {/* 外层光晕 */}
      <motion.div
        className="absolute inset-[-15%] rounded-full blur-lg"
        style={{ background: `radial-gradient(circle, ${color}30 0%, transparent 70%)` }}
        animate={{
          opacity: isThinking ? [0.4, 0.9, 0.4] : [0.25, 0.55, 0.25],
          scale: isThinking ? [0.9, 1.15, 0.9] : [0.95, 1.05, 0.95],
        }}
        transition={{ duration: isThinking ? 1.4 : 2.6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* 浮动主体 */}
      <motion.div
        className="relative h-full w-full"
        animate={{
          y: isThinking ? [0, -3, 2, -3, 0] : isEditing ? [0, -2, 0] : [0, -2, 0],
        }}
        transition={{ duration: isThinking ? 1.6 : 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg viewBox="0 0 64 64" className="relative z-10 h-full w-full">
          <defs>
            <linearGradient id={`core-${status}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor={color} />
            </linearGradient>
            <linearGradient id={`shell-${status}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>

          {/* 轨道环 - thinking/plugin 时旋转 */}
          <motion.g
            style={{ transformOrigin: "32px 32px" }}
            animate={{
              rotate: isThinking || isPlugin ? [0, 360] : isComplete ? [0, 360] : 0,
              scale: isThinking ? [1, 1.08, 1] : 1,
            }}
            transition={{
              rotate: { duration: isThinking ? 3 : 6, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            <ellipse
              cx="32"
              cy="32"
              rx="26"
              ry="14"
              fill="none"
              stroke={color}
              strokeWidth="0.8"
              strokeOpacity="0.35"
            />
            <ellipse
              cx="32"
              cy="32"
              rx="14"
              ry="26"
              fill="none"
              stroke={color}
              strokeWidth="0.8"
              strokeOpacity="0.25"
            />
          </motion.g>

          {/* 六边形龟壳 */}
          <motion.path
            d="M32 12 L48 22 L48 42 L32 52 L16 42 L16 22 Z"
            fill="url(#shellGradient)"
            stroke={color}
            strokeWidth="1.2"
            strokeOpacity="0.6"
            animate={{
              strokeOpacity: isThinking ? [0.4, 1, 0.4] : [0.5, 0.8, 0.5],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <defs>
            <radialGradient id="shellGradient" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor={color} stopOpacity="0.35" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.9" />
            </radialGradient>
          </defs>

          {/* 内部几何线 */}
          <g stroke={color} strokeWidth="0.8" strokeOpacity="0.35" strokeLinecap="round">
            <line x1="32" y1="12" x2="32" y2="52" />
            <line x1="16" y1="22" x2="48" y2="42" />
            <line x1="48" y1="22" x2="16" y2="42" />
          </g>

          {/* 中央核心 */}
          <motion.circle
            cx="32"
            cy="32"
            r="7"
            fill={`url(#core-${status})`}
            animate={{
              r: isThinking ? [7, 9, 7] : isComplete ? [7, 8, 7] : [7, 7.5, 7],
              opacity: isThinking ? [0.8, 1, 0.8] : [0.85, 1, 0.85],
            }}
            transition={{ duration: isThinking ? 1.2 : 2, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* 头部 - 上方三角 */}
          <motion.path
            d="M26 10 L32 2 L38 10 Z"
            fill={color}
            fillOpacity="0.5"
            animate={{
              y: isThinking ? [0, -2, 0] : [0, -1, 0],
              opacity: isThinking ? [0.5, 0.9, 0.5] : [0.5, 0.7, 0.5],
            }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* 四肢 - 小菱形 */}
          {[
            { x: 8, y: 20 },
            { x: 52, y: 20 },
            { x: 12, y: 48 },
            { x: 48, y: 48 },
          ].map((p, i) => (
            <motion.rect
              key={i}
              x={p.x}
              y={p.y}
              width="4"
              height="4"
              rx="1"
              fill={color}
              fillOpacity="0.45"
              animate={{
                scale: isEditing ? [1, 1.4, 1] : [1, 1.15, 1],
                opacity: isEditing ? [0.45, 0.9, 0.45] : [0.45, 0.7, 0.45],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.15,
              }}
            />
          ))}
        </svg>
      </motion.div>

      {/* 状态标签 */}
      <AnimatePresence>
        {status !== "idle" && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.9 }}
            className={`absolute -bottom-3 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full px-1.5 py-0.5 ${text} font-medium text-white shadow-lg`}
            style={{ backgroundColor: color }}
          >
            {label}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
