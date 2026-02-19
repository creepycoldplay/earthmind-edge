/**
 * Smart Soil AI – TinyML Control Center
 * Main application shell — orchestrates all dashboard sections
 */
import React, { useState, useCallback, useRef } from 'react';
import { ControlPanel } from '@/components/dashboard/ControlPanel';
import { StatusCard } from '@/components/dashboard/StatusCard';
import { MoistureChart, ReconstructionErrorChart } from '@/components/dashboard/Charts';
import { MetricsPanel } from '@/components/dashboard/MetricsPanel';
import { TinyMLPanel } from '@/components/dashboard/TinyMLPanel';
import { InsightsBox } from '@/components/dashboard/InsightsBox';
import { DownloadCenter } from '@/components/dashboard/DownloadCenter';
import { LearnTab } from '@/pages/LearnTab';

import { generateSoilData, createWindows, normalizeWindows, parseCSV } from '@/lib/dataGenerator';
import type { SoilDataPoint } from '@/lib/dataGenerator';
import { trainAutoencoder, computeReconstructionError, getModelInfo, isModelReady } from '@/lib/autoencoderModel';
import type { ModelInfo } from '@/lib/autoencoderModel';
import { detectAnomalies, computeMetrics } from '@/lib/anomalyDetection';
import type { DetectionResult, PerformanceMetrics } from '@/lib/anomalyDetection';
import { generateInsights } from '@/lib/insights';
import type { Insight } from '@/lib/insights';
import { useToast } from '@/hooks/use-toast';

const WINDOW_SIZE = 10;

