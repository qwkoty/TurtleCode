'use client';

import { motion } from 'framer-motion';
import { AgentStatus } from '@/types';

interface PixelTurtleProps {
  status: AgentStatus;
  size?: number;
  className?: string;
}

export function PixelTurtle({ status, size = 64, className }: PixelTurtleProps) {
  const isThinking = status === 'thinking';
  const isEditing = status === 'editing' || status === 'running';
  const isCompleted = status === 'completed';
  const isIdle = status === 'idle';

  return (
    <motion.div
      className={className}
      style={{ width: size, height: size }}
      animate={{
        y: isIdle ? [0, -2, 0] : isThinking ? [0, -4, 0] : 0,
      }}
      transition={{
        duration: isThinking ? 1 : 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <svg
        viewBox="0 0 16 16"
        width={size}
        height={size}
        shapeRendering="crispEdges"
        className="drop-shadow-[0_0_8px_rgba(37,99,235,0.5)]"
      >
        {/* Shell */}
        <rect x="4" y="5" width="8" height="6" fill="#2563EB" />
        <rect x="5" y="6" width="6" height="4" fill="#1D4ED8" />
        <rect x="6" y="7" width="1" height="1" fill="#60A5FA" />
        <rect x="8" y="7" width="1" height="1" fill="#60A5FA" />
        <rect x="7" y="8" width="2" height="1" fill="#60A5FA" />

        {/* Head */}
        <rect x="11" y="6" width="3" height="3" fill="#22D3EE" />
        <rect x="12" y="7" width="1" height="1" fill="#0F172A" />
        <rect x="13" y="7" width="1" height="1" fill="#0F172A" />

        {/* Thinking helmet */}
        {isEditing && (
          <>
            <rect x="11" y="4" width="3" height="1" fill="#F59E0B" />
            <rect x="12" y="3" width="1" height="1" fill="#F59E0B" />
          </>
        )}

        {/* Legs */}
        <motion.rect
          x="2"
          y="6"
          width="2"
          height="2"
          fill="#22D3EE"
          animate={{ x: isIdle ? [0, 1, 0] : 0 }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        <rect x="4" y="11" width="2" height="2" fill="#22D3EE" />
        <rect x="9" y="11" width="2" height="2" fill="#22D3EE" />

        {/* Waving arm when completed */}
        <motion.rect
          x="1"
          y="5"
          width="2"
          height="2"
          fill="#22D3EE"
          animate={isCompleted ? { y: [0, -2, 0] } : {}}
          transition={{ duration: 0.5, repeat: Infinity }}
        />

        {/* Skill icon on back when editing/running */}
        {isEditing && (
          <motion.rect
            x="6"
            y="4"
            width="3"
            height="2"
            fill="#06B6D4"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}

        {/* Thinking bubble */}
        {isThinking && (
          <motion.g
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: -2 }}
            transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
          >
            <rect x="14" y="3" width="1" height="1" fill="#94A3B8" />
            <rect x="15" y="2" width="2" height="2" fill="#94A3B8" />
          </motion.g>
        )}
      </svg>
    </motion.div>
  );
}
