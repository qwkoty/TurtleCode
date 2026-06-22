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

  return (
    <div className={`relative ${wrap}`}>
      {/* 外层光晕 */}
      <motion.div
        className="absolute inset-[-15%] rounded-full blur-lg"
        style={{ background: `radial-gradient(circle, ${color}35 0%, transparent 70%)` }}
        animate={{
          opacity: isThinking ? [0.45, 1, 0.45] : [0.3, 0.65, 0.3],
          scale: isThinking ? [0.9, 1.2, 0.9] : [0.95, 1.08, 0.95],
        }}
        transition={{ duration: isThinking ? 1.4 : 2.6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* 浮动主体 */}
      <motion.div
        className="relative h-full w-full"
        animate={{
          y: isThinking ? [0, -3, 2, -3, 0] : [0, -2, 0],
        }}
        transition={{ duration: isThinking ? 1.6 : 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg
          viewBox="0 0 64 64"
          className="relative z-10 h-full w-full"
          style={{ shapeRendering: "geometricPrecision" }}
        >
          <defs>
            <radialGradient id={`core-${status}`} cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor={color} />
              <stop offset="100%" stopColor={color} stopOpacity="0.6" />
            </radialGradient>
            <radialGradient id="shellGradient" cx="50%" cy="30%" r="80%">
              <stop offset="0%" stopColor={color} stopOpacity="0.45" />
              <stop offset="60%" stopColor="#0f172a" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#020617" stopOpacity="0.95" />
            </radialGradient>
            <linearGradient id={`ring-${status}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.5" />
              <stop offset="100%" stopColor={color} stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* 外层旋转轨道环 */}
          <motion.g
            style={{ transformOrigin: "32px 32px" }}
            animate={{
              rotate: isThinking || isPlugin ? [0, 360] : [0, 360],
            }}
            transition={{
              rotate: { duration: isThinking ? 2.5 : 6, repeat: Infinity, ease: "linear" },
            }}
          >
            <ellipse
              cx="32"
              cy="32"
              rx="27"
              ry="15"
              fill="none"
              stroke={`url(#ring-${status})`}
              strokeWidth="1"
            />
            <ellipse
              cx="32"
              cy="32"
              rx="15"
              ry="27"
              fill="none"
              stroke={`url(#ring-${status})`}
              strokeWidth="0.8"
              strokeOpacity="0.5"
            />
          </motion.g>

          {/* 龟壳外圈 */}
          <motion.path
            d="M32 10 L50 21 L50 43 L32 54 L14 43 L14 21 Z"
            fill="url(#shellGradient)"
            stroke={color}
            strokeWidth="1.5"
            strokeLinejoin="round"
            animate={{
              strokeOpacity: isThinking ? [0.5, 1, 0.5] : [0.6, 0.9, 0.6],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* 内部几何网格 */}
          <g stroke={color} strokeWidth="0.7" strokeOpacity="0.35" strokeLinecap="round">
            <line x1="32" y1="10" x2="32" y2="54" />
            <line x1="14" y1="21" x2="50" y2="43" />
            <line x1="50" y1="21" x2="14" y2="43" />
            <line x1="21" y1="16" x2="43" y2="48" />
            <line x1="43" y1="16" x2="21" y2="48" />
          </g>

          {/* 中央核心 */}
          <motion.circle
            cx="32"
            cy="32"
            r="8"
            fill={`url(#core-${status})`}
            animate={{
              r: isThinking ? [8, 10, 8] : isEditing ? [8, 9, 8] : [8, 8.5, 8],
              opacity: isThinking ? [0.85, 1, 0.85] : [0.9, 1, 0.9],
            }}
            transition={{ duration: isThinking ? 1.2 : 2, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* 头部 */}
          <motion.path
            d="M26 10 Q32 4 38 10 L36 14 Q32 16 28 14 Z"
            fill={color}
            fillOpacity="0.55"
            animate={{
              y: isThinking ? [0, -2, 0] : [0, -1, 0],
              opacity: isThinking ? [0.55, 0.9, 0.55] : [0.55, 0.75, 0.55],
            }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* 四肢 - 圆点 */}
          {[
            { cx: 8, cy: 20 },
            { cx: 56, cy: 20 },
            { cx: 12, cy: 48 },
            { cx: 52, cy: 48 },
          ].map((p, i) => (
            <motion.circle
              key={i}
              cx={p.cx}
              cy={p.cy}
              r="3"
              fill={color}
              fillOpacity="0.5"
              animate={{
                r: isEditing ? [3, 4.2, 3] : [3, 3.5, 3],
                opacity: isEditing ? [0.5, 0.95, 0.5] : [0.5, 0.75, 0.5],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.12,
              }}
            />
          ))}

          {/* 尾巴 */}
          <motion.circle
            cx="32"
            cy="58"
            r="2.5"
            fill={color}
            fillOpacity="0.45"
            animate={{
              opacity: [0.45, 0.7, 0.45],
            }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
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
