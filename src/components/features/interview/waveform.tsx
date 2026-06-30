'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface WaveformProps {
  frequencies: Uint8Array<ArrayBufferLike>;
  level: number;
  active: boolean;
  color?: string;
  className?: string;
  barCount?: number;
}

export function Waveform({ frequencies, level, active, color = 'hsl(var(--primary))', className = '', barCount = 32 }: WaveformProps) {
  const bars = useMemo(() => {
    const result: number[] = [];
    const step = Math.floor(frequencies.length / barCount);
    for (let i = 0; i < barCount; i++) {
      const val = frequencies[i * step] ?? 0;
      result.push(val / 255); // Normalize to 0-1
    }
    return result;
  }, [frequencies, barCount]);

  return (
    <div className={`flex items-end justify-center gap-[2px] ${className}`} style={{ height: '100%' }}>
      {bars.map((value, i) => {
        const height = active ? Math.max(2, value * 100) : 2;
        const centerDistance = Math.abs(i - barCount / 2) / (barCount / 2);
        const opacity = active ? 0.3 + (1 - centerDistance) * 0.7 : 0.15;
        return (
          <motion.div
            key={i}
            className="w-[3px] rounded-full"
            style={{ backgroundColor: color }}
            animate={{ height: `${height}%`, opacity }}
            transition={{ type: 'spring', stiffness: 300, damping: 25, mass: 0.5 }}
          />
        );
      })}
    </div>
  );
}

interface PulseRingProps {
  active: boolean;
  level: number;
  color?: string;
  className?: string;
}

export function PulseRing({ active, level, color = 'hsl(var(--primary))', className = '' }: PulseRingProps) {
  const scale = active ? 1 + level * 0.5 : 1;
  const opacity = active ? 0.1 + level * 0.3 : 0.05;

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {[1, 2, 3].map((ring) => (
        <motion.div
          key={ring}
          className="absolute rounded-full"
          style={{ backgroundColor: color }}
          animate={{
            scale: active ? scale * ring * 0.6 : 1,
            opacity: active ? opacity / ring : 0.03,
          }}
          transition={{ type: 'spring', stiffness: 200, damping: 30, mass: 0.3 }}
        />
      ))}
      <div
        className="relative z-10 rounded-full"
        style={{
          width: '40%',
          height: '40%',
          backgroundColor: color,
          opacity: active ? 0.8 + level * 0.2 : 0.3,
        }}
      />
    </div>
  );
}
