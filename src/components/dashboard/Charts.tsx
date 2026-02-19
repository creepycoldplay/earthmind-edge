/**
 * Moisture & Reconstruction Error Charts — Sections 2 & 3
 */
import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Scatter, ScatterChart,
  ComposedChart, Area
} from 'recharts';
import type { SoilDataPoint } from '@/lib/dataGenerator';
import type { DetectionResult } from '@/lib/anomalyDetection';

const chartTheme = {
  background: 'transparent',
  gridColor: 'hsl(220 30% 16%)',
  textColor: 'hsl(215 20% 50%)',
  tooltipBg: 'hsl(220 40% 8%)',
  tooltipBorder: 'hsl(152 100% 50% / 0.3)',
};

const CustomTooltip = ({ active, payload, label, extra }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg p-3 text-xs font-mono"
      style={{
        background: chartTheme.tooltipBg,
        border: `1px solid ${chartTheme.tooltipBorder}`,
        boxShadow: '0 4px 20px hsl(0 0% 0% / 0.5)',
      }}
    >
      <div className="text-muted-foreground mb-1">Timestep: {label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(4) : p.value}
        </div>
      ))}
      {extra && <div className="mt-1 text-muted-foreground">{extra}</div>}
    </div>
  );
};

// ── SECTION 2: Moisture Chart ──────────────────────────────
interface MoistureChartProps {
  data: SoilDataPoint[];
  detections: DetectionResult[];
  hasDetection: boolean;
}

export const MoistureChart: React.FC<MoistureChartProps> = ({ data, detections, hasDetection }) => {
  // Build chart data combining moisture + anomaly flag
  const chartData = data.map((d, i) => {
    const det = detections.find(det => det.timestampCenter === i);
    return {
      timestamp: d.timestamp,
      moisture: parseFloat(d.moisture.toFixed(2)),
      anomalyDot: det?.isAnomaly ? d.moisture : null,
    };
  });

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="section-label mb-1">Section 2</div>
          <h3 className="font-bold text-sm" style={{ color: 'hsl(152 100% 50%)' }}>
            📊 Moisture Visualization
          </h3>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 rounded" style={{ background: 'hsl(152 100% 50%)' }} />
            <span className="text-muted-foreground">Moisture</span>
          </div>
          {hasDetection && (
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'hsl(0 100% 60%)', boxShadow: '0 0 6px hsl(0 100% 60%)' }} />
              <span className="text-muted-foreground">Anomaly</span>
            </div>
          )}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} vertical={false} />
          <XAxis
            dataKey="timestamp"
            tick={{ fill: chartTheme.textColor, fontSize: 10 }}
            tickLine={false}
            axisLine={{ stroke: chartTheme.gridColor }}
            label={{ value: 'Timestep', position: 'insideBottom', offset: -2, fill: chartTheme.textColor, fontSize: 10 }}
          />
          <YAxis
            tick={{ fill: chartTheme.textColor, fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            domain={[0, 100]}
            label={{ value: 'Moisture (%)', angle: -90, position: 'insideLeft', fill: chartTheme.textColor, fontSize: 10 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="moisture"
            stroke="hsl(152 100% 50%)"
            strokeWidth={1.5}
            fill="hsl(152 100% 50% / 0.05)"
            dot={false}
            name="Moisture"
          />
          {hasDetection && (
            <Scatter
              dataKey="anomalyDot"
              fill="hsl(0 100% 60%)"
              name="Anomaly"
              r={4}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

// ── SECTION 3: Reconstruction Error Chart ─────────────────
interface ErrorChartProps {
  detections: DetectionResult[];
  threshold: number;
}

export const ReconstructionErrorChart: React.FC<ErrorChartProps> = ({ detections, threshold }) => {
  const chartData = detections.map((d) => ({
    timestep: d.timestampCenter,
    error: parseFloat(d.reconstructionError.toFixed(6)),
    anomalyError: d.isAnomaly ? d.reconstructionError : null,
  }));

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="section-label mb-1">Section 3</div>
          <h3 className="font-bold text-sm" style={{ color: 'hsl(174 100% 40%)' }}>
            🧠 AI Brain — Reconstruction Error
          </h3>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 border-t border-dashed" style={{ borderColor: 'hsl(174 100% 40%)' }} />
            <span className="text-muted-foreground">Threshold ({threshold.toFixed(3)})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'hsl(0 100% 60%)' }} />
            <span className="text-muted-foreground">Anomaly</span>
          </div>
        </div>
      </div>

      {detections.length > 0 ? (
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} vertical={false} />
            <XAxis
              dataKey="timestep"
              tick={{ fill: chartTheme.textColor, fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: chartTheme.gridColor }}
            />
            <YAxis
              tick={{ fill: chartTheme.textColor, fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={threshold}
              stroke="hsl(174 100% 40%)"
              strokeDasharray="6 3"
              strokeWidth={1.5}
              label={{ value: 'Threshold', fill: 'hsl(174 100% 40%)', fontSize: 9, position: 'right' }}
            />
            <Area
              type="monotone"
              dataKey="error"
              stroke="hsl(152 100% 50%)"
              strokeWidth={1.5}
              fill="hsl(152 100% 50% / 0.05)"
              dot={false}
              name="Rec. Error"
            />
            <Scatter
              dataKey="anomalyError"
              fill="hsl(0 100% 60%)"
              name="Anomaly Error"
              r={3}
            />
          </ComposedChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
          Run detection to see reconstruction error graph
        </div>
      )}
    </div>
  );
};
