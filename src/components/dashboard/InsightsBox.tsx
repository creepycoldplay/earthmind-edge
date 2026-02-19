/**
 * Smart Insights Box — Section 6
 * Terminal-style log feed with auto-generated insights
 */
import React from 'react';
import type { Insight } from '@/lib/insights';

interface InsightsBoxProps {
  insights: Insight[];
}

const typeStyle: Record<string, { border: string; bg: string; color: string }> = {
  critical: {
    border: 'hsl(0 100% 60% / 0.4)',
    bg: 'hsl(0 100% 60% / 0.05)',
    color: 'hsl(0 100% 60%)',
  },
  warning: {
    border: 'hsl(45 100% 60% / 0.4)',
    bg: 'hsl(45 100% 60% / 0.05)',
    color: 'hsl(45 100% 60%)',
  },
  info: {
    border: 'hsl(174 100% 40% / 0.3)',
    bg: 'hsl(174 100% 40% / 0.04)',
    color: 'hsl(174 100% 40%)',
  },
  success: {
    border: 'hsl(152 100% 50% / 0.3)',
    bg: 'hsl(152 100% 50% / 0.04)',
    color: 'hsl(152 100% 50%)',
  },
};

const formatTime = (d: Date) =>
  `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;

export const InsightsBox: React.FC<InsightsBoxProps> = ({ insights }) => {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="section-label mb-1">Section 6</div>
          <h3 className="font-bold text-sm" style={{ color: 'hsl(152 100% 50%)' }}>
            🤖 Smart Insights
          </h3>
        </div>
        <div
          className="w-2 h-2 rounded-full"
          style={{
            background: insights.length > 0 ? 'hsl(152 100% 50%)' : 'hsl(220 30% 30%)',
            boxShadow: insights.length > 0 ? '0 0 8px hsl(152 100% 50%)' : 'none',
          }}
        />
      </div>

      <div className="terminal-feed p-3 max-h-64 overflow-y-auto space-y-2">
        {insights.length === 0 ? (
          <div className="text-muted-foreground text-xs font-mono py-4 text-center">
            <span style={{ color: 'hsl(152 100% 50%)' }}>{'>'}</span> Awaiting data analysis...
            <span className="inline-block w-2 h-3 ml-1 align-middle animate-pulse" style={{ background: 'hsl(152 100% 50%)' }} />
          </div>
        ) : (
          insights.map((insight, i) => {
            const style = typeStyle[insight.type];
            return (
              <div
                key={insight.id}
                className="flex gap-3 p-2 rounded-md animate-fade-slide-in text-xs"
                style={{
                  background: style.bg,
                  border: `1px solid ${style.border}`,
                  animationDelay: `${i * 60}ms`,
                  animationFillMode: 'both',
                }}
              >
                <span className="shrink-0 font-mono text-muted-foreground" style={{ fontSize: 10 }}>
                  [{formatTime(insight.timestamp)}]
                </span>
                <span className="shrink-0">{insight.icon}</span>
                <span className="font-mono leading-relaxed" style={{ color: style.color }}>
                  {insight.message}
                </span>
              </div>
            );
          })
        )}
      </div>

      {insights.length > 0 && (
        <div className="mt-2 text-xs text-right font-mono text-muted-foreground">
          {insights.length} insight{insights.length > 1 ? 's' : ''} generated
        </div>
      )}
    </div>
  );
};
