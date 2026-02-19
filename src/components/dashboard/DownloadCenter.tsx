/**
 * Download Center — Section 7
 */
import React from 'react';
import { Download, FileText, Cpu, BarChart3 } from 'lucide-react';
import type { SoilDataPoint } from '@/lib/dataGenerator';
import type { DetectionResult, PerformanceMetrics } from '@/lib/anomalyDetection';
import { buildAnomalyReportCSV, buildPerformanceSummaryCSV } from '@/lib/anomalyDetection';
import { exportModelSummaryJSON } from '@/lib/autoencoderModel';

interface DownloadCenterProps {
  data: SoilDataPoint[];
  detections: DetectionResult[];
  metrics: PerformanceMetrics | null;
  isTrained: boolean;
  hasDetection: boolean;
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

interface DownloadButtonProps {
  icon: React.ElementType;
  label: string;
  sublabel: string;
  disabled: boolean;
  color: string;
  onClick: () => void;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({
  icon: Icon, label, sublabel, disabled, color, onClick
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="flex items-center gap-3 p-4 rounded-xl w-full text-left transition-all duration-200 group"
    style={{
      background: disabled ? 'hsl(220 40% 7%)' : `${color}08`,
      border: `1px solid ${disabled ? 'hsl(220 30% 16%)' : `${color}30`}`,
      opacity: disabled ? 0.5 : 1,
      cursor: disabled ? 'not-allowed' : 'pointer',
    }}
    onMouseEnter={(e) => {
      if (!disabled) {
        (e.currentTarget as HTMLElement).style.borderColor = `${color}60`;
        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 12px ${color}15`;
      }
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLElement).style.borderColor = disabled ? 'hsl(220 30% 16%)' : `${color}30`;
      (e.currentTarget as HTMLElement).style.boxShadow = 'none';
    }}
  >
    <div
      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
      style={{
        background: `${color}10`,
        border: `1px solid ${color}30`,
      }}
    >
      <Icon className="w-5 h-5" style={{ color }} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="font-semibold text-sm" style={{ color: disabled ? 'hsl(215 20% 40%)' : color }}>
        {label}
      </div>
      <div className="text-xs text-muted-foreground mt-0.5">{sublabel}</div>
    </div>
    <Download className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color }} />
  </button>
);

export const DownloadCenter: React.FC<DownloadCenterProps> = ({
  data, detections, metrics, isTrained, hasDetection
}) => {
  const handleAnomalyReport = () => {
    const csv = buildAnomalyReportCSV(detections, data);
    downloadFile(csv, 'soil_anomaly_report.csv', 'text/csv');
  };

  const handleModelSummary = () => {
    const json = exportModelSummaryJSON();
    downloadFile(json, 'soil_autoencoder_tflite_summary.json', 'application/json');
  };

  const handlePerformanceSummary = () => {
    if (!metrics) return;
    const csv = buildPerformanceSummaryCSV(metrics);
    downloadFile(csv, 'performance_summary.csv', 'text/csv');
  };

  return (
    <div className="glass-card p-5">
      <div className="section-label mb-1">Section 7</div>
      <h3 className="font-bold text-sm mb-4" style={{ color: 'hsl(152 100% 50%)' }}>
        📥 Download Center
      </h3>

      <div className="space-y-3">
        <DownloadButton
          icon={FileText}
          label="Anomaly Report"
          sublabel="CSV — timestep, moisture, error, confidence"
          disabled={!hasDetection}
          color="hsl(0 100% 60%)"
          onClick={handleAnomalyReport}
        />
        <DownloadButton
          icon={Cpu}
          label="Quantized Model Summary"
          sublabel="JSON — simulated .tflite export with metadata"
          disabled={!isTrained}
          color="hsl(174 100% 40%)"
          onClick={handleModelSummary}
        />
        <DownloadButton
          icon={BarChart3}
          label="Performance Summary"
          sublabel="CSV — accuracy, precision, recall, F1, confusion matrix"
          disabled={!metrics}
          color="hsl(210 100% 65%)"
          onClick={handlePerformanceSummary}
        />
      </div>
    </div>
  );
};
