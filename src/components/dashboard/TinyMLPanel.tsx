/**
 * TinyML Edge Simulation Panel — Section 5
 */
import React, { useState } from 'react';
import { Info, Cpu, Zap, HardDrive, Clock, TrendingDown } from 'lucide-react';
import type { ModelInfo } from '@/lib/autoencoderModel';

interface TinyMLPanelProps {
  modelInfo: ModelInfo | null;
  isTFLiteConverted: boolean;
  isQuantized: boolean;
}

const StatRow = ({
  icon: Icon,
  label,
  value,
  unit,
  color,
  tooltip
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  unit: string;
  color: string;
  tooltip?: string;
}) => {
  const [showTip, setShowTip] = useState(false);

  return (
    <div className="flex items-center justify-between py-2.5 border-b last:border-0" style={{ borderColor: 'hsl(220 30% 16%)' }}>
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5" style={{ color }} />
        <span className="text-sm text-muted-foreground">{label}</span>
        {tooltip && (
          <div className="relative">
            <Info
              className="w-3 h-3 text-muted-foreground cursor-help"
              onMouseEnter={() => setShowTip(true)}
              onMouseLeave={() => setShowTip(false)}
            />
            {showTip && (
              <div
                className="absolute z-50 left-4 -top-1 w-52 text-xs p-2 rounded-lg"
                style={{
                  background: 'hsl(220 40% 8%)',
                  border: '1px solid hsl(152 100% 50% / 0.3)',
                  color: 'hsl(152 100% 50%)',
                }}
              >
                {tooltip}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="font-mono font-bold text-sm" style={{ color }}>
        {value} <span className="text-xs opacity-70">{unit}</span>
      </div>
    </div>
  );
};

const BarComparison = ({
  original, quantized
}: {
  original: number;
  quantized: number;
}) => {
  const max = original;
  return (
    <div className="space-y-2 my-3">
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">Float32 (Original)</span>
          <span className="font-mono" style={{ color: 'hsl(45 100% 60%)' }}>{original.toFixed(2)} KB</span>
        </div>
        <div className="h-3 rounded-full overflow-hidden" style={{ background: 'hsl(220 30% 14%)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: '100%',
              background: 'linear-gradient(90deg, hsl(45 100% 60%), hsl(30 100% 55%))',
            }}
          />
        </div>
      </div>
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">INT8 (Quantized)</span>
          <span className="font-mono" style={{ color: 'hsl(152 100% 50%)' }}>{quantized.toFixed(2)} KB</span>
        </div>
        <div className="h-3 rounded-full overflow-hidden" style={{ background: 'hsl(220 30% 14%)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${(quantized / max) * 100}%`,
              background: 'linear-gradient(90deg, hsl(152 100% 50%), hsl(174 100% 40%))',
              boxShadow: '0 0 8px hsl(152 100% 50% / 0.4)',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export const TinyMLPanel: React.FC<TinyMLPanelProps> = ({
  modelInfo,
  isTFLiteConverted,
  isQuantized,
}) => {
  if (!modelInfo || !isTFLiteConverted) {
    return (
      <div className="glass-card p-5">
        <div className="section-label mb-1">Section 5</div>
        <h3 className="font-bold text-sm mb-4" style={{ color: 'hsl(174 100% 40%)' }}>
          ⚡ TinyML Edge Simulation
        </h3>
        <div className="h-40 flex flex-col items-center justify-center gap-2 text-muted-foreground text-sm">
          <Cpu className="w-8 h-8 opacity-30" />
          Train model and convert to TFLite to see edge simulation
        </div>
      </div>
    );
  }

  return (
    <div
      className="glass-card p-5"
      style={{
        border: '1px solid hsl(174 100% 40% / 0.3)',
        boxShadow: '0 0 24px hsl(174 100% 40% / 0.06)',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="section-label mb-1">Section 5</div>
          <h3 className="font-bold text-sm" style={{ color: 'hsl(174 100% 40%)' }}>
            ⚡ TinyML Edge Simulation
          </h3>
        </div>
        <div
          className="px-2 py-1 rounded-md text-xs font-mono"
          style={{
            background: 'hsl(174 100% 40% / 0.1)',
            border: '1px solid hsl(174 100% 40% / 0.3)',
            color: 'hsl(174 100% 40%)',
          }}
        >
          {isQuantized ? 'INT8 Active' : 'Float32'}
        </div>
      </div>

      {/* Size comparison bar */}
      <BarComparison
        original={modelInfo.originalSizeKB}
        quantized={modelInfo.quantizedSizeKB}
      />

      {/* Stats */}
      <div className="mt-2">
        <StatRow
          icon={HardDrive}
          label="Original Size"
          value={modelInfo.originalSizeKB.toFixed(2)}
          unit="KB"
          color="hsl(45 100% 60%)"
        />
        <StatRow
          icon={HardDrive}
          label="Quantized Size (INT8)"
          value={modelInfo.quantizedSizeKB.toFixed(2)}
          unit="KB"
          color="hsl(152 100% 50%)"
        />
        <StatRow
          icon={TrendingDown}
          label="Size Reduction"
          value={`${modelInfo.reductionPercent}%`}
          unit="smaller"
          color="hsl(174 100% 40%)"
        />
        <StatRow
          icon={Cpu}
          label="Estimated RAM"
          value={modelInfo.estimatedRAMKB.toFixed(2)}
          unit="KB"
          color="hsl(210 100% 65%)"
          tooltip="Estimated on-device RAM for activations + weights on ARM Cortex-M targets like ESP32 or Arduino Nano 33 BLE."
        />
        <StatRow
          icon={Clock}
          label="Inference Time"
          value={modelInfo.inferenceTimeMs.toFixed(2)}
          unit="ms"
          color="hsl(45 100% 60%)"
          tooltip="How this model could run on microcontrollers: ESP32 at ~240MHz can run this model in under 5ms, enabling real-time soil monitoring."
        />
        <StatRow
          icon={Zap}
          label="Parameters"
          value={modelInfo.parameterCount}
          unit="total"
          color="hsl(0 100% 60%)"
        />
      </div>

      {/* Target devices */}
      <div className="mt-4 pt-3" style={{ borderTop: '1px solid hsl(220 30% 16%)' }}>
        <div className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wider">Target Devices</div>
        <div className="flex flex-wrap gap-1.5">
          {['ESP32', 'Arduino Nano 33', 'STM32', 'RPi Pico'].map((d) => (
            <span
              key={d}
              className="px-2 py-0.5 rounded-md text-xs font-mono"
              style={{
                background: 'hsl(174 100% 40% / 0.08)',
                border: '1px solid hsl(174 100% 40% / 0.25)',
                color: 'hsl(174 100% 40%)',
              }}
            >
              {d}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
