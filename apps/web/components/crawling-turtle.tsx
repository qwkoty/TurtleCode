"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AgentStatus } from "@/lib/store";

interface CrawlingTurtleProps {
  status: AgentStatus;
  containerRef: React.RefObject<HTMLElement>;
  targetRef: React.RefObject<HTMLElement>;
}

const statusColor: Record<AgentStatus, string> = {
  idle: "#22d3ee",
  thinking: "#f59e0b",
  editing: "#3b82f6",
  plugin: "#a855f7",
  complete: "#10b981",
};

export function CrawlingTurtle({ status, containerRef, targetRef }: CrawlingTurtleProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  const [facingRight, setFacingRight] = useState(true);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const updatePosition = () => {
      const container = containerRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      let targetRect: DOMRect | null = null;

      if (targetRef.current && (status === "editing" || status === "complete")) {
        targetRect = targetRef.current.getBoundingClientRect();
      }

      const size = 40;
      const padding = 12;

      let x: number;
      let y: number;

      if (targetRect) {
        // 爬到最新 AI 消息右侧
        x = targetRect.right - containerRect.left + padding;
        y = targetRect.top - containerRect.top + targetRect.height / 2 - size / 2;
        setFacingRight(false);
      } else {
        // 默认待在输入框右下角
        x = containerRect.width - size - padding;
        y = containerRect.height - size - padding;
        setFacingRight(true);
      }

      setPosition({ x, y });
    };

    const raf = () => {
      updatePosition();
      rafRef.current = requestAnimationFrame(raf);
    };

    // 仅在非 idle 时显示
    setVisible(status !== "idle");
    updatePosition();
    rafRef.current = requestAnimationFrame(raf);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [status, containerRef, targetRef]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1, x: position.x, y: position.y }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{
            opacity: { duration: 0.25 },
            scale: { duration: 0.25 },
            x: { duration: 0.9, ease: "easeInOut" },
            y: { duration: 0.9, ease: "easeInOut" },
          }}
          className="pointer-events-none absolute left-0 top-0 z-30 h-10 w-10"
          style={{ transform: `scaleX(${facingRight ? 1 : -1})` }}
        >
          <TurtleSvg status={status} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TurtleSvg({ status }: { status: AgentStatus }) {
  const color = statusColor[status];
  const isThinking = status === "thinking";

  return (
    <svg viewBox="0 0 48 48" className="h-full w-full" style={{ shapeRendering: "geometricPrecision" }}>
      <defs>
        <radialGradient id={`crawl-core-${status}`} cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor={color} />
          <stop offset="100%" stopColor={color} stopOpacity="0.6" />
        </radialGradient>
        <radialGradient id="crawl-shell" cx="50%" cy="30%" r="80%">
          <stop offset="0%" stopColor={color} stopOpacity="0.45" />
          <stop offset="60%" stopColor="#0f172a" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#020617" stopOpacity="0.95" />
        </radialGradient>
      </defs>

      {/* 龟壳 */}
      <motion.path
        d="M24 8 L36 16 L36 32 L24 40 L12 32 L12 16 Z"
        fill="url(#crawl-shell)"
        stroke={color}
        strokeWidth="1.2"
        strokeLinejoin="round"
        animate={{ strokeOpacity: isThinking ? [0.5, 1, 0.5] : [0.6, 0.9, 0.6] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* 龟壳纹理 */}
      <g stroke={color} strokeWidth="0.6" strokeOpacity="0.35" strokeLinecap="round">
        <line x1="24" y1="8" x2="24" y2="40" />
        <line x1="12" y1="16" x2="36" y2="32" />
        <line x1="36" y1="16" x2="12" y2="32" />
      </g>

      {/* 核心 */}
      <motion.circle
        cx="24"
        cy="24"
        r="5"
        fill={`url(#crawl-core-${status})`}
        animate={{ r: isThinking ? [5, 6.5, 5] : [5, 5.5, 5] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* 头部 */}
      <motion.path
        d="M20 8 Q24 4 28 8 L26 11 Q24 12 22 11 Z"
        fill={color}
        fillOpacity="0.6"
        animate={{ y: isThinking ? [0, -1.5, 0] : [0, -0.5, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* 四肢 */}
      {[
        { cx: 6, cy: 16 },
        { cx: 42, cy: 16 },
        { cx: 9, cy: 36 },
        { cx: 39, cy: 36 },
      ].map((p, i) => (
        <motion.circle
          key={i}
          cx={p.cx}
          cy={p.cy}
          r="2.5"
          fill={color}
          fillOpacity="0.5"
          animate={{
            r: isThinking ? [2.5, 3.2, 2.5] : [2.5, 2.8, 2.5],
            opacity: isThinking ? [0.5, 0.9, 0.5] : [0.5, 0.75, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.1,
          }}
        />
      ))}
    </svg>
  );
}
