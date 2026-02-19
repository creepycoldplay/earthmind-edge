/**
 * Performance Metrics Panel — Section 4
 * Metric cards + confusion matrix heatmap
 */
import React from 'react';
import type { PerformanceMetrics } from '@/lib/anomalyDetection';

interface MetricsPanelProps {
  metrics: PerformanceMetrics | null;
}

const MetricCard = ({
  label, value, icon, color
}: {
  label: string;
  value: string;
  icon: string;
  color: string;
}) => (
  <div
    className="metric-card rounded-xl p-4 text-center transition-all duration-300"
    style={{
      background: 'hsl(220 40% 8% / 0.8)',
      border: `1px solid ${color}30`,
    }}
  >
    <div className="text-2xl mb-1">{icon}</div>
    <div
      className="text-3xl font-black font-mono mb-1"
      style={{ color, textShadow: `0 0 12px ${color}60` }}
    >
      {value}
    </div>
    <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
  </div>
);

const ConfusionCell = ({
  value, label, color, textColor
}: {
  value: number;
  label: string;
  color: string;
  textColor?: string;
}) => (
  <div
    className="flex flex-col items-center justify-center p-3 rounded-lg"
    style={{ background: color }}
  >
    <div
      className="text-2xl font-black font-mono"
      style={{ color: textColor || 'hsl(222 47% 5%)' }}
    >
      {value}
    </div>
    <div className="text-xs font-medium mt-0.5" style={{ color: textColor || 'hsl(222 47% 5% / 0.7)' }}>
      {label}
    </div>
  </div>
);

export const MetricsPanel: React.FC<MetricsPanelProps> = ({ metrics }) => {
  if (!metrics) {
    return (
      <div className="glass-card p-5">
        <div className="section-label mb-1">Section 4</div>
        <h3 className="font-bold text-sm mb-4" style={{ color: 'hsl(152 100% 50%)' }}>
          📈 Performance & Metrics
        </h3>
        <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
          Run detection to see performance metrics
        </div>
      </div>
    );
  }

  const metricItems = [
    { label: 'Accuracy', value: `${metrics.accuracy}%`, icon: '🎯', color: 'hsl(152 100% 50%)' },
    { label: 'Precision', value: `${metrics.precision}%`, icon: '🔬', color: 'hsl(174 100% 40%)' },
    { label: 'Recall', value: `${metrics.recall}%`, icon: '📡', color: 'hsl(210 100% 65%)' },
    { label: 'F1 Score', value: `${metrics.f1Score}%`, icon: '⚡', color: 'hsl(45 100% 60%)' },
  ];

  return (
    <div className="glass-card p-5">
      <div className="section-label mb-1">Section 4</div>
      <h3 className="font-bold text-sm mb-5" style={{ color: 'hsl(152 100% 50%)' }}>
        📈 Performance & Metrics
      </h3>

      {/* Metric cards */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {metricItems.map((m) => (
          <MetricCard key={m.label} {...m} />
        ))}
      </div>

      {/* Confusion Matrix */}
      <div>
        <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-3">
          Confusion Matrix
        </div>
        <div className="flex gap-4 items-start">
          <div className="flex-1">
            <div className="grid grid-cols-2 gap-2">
              <ConfusionCell
                value={metrics.trueNegatives}
                label="True Neg"
                color="hsl(152 100% 50% / 0.8)"
              />
              <ConfusionCell
                value={metrics.falsePositives}
                label="False Pos"
                color="hsl(45 100% 60% / 0.7)"
              />
              <ConfusionCell
                value={metrics.falseNegatives}
                label="False Neg"
                color="hsl(45 100% 60% / 0.7)"
              />
              <ConfusionCell
                value={metrics.truePositives}
                label="True Pos"
                color="hsl(0 100% 60% / 0.8)"
                textColor="hsl(0 0% 100%)"
              />
            </div>
          </div>

          {/* Axis labels */}
          <div className="flex flex-col justify-between h-28 text-xs text-muted-foreground">
            <div className="flex flex-col gap-1">
              <div className="font-bold">Predicted →</div>
              <div>Neg / Pos</div>
            </div>
            <div className="font-bold rotate-90 origin-left translate-y-full whitespace-nowrap">
              Actual ↓
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
