"use client";

import { useId, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AgentStatus } from "@/lib/store";

interface TurtleAvatarProps {
  status: AgentStatus;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const sizeMap = {
  sm: { wrap: "h-8 w-8", text: "text-[10px]" },
  md: { wrap: "h-14 w-14", text: "text-xs" },
  lg: { wrap: "h-20 w-20", text: "text-sm" },
};

const statusConfig: Record<AgentStatus, { label: string; color: string; glow: string }> = {
  idle: { label: "待机", color: "#22d3ee", glow: "rgba(34,211,238,0.35)" },
  thinking: { label: "思考中", color: "#f59e0b", glow: "rgba(245,158,11,0.55)" },
  editing: { label: "编辑中", color: "#3b82f6", glow: "rgba(59,130,246,0.5)" },
  plugin: { label: "调用插件", color: "#a855f7", glow: "rgba(168,85,247,0.5)" },
  complete: { label: "完成", color: "#10b981", glow: "rgba(16,185,129,0.5)" },
};

export function TurtleAvatar({ status, size = "md", showLabel = true }: TurtleAvatarProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const { wrap, text } = sizeMap[size];
  const { label, color, glow } = statusConfig[status];
  const isThinking = status === "thinking";
  const isActive = status !== "idle";

  const ids = useMemo(
    () => ({
      body: `body-${uid}-${status}`,
      shell: `shell-${uid}-${status}`,
      core: `core-${uid}-${status}`,
      skin: `skin-${uid}-${status}`,
      flipper: `flipper-${uid}-${status}`,
    }),
    [uid, status]
  );

  return (
    <div className={`relative ${wrap}`}>
      {/* 外层扩散光晕 - Claude Code 式呼吸光 */}
      <motion.div
        className="pointer-events-none absolute inset-[-40%] rounded-full"
        style={{
          background: `radial-gradient(circle, ${glow} 0%, transparent 65%)`,
        }}
        animate={{
          opacity: isThinking ? [0.45, 0.95, 0.45] : isActive ? [0.3, 0.7, 0.3] : [0.2, 0.4, 0.2],
          scale: isThinking ? [0.85, 1.35, 0.85] : [0.9, 1.15, 0.9],
        }}
        transition={{
          duration: isThinking ? 1.4 : 2.6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* 中层稳定光晕 */}
      <motion.div
        className="pointer-events-none absolute inset-[-10%] rounded-full blur-md"
        style={{
          background: `radial-gradient(circle, ${color}28 0%, transparent 70%)`,
        }}
        animate={{
          opacity: [0.55, 0.9, 0.55],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* 主体内浮动 */}
      <motion.div
        className="relative h-full w-full"
        animate={{
          y: isThinking ? [0, -5, 2, -5, 0] : [0, -2.5, 0],
          rotate: isThinking ? [0, 4, -4, 0] : [0, 1.5, -1.5, 0],
        }}
        transition={{
          duration: isThinking ? 1.8 : 3.6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <svg
          viewBox="0 0 120 120"
          className="relative z-10 h-full w-full overflow-visible"
          style={{ shapeRendering: "geometricPrecision" }}
        >
          <defs>
            <radialGradient id={ids.body} cx="35%" cy="30%" r="85%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.92" />
              <stop offset="20%" stopColor={color} stopOpacity="0.75" />
              <stop offset="55%" stopColor={color} stopOpacity="0.32" />
              <stop offset="100%" stopColor="#0b1224" stopOpacity="0.95" />
            </radialGradient>
            <radialGradient id={ids.skin} cx="40%" cy="30%" r="80%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
              <stop offset="30%" stopColor={color} stopOpacity="0.55" />
              <stop offset="100%" stopColor={color} stopOpacity="0.25" />
            </radialGradient>
            <linearGradient id={ids.shell} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.28" />
              <stop offset="40%" stopColor={color} stopOpacity="0.08" />
              <stop offset="100%" stopColor={color} stopOpacity="0.22" />
            </linearGradient>
            <radialGradient id={ids.core} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
              <stop offset="35%" stopColor={color} stopOpacity="0.9" />
              <stop offset="100%" stopColor={color} stopOpacity="0.2" />
            </radialGradient>
            <linearGradient id={ids.flipper} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.45" />
              <stop offset="100%" stopColor={color} stopOpacity="0.15" />
            </linearGradient>
          </defs>

          {/* 后肢 - 左 */}
          <motion.g
            style={{ transformOrigin: "32px 86px" }}
            animate={{ rotate: isThinking ? [12, 22, 12] : [10, 14, 10] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <ellipse cx="28" cy="88" rx="9" ry="6" fill={`url(#${ids.flipper})`} />
          </motion.g>

          {/* 后肢 - 右 */}
          <motion.g
            style={{ transformOrigin: "88px 86px" }}
            animate={{ rotate: isThinking ? [-12, -22, -12] : [-10, -14, -10] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <ellipse cx="92" cy="88" rx="9" ry="6" fill={`url(#${ids.flipper})`} />
          </motion.g>

          {/* 尾巴 */}
          <motion.path
            d="M60 92 Q60 104 60 110"
            stroke={color}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeOpacity="0.45"
            fill="none"
            style={{ transformOrigin: "60px 92px" }}
            animate={{
              rotate: isThinking ? [-10, 10, -10] : [-4, 4, -4],
              d: isThinking
                ? ["M60 92 Q54 104 60 110", "M60 92 Q66 104 60 110", "M60 92 Q54 104 60 110"]
                : ["M60 92 Q58 104 60 110", "M60 92 Q62 104 60 110", "M60 92 Q58 104 60 110"],
            }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* 身体 / 龟壳轮廓 */}
          <motion.ellipse
            cx="60"
            cy="62"
            rx="42"
            ry="33"
            fill={`url(#${ids.body})`}
            stroke={color}
            strokeWidth="1.2"
            strokeOpacity="0.38"
            animate={{
              ry: isThinking ? [33, 35.5, 33] : [33, 34, 33],
              rx: isThinking ? [42, 39.5, 42] : [42, 40.5, 42],
            }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* 龟壳纹理 - 中心六边形 */}
          <motion.path
            d="M60 38 L82 51 L82 73 L60 86 L38 73 L38 51 Z"
            fill={`url(#${ids.shell})`}
            stroke={color}
            strokeWidth="0.8"
            strokeOpacity="0.3"
            strokeLinejoin="round"
            animate={{ strokeOpacity: isThinking ? [0.3, 0.65, 0.3] : [0.25, 0.45, 0.25] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* 龟壳周围小鳞甲 */}
          <motion.g
            stroke={color}
            strokeWidth="0.6"
            strokeOpacity="0.22"
            fill="none"
            strokeLinejoin="round"
            animate={{ strokeOpacity: isThinking ? [0.22, 0.45, 0.22] : [0.18, 0.32, 0.18] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <path d="M60 38 L60 26" />
            <path d="M82 51 L94 44" />
            <path d="M82 73 L94 80" />
            <path d="M60 86 L60 98" />
            <path d="M38 73 L26 80" />
            <path d="M38 51 L26 44" />
          </motion.g>

          {/* 核心发光球 */}
          <motion.circle
            cx="60"
            cy="62"
            r="14"
            fill={`url(#${ids.core})`}
            animate={{
              r: isThinking ? [14, 17.5, 14] : [14, 15.5, 14],
              opacity: isThinking ? [0.9, 1, 0.9] : [0.85, 0.95, 0.85],
            }}
            transition={{ duration: isThinking ? 1.1 : 1.8, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* 前肢 - 左 */}
          <motion.g
            style={{ transformOrigin: "20px 54px" }}
            animate={{
              rotate: isThinking ? [18, -10, 18] : [12, 6, 12],
              x: isThinking ? [0, 6, 0] : [0, 2, 0],
            }}
            transition={{ duration: isThinking ? 1.2 : 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <path
              d="M20 54 C6 48, 4 64, 14 72 C22 78, 32 66, 28 58 Z"
              fill={`url(#${ids.flipper})`}
              stroke={color}
              strokeWidth="0.8"
              strokeOpacity="0.25"
            />
          </motion.g>

          {/* 前肢 - 右 */}
          <motion.g
            style={{ transformOrigin: "100px 54px" }}
            animate={{
              rotate: isThinking ? [-18, 10, -18] : [-12, -6, -12],
              x: isThinking ? [0, -6, 0] : [0, -2, 0],
            }}
            transition={{ duration: isThinking ? 1.2 : 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <path
              d="M100 54 C114 48, 116 64, 106 72 C98 78, 88 66, 92 58 Z"
              fill={`url(#${ids.flipper})`}
              stroke={color}
              strokeWidth="0.8"
              strokeOpacity="0.25"
            />
          </motion.g>

          {/* 脖子 */}
          <motion.path
            d="M60 34 Q60 18 60 14"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeOpacity="0.35"
            fill="none"
            animate={{ d: isThinking ? ["M60 34 Q56 18 58 14", "M60 34 Q64 18 62 14", "M60 34 Q56 18 58 14"] : ["M60 34 Q58 18 60 14", "M60 34 Q62 18 60 14", "M60 34 Q58 18 60 14"] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* 头部 */}
          <motion.g
            animate={{
              y: isThinking ? [-2, -7, -2] : [-1, -3, -1],
              rotate: isThinking ? [-3, 3, -3] : [-1, 1, -1],
            }}
            transition={{ duration: isThinking ? 1.6 : 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <ellipse
              cx="60"
              cy="10"
              rx="17"
              ry="13"
              fill={`url(#${ids.skin})`}
              stroke={color}
              strokeWidth="1"
              strokeOpacity="0.35"
            />

            {/* 眼睛 */}
            <motion.g
              animate={{ scaleY: [1, 0.1, 1] }}
              transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
            >
              <circle cx="52" cy="8" r="3.2" fill="#ffffff" fillOpacity="0.95" />
              <circle cx="68" cy="8" r="3.2" fill="#ffffff" fillOpacity="0.95" />
            </motion.g>

            {/* 瞳孔 */}
            <circle cx="52.8" cy="8.4" r="1.4" fill="#0f172a" fillOpacity="0.85" />
            <circle cx="68.8" cy="8.4" r="1.4" fill="#0f172a" fillOpacity="0.85" />

            {/* 微笑 */}
            <path
              d="M54 16 Q60 20 66 16"
              stroke={color}
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeOpacity="0.5"
              fill="none"
            />
          </motion.g>

          {/* 思考气泡 */}
          <AnimatePresence>
            {isThinking && (
              <motion.g
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: [0, 1, 0], y: [-4, -26] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
              >
                <circle cx="86" cy="18" r="3" fill={color} fillOpacity="0.6" />
                <circle cx="94" cy="10" r="2" fill={color} fillOpacity="0.4" />
              </motion.g>
            )}
          </AnimatePresence>
        </svg>
      </motion.div>

      {/* 状态标签 */}
      <AnimatePresence>
        {showLabel && isActive && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.85 }}
            transition={{ duration: 0.2 }}
            className={`absolute -bottom-3 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 ${text} font-medium text-white shadow-lg`}
            style={{ backgroundColor: color }}
          >
            {label}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
