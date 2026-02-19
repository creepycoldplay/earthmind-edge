/**
 * Control Panel Sidebar
 * Left sidebar with Data, Model, and TinyML controls
 */
import React, { useRef } from 'react';
import {
  Database, Brain, Cpu, Upload, Play, RefreshCw,
  Zap, ChevronDown, Settings, Loader2
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ControlPanelProps {
  // Data controls
  numPoints: number;
  onNumPointsChange: (v: number) => void;
  anomalyIntensity: number;
  onAnomalyIntensityChange: (v: number) => void;
  onGenerateData: () => void;
  onCSVUpload: (file: File) => void;

  // Model controls
  threshold: number;
  onThresholdChange: (v: number) => void;
  onTrain: () => void;
  onDetect: () => void;
  isTraining: boolean;
  trainingProgress: number;
  trainingLoss: number;

  // TinyML controls
  onConvertTFLite: () => void;
  onQuantizeINT8: () => void;
  isTFLiteConverted: boolean;
  isQuantized: boolean;

  // State
  hasData: boolean;
  isTrained: boolean;
}

const SliderControl = ({
  label, value, min, max, step, onChange, formatValue
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  formatValue?: (v: number) => string;
}) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-mono text-neon-green">{formatValue ? formatValue(value) : value}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
      style={{
        background: `linear-gradient(to right, hsl(152 100% 50%) 0%, hsl(152 100% 50%) ${((value - min) / (max - min)) * 100}%, hsl(220 30% 20%) ${((value - min) / (max - min)) * 100}%, hsl(220 30% 20%) 100%)`,
      }}
    />
  </div>
);

const SectionHeader = ({ icon: Icon, title }: { icon: React.ElementType; title: string }) => (
  <div className="flex items-center gap-2 mb-3">
    <div className="p-1.5 rounded-md" style={{ background: 'hsl(152 100% 50% / 0.1)', border: '1px solid hsl(152 100% 50% / 0.2)' }}>
      <Icon className="w-3.5 h-3.5 text-neon-green" />
    </div>
    <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'hsl(152 100% 50%)' }}>{title}</span>
  </div>
);

export const ControlPanel: React.FC<ControlPanelProps> = ({
  numPoints, onNumPointsChange,
  anomalyIntensity, onAnomalyIntensityChange,
  onGenerateData, onCSVUpload,
  threshold, onThresholdChange,
  onTrain, onDetect,
  isTraining, trainingProgress, trainingLoss,
  onConvertTFLite, onQuantizeINT8,
  isTFLiteConverted, isQuantized,
  hasData, isTrained,
}) => {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <aside className="sidebar-bg w-72 min-h-screen flex flex-col p-4 gap-5 overflow-y-auto">
      {/* Logo mark */}
      <div className="flex items-center gap-2 pt-2 pb-1">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'hsl(152 100% 50% / 0.15)', border: '1px solid hsl(152 100% 50% / 0.4)' }}>
          <span className="text-base">🌱</span>
        </div>
        <div>
          <div className="text-xs font-bold text-neon-green">Control Panel</div>
          <div className="text-xs text-muted-foreground">TinyML Dashboard</div>
        </div>
      </div>

      <div className="w-full h-px" style={{ background: 'hsl(152 100% 50% / 0.1)' }} />

      {/* ── DATA CONTROLS ── */}
      <div className="glass-card p-4 space-y-4">
        <SectionHeader icon={Database} title="Data Controls" />

        <SliderControl
          label="Data Points"
          value={numPoints}
          min={100}
          max={1000}
          step={50}
          onChange={onNumPointsChange}
        />
        <SliderControl
          label="Anomaly Intensity"
          value={anomalyIntensity}
          min={0.1}
          max={1}
          step={0.05}
          onChange={onAnomalyIntensityChange}
          formatValue={(v) => `${Math.round(v * 100)}%`}
        />

        <button onClick={onGenerateData} className="ctrl-btn">
          <RefreshCw className="w-3.5 h-3.5" />
          Generate Synthetic Data
        </button>

        <div className="relative">
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onCSVUpload(f);
            }}
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="ctrl-btn-teal"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload CSV
          </button>
        </div>
      </div>

      {/* ── MODEL CONTROLS ── */}
      <div className="glass-card p-4 space-y-4">
        <SectionHeader icon={Brain} title="Model Controls" />

        <SliderControl
          label="Reconstruction Threshold"
          value={threshold}
          min={0.001}
          max={0.2}
          step={0.001}
          onChange={onThresholdChange}
          formatValue={(v) => v.toFixed(3)}
        />

        <button
          onClick={onTrain}
          disabled={!hasData || isTraining}
          className="ctrl-btn"
        >
          {isTraining ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Brain className="w-3.5 h-3.5" />
          )}
          {isTraining ? `Training... ${trainingProgress}%` : 'Train Autoencoder'}
        </button>

        {isTraining && (
          <div className="space-y-1">
            <Progress value={trainingProgress} className="h-1.5" />
            <div className="text-xs text-muted-foreground font-mono text-right">
              Loss: {trainingLoss.toFixed(6)}
            </div>
          </div>
        )}

        <button
          onClick={onDetect}
          disabled={!isTrained || isTraining}
          className="ctrl-btn"
        >
          <Play className="w-3.5 h-3.5" />
          Run Detection
        </button>
      </div>

      {/* ── TINYML CONTROLS ── */}
      <div className="glass-card p-4 space-y-3">
        <SectionHeader icon={Cpu} title="TinyML Controls" />

        <button
          onClick={onConvertTFLite}
          disabled={!isTrained}
          className="ctrl-btn-teal"
        >
          <Zap className="w-3.5 h-3.5" />
          {isTFLiteConverted ? '✓ TFLite Converted' : 'Convert to TFLite'}
        </button>

        <button
          onClick={onQuantizeINT8}
          disabled={!isTFLiteConverted}
          className="ctrl-btn-teal"
        >
          <Settings className="w-3.5 h-3.5" />
          {isQuantized ? '✓ INT8 Quantized' : 'Quantize to INT8'}
        </button>

        {isQuantized && (
          <div className="text-xs text-center font-mono animate-fade-slide-in" style={{ color: 'hsl(174 100% 40%)' }}>
            ✓ Model ready for edge deployment
          </div>
        )}
      </div>

      <div className="mt-auto text-xs text-center text-muted-foreground pb-2">
        Smart Soil AI v1.0 • TinyML Edition
      </div>
    </aside>
  );
};
