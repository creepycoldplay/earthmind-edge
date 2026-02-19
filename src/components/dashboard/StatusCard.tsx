/**
 * Live Soil Status Card – Section 1
 * Large glowing card with current moisture + anomaly status badge
 */
import React from 'react';
import { Droplets, AlertTriangle, CheckCircle } from 'lucide-react';

interface StatusCardProps {
  moisture: number;
  isAnomaly: boolean;
  hasDetection: boolean;
  anomalyCount: number;
  totalPoints: number;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  moisture,
  isAnomaly,
  hasDetection,
  anomalyCount,
  totalPoints,
}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-6 transition-all duration-700 ${
        hasDetection
          ? isAnomaly
            ? 'glass-card-anomaly animate-pulse-glow-red'
            : 'glass-card-glow animate-pulse-glow-green'
          : 'glass-card'
      }`}
    >
      {/* Ambient background gradient */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          background: hasDetection
            ? isAnomaly
              ? 'radial-gradient(ellipse at center, hsl(0 100% 60%) 0%, transparent 70%)'
              : 'radial-gradient(ellipse at center, hsl(152 100% 50%) 0%, transparent 70%)'
            : 'radial-gradient(ellipse at center, hsl(220 40% 20%) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center gap-4">
        {/* Icon */}
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{
            background: hasDetection && isAnomaly
              ? 'hsl(0 100% 60% / 0.15)'
              : 'hsl(152 100% 50% / 0.1)',
            border: `2px solid ${hasDetection && isAnomaly ? 'hsl(0 100% 60% / 0.5)' : 'hsl(152 100% 50% / 0.3)'}`,
          }}
        >
          <Droplets
            className="w-7 h-7"
            style={{ color: hasDetection && isAnomaly ? 'hsl(0 100% 60%)' : 'hsl(152 100% 50%)' }}
          />
        </div>

        {/* Moisture value */}
        <div>
          <div className="text-xs tracking-widest uppercase text-muted-foreground mb-1">
            Current Soil Moisture
          </div>
          <div
            className="text-6xl font-black font-mono animate-number-glow"
            style={{
              color: hasDetection && isAnomaly ? 'hsl(0 100% 60%)' : 'hsl(152 100% 50%)',
            }}
          >
            {moisture.toFixed(1)}
            <span className="text-2xl ml-1 opacity-70">%</span>
          </div>
        </div>

        {/* Status badge */}
        {hasDetection ? (
          <div className="flex items-center gap-2">
            {/* Pulsing dot */}
            <div className="relative">
              <div
                className="w-3 h-3 rounded-full absolute animate-dot-ping"
                style={{ background: isAnomaly ? 'hsl(0 100% 60%)' : 'hsl(152 100% 50%)' }}
              />
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: isAnomaly ? 'hsl(0 100% 60%)' : 'hsl(152 100% 50%)' }}
              />
            </div>

            <div
              className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold tracking-wider"
              style={{
                background: isAnomaly ? 'hsl(0 100% 60% / 0.15)' : 'hsl(152 100% 50% / 0.1)',
                border: `1px solid ${isAnomaly ? 'hsl(0 100% 60% / 0.5)' : 'hsl(152 100% 50% / 0.3)'}`,
                color: isAnomaly ? 'hsl(0 100% 60%)' : 'hsl(152 100% 50%)',
              }}
            >
              {isAnomaly ? (
                <><AlertTriangle className="w-4 h-4" /> ANOMALY DETECTED</>
              ) : (
                <><CheckCircle className="w-4 h-4" /> NORMAL</>
              )}
            </div>
          </div>
        ) : (
          <div
            className="px-4 py-1.5 rounded-full text-sm font-medium"
            style={{
              background: 'hsl(220 30% 14%)',
              border: '1px solid hsl(220 30% 22%)',
              color: 'hsl(215 20% 50%)',
            }}
          >
            Awaiting Detection
          </div>
        )}

        {/* Stats row */}
        {hasDetection && (
          <div className="flex gap-6 text-center animate-fade-slide-in">
            <div>
              <div className="text-2xl font-bold font-mono text-neon-red">{anomalyCount}</div>
              <div className="text-xs text-muted-foreground">Anomalies</div>
            </div>
            <div className="w-px" style={{ background: 'hsl(220 30% 22%)' }} />
            <div>
              <div className="text-2xl font-bold font-mono text-neon-green">{totalPoints - anomalyCount}</div>
              <div className="text-xs text-muted-foreground">Normal</div>
            </div>
            <div className="w-px" style={{ background: 'hsl(220 30% 22%)' }} />
            <div>
              <div className="text-2xl font-bold font-mono" style={{ color: 'hsl(174 100% 40%)' }}>
                {((anomalyCount / Math.max(totalPoints, 1)) * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">Anomaly Rate</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