export default function Index() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'learn'>('dashboard');

  // ── Control state ─────────────────────────────────────
  const [numPoints, setNumPoints] = useState(300);
  const [anomalyIntensity, setAnomalyIntensity] = useState(0.5);
  const [threshold, setThreshold] = useState(0.02);

  // ── Data state ────────────────────────────────────────
  const [soilData, setSoilData] = useState<SoilDataPoint[]>([]);
  const normalizedRef = useRef<{ normalized: number[][]; min: number; max: number } | null>(null);
  const groundTruthRef = useRef<boolean[]>([]);

  // ── Model state ───────────────────────────────────────
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingLoss, setTrainingLoss] = useState(0);
  const [isTrained, setIsTrained] = useState(false);

  // ── Detection state ───────────────────────────────────
  const [detections, setDetections] = useState<DetectionResult[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);

  // ── TinyML state ──────────────────────────────────────
  const [isTFLiteConverted, setIsTFLiteConverted] = useState(false);
  const [isQuantized, setIsQuantized] = useState(false);

  // ─────────────────────────────────────────────────────
  // DATA GENERATION
  // ─────────────────────────────────────────────────────
  const handleGenerateData = useCallback(() => {
    const data = generateSoilData(numPoints, anomalyIntensity);
    setSoilData(data);
    groundTruthRef.current = data.map(d => d.isAnomaly);

    // Pre-compute windows for training
    const moistureValues = data.map(d => d.moisture);
    const allWindows = createWindows(moistureValues, WINDOW_SIZE);
    normalizedRef.current = normalizeWindows(allWindows);

    // Reset derived state
    setIsTrained(false);
    setDetections([]);
    setMetrics(null);
    setInsights([]);
    setIsTFLiteConverted(false);
    setIsQuantized(false);

    toast({
      title: '✅ Data Generated',
      description: `${data.length} timesteps • ${data.filter(d => d.isAnomaly).length} anomalies injected`,
    });
  }, [numPoints, anomalyIntensity, toast]);

  const handleCSVUpload = useCallback(async (file: File) => {
    const text = await file.text();
    try {
      const data = parseCSV(text);
      if (data.length < WINDOW_SIZE + 1) throw new Error('Need at least 11 data points');
      setSoilData(data);
      groundTruthRef.current = data.map(d => d.isAnomaly);

      const moistureValues = data.map(d => d.moisture);
      const allWindows = createWindows(moistureValues, WINDOW_SIZE);
      normalizedRef.current = normalizeWindows(allWindows);

      setIsTrained(false);
      setDetections([]);
      setMetrics(null);
      setInsights([]);

      toast({ title: '📂 CSV Loaded', description: `${data.length} timesteps imported` });
    } catch (err: any) {
      toast({ title: 'CSV Error', description: err.message, variant: 'destructive' });
    }
  }, [toast]);

  // ─────────────────────────────────────────────────────
  // MODEL TRAINING
  // ─────────────────────────────────────────────────────
  const handleTrain = useCallback(async () => {
    if (!normalizedRef.current || soilData.length === 0) return;

    setIsTraining(true);
    setTrainingProgress(0);
    setIsTrained(false);
    setDetections([]);
    setMetrics(null);
    setInsights([]);
    setIsTFLiteConverted(false);
    setIsQuantized(false);

    try {
      // Filter to only normal windows for training
      const normalIndices: number[] = [];
      soilData.forEach((d, i) => {
        if (!d.isAnomaly && i < normalizedRef.current!.normalized.length) {
          normalIndices.push(i);
        }
      });

      const normalWindows = normalIndices.map(i => normalizedRef.current!.normalized[i]);

      if (normalWindows.length < 10) throw new Error('Not enough normal data for training');

      await trainAutoencoder(normalWindows, {
        epochs: 60,
        batchSize: 32,
        onEpochEnd: (epoch, loss, progress) => {
          setTrainingProgress(progress);
          setTrainingLoss(loss);
        },
      });

      setIsTrained(true);
      toast({ title: '🧠 Model Trained', description: `Autoencoder converged successfully` });
    } catch (err: any) {
      toast({ title: 'Training Failed', description: err.message, variant: 'destructive' });
    } finally {
      setIsTraining(false);
    }
  }, [soilData, toast]);

  // ─────────────────────────────────────────────────────
  // ANOMALY DETECTION
  // ─────────────────────────────────────────────────────
  const handleDetect = useCallback(() => {
    if (!normalizedRef.current || !isModelReady()) return;

    try {
      const errors = computeReconstructionError(normalizedRef.current.normalized);
      const dets = detectAnomalies(errors, threshold, WINDOW_SIZE);
      const mets = computeMetrics(dets, groundTruthRef.current, WINDOW_SIZE);
      const info = getModelInfo();
      const ins = generateInsights(soilData, dets, threshold);

      setDetections(dets);
      setMetrics(mets);
      setModelInfo(info);
      setInsights(ins);

      const anomCount = dets.filter(d => d.isAnomaly).length;
      toast({
        title: `🔍 Detection Complete`,
        description: `${anomCount} anomalies detected • Accuracy: ${mets.accuracy}%`,
      });
    } catch (err: any) {
      toast({ title: 'Detection Error', description: err.message, variant: 'destructive' });
    }
  }, [threshold, soilData, toast]);

  // ─────────────────────────────────────────────────────
  // TINYML CONTROLS
  // ─────────────────────────────────────────────────────
  const handleConvertTFLite = useCallback(() => {
    if (!isModelReady()) return;
    const info = getModelInfo();
    setModelInfo(info);
    setIsTFLiteConverted(true);
    toast({
      title: '⚡ TFLite Conversion',
      description: `Model converted • ${info.originalSizeKB.toFixed(2)}KB → ready for quantization`,
    });
  }, [toast]);

  const handleQuantizeINT8 = useCallback(() => {
    if (!isTFLiteConverted) return;
    setIsQuantized(true);
    toast({
      title: '🔢 INT8 Quantization',
      description: `Model quantized to ${modelInfo?.quantizedSizeKB.toFixed(2)}KB • ${modelInfo?.reductionPercent}% smaller`,
    });
  }, [isTFLiteConverted, modelInfo, toast]);

  // ─────────────────────────────────────────────────────
  // DERIVED VALUES FOR STATUS CARD
  // ─────────────────────────────────────────────────────
  const lastMoisture = soilData[soilData.length - 1]?.moisture ?? 0;
  const lastDet = detections[detections.length - 1];
  const isAnomaly = lastDet?.isAnomaly ?? false;
  const anomalyCount = detections.filter(d => d.isAnomaly).length;
  const hasDetection = detections.length > 0;

  // ─────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'hsl(222 47% 5%)' }}>
      {/* ── HEADER ─────────────────────────────────────── */}
      <header className="header-bg px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl animate-pulse-glow-green"
              style={{ background: 'hsl(152 100% 50% / 0.1)', border: '1px solid hsl(152 100% 50% / 0.4)' }}
            >
              🌱
            </div>
            <div>
              <h1 className="text-lg font-black gradient-text-green leading-none">
                Smart Soil AI – TinyML Control Center
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Edge Intelligence for Precision Agriculture
              </p>
            </div>
          </div>

          {/* Nav tabs */}
          <div
            className="flex rounded-lg p-1 gap-1"
            style={{ background: 'hsl(220 40% 8%)', border: '1px solid hsl(220 30% 16%)' }}
          >
            {(['dashboard', 'learn'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200"
                style={{
                  background: activeTab === tab ? 'hsl(152 100% 50% / 0.15)' : 'transparent',
                  border: activeTab === tab ? '1px solid hsl(152 100% 50% / 0.35)' : '1px solid transparent',
                  color: activeTab === tab ? 'hsl(152 100% 50%)' : 'hsl(215 20% 50%)',
                }}
              >
                {tab === 'dashboard' ? '📊 Dashboard' : '📚 Learn'}
              </button>
            ))}
          </div>

          {/* Live status indicator */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background: hasDetection ? (isAnomaly ? 'hsl(0 100% 60%)' : 'hsl(152 100% 50%)') : 'hsl(220 30% 30%)',
                boxShadow: hasDetection ? `0 0 8px ${isAnomaly ? 'hsl(0 100% 60%)' : 'hsl(152 100% 50%)'}` : 'none',
              }}
            />
            <span className="text-muted-foreground">
              {!soilData.length ? 'No Data' : !isTrained ? 'Ready to Train' : !hasDetection ? 'Awaiting Detection' : isAnomaly ? 'ANOMALY' : 'NORMAL'}
            </span>
          </div>
        </div>
      </header>

      {/* ── BODY ───────────────────────────────────────── */}
      <div className="flex flex-1">
        {activeTab === 'dashboard' && (
          <ControlPanel
            numPoints={numPoints}
            onNumPointsChange={setNumPoints}
            anomalyIntensity={anomalyIntensity}
            onAnomalyIntensityChange={setAnomalyIntensity}
            onGenerateData={handleGenerateData}
            onCSVUpload={handleCSVUpload}
            threshold={threshold}
            onThresholdChange={setThreshold}
            onTrain={handleTrain}
            onDetect={handleDetect}
            isTraining={isTraining}
            trainingProgress={trainingProgress}
            trainingLoss={trainingLoss}
            onConvertTFLite={handleConvertTFLite}
            onQuantizeINT8={handleQuantizeINT8}
            isTFLiteConverted={isTFLiteConverted}
            isQuantized={isQuantized}
            hasData={soilData.length > 0}
            isTrained={isTrained}
          />
        )}

        {/* ── MAIN CONTENT ─────────────────────────────── */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'learn' ? (
            <LearnTab />
          ) : (
            <div className="p-5 space-y-5 max-w-7xl">
              {/* Quick-start prompt if no data */}
              {soilData.length === 0 && (
                <div
                  className="rounded-xl p-6 text-center animate-fade-slide-in"
                  style={{ background: 'hsl(152 100% 50% / 0.04)', border: '1px dashed hsl(152 100% 50% / 0.25)' }}
                >
                  <div className="text-4xl mb-3">🌾</div>
                  <h2 className="font-bold text-neon-green mb-1">Welcome to Smart Soil AI</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Click <strong className="text-neon-green">Generate Synthetic Data</strong> in the sidebar to begin,
                    then Train → Detect → Analyze.
                  </p>
                  <div className="flex justify-center gap-3 text-xs text-muted-foreground">
                    <span>1️⃣ Generate Data</span>
                    <span>→</span>
                    <span>2️⃣ Train Model</span>
                    <span>→</span>
                    <span>3️⃣ Run Detection</span>
                    <span>→</span>
                    <span>4️⃣ Analyze Results</span>
                  </div>
                </div>
              )}

              {/* Section 1 – Status Card */}
              {soilData.length > 0 && (
                <StatusCard
                  moisture={lastMoisture}
                  isAnomaly={isAnomaly}
                  hasDetection={hasDetection}
                  anomalyCount={anomalyCount}
                  totalPoints={detections.length}
                />
              )}

              {/* Section 2 – Moisture Chart */}
              {soilData.length > 0 && (
                <MoistureChart
                  data={soilData}
                  detections={detections}
                  hasDetection={hasDetection}
                />
              )}

              {/* Section 3 – Reconstruction Error */}
              <ReconstructionErrorChart
                detections={detections}
                threshold={threshold}
              />

              {/* Section 4 & 5 – Side by side */}
              <div className="grid grid-cols-2 gap-5">
                <MetricsPanel metrics={metrics} />
                <TinyMLPanel
                  modelInfo={modelInfo}
                  isTFLiteConverted={isTFLiteConverted}
                  isQuantized={isQuantized}
                />
              </div>

              {/* Section 6 & 7 – Side by side */}
              <div className="grid grid-cols-2 gap-5">
                <InsightsBox insights={insights} />
                <DownloadCenter
                  data={soilData}
                  detections={detections}
                  metrics={metrics}
                  isTrained={isTrained}
                  hasDetection={hasDetection}
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
