/**
 * Anomaly Detection Engine
 * Uses reconstruction error from the autoencoder to classify anomalies
 * and compute evaluation metrics against ground truth labels.
 */

export interface DetectionResult {
  windowIndex: number;
  timestampCenter: number;
  reconstructionError: number;
  isAnomaly: boolean;
  confidence: number;
}

export interface PerformanceMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  truePositives: number;
  trueNegatives: number;
  falsePositives: number;
  falseNegatives: number;
  totalAnomalies: number;
  detectedAnomalies: number;
}

/**
 * Classify each window as anomaly or normal based on reconstruction error
 * @param errors - reconstruction error per window
 * @param threshold - error threshold above which = anomaly
 * @param windowSize - size of sliding window (used to compute center timestamp)
 */
export function detectAnomalies(
  errors: number[],
  threshold: number,
  windowSize: number = 10
): DetectionResult[] {
  const maxError = Math.max(...errors, 0.001);

  return errors.map((error, i) => {
    const isAnomaly = error > threshold;
    // Confidence = how much over/under threshold (0–1 scale)
    const confidence = isAnomaly
      ? Math.min(1, error / (threshold * 2))
      : Math.min(1, 1 - error / threshold);

    return {
      windowIndex: i,
      timestampCenter: i + Math.floor(windowSize / 2),
      reconstructionError: error,
      isAnomaly,
      confidence: parseFloat(confidence.toFixed(3)),
    };
  });
}

/**
 * Compute classification metrics by comparing detected anomalies 
 * against ground truth labels from the original dataset
 * @param detections - results from detectAnomalies
 * @param groundTruth - isAnomaly flag per original data point
 * @param windowSize - window size (for alignment)
 */
export function computeMetrics(
  detections: DetectionResult[],
  groundTruth: boolean[],
  windowSize: number = 10
): PerformanceMetrics {
  let tp = 0, tn = 0, fp = 0, fn = 0;

  detections.forEach((det) => {
    // Map window center back to ground truth
    const gtIndex = Math.min(det.timestampCenter, groundTruth.length - 1);
    const actualAnomaly = groundTruth[gtIndex];

    if (det.isAnomaly && actualAnomaly) tp++;
    else if (!det.isAnomaly && !actualAnomaly) tn++;
    else if (det.isAnomaly && !actualAnomaly) fp++;
    else fn++;
  });

  const total = tp + tn + fp + fn;
  const accuracy = total > 0 ? (tp + tn) / total : 0;
  const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
  const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
  const f1Score = precision + recall > 0
    ? (2 * precision * recall) / (precision + recall)
    : 0;

  const totalAnomalies = groundTruth.filter(Boolean).length;
  const detectedAnomalies = detections.filter(d => d.isAnomaly).length;

  return {
    accuracy: parseFloat((accuracy * 100).toFixed(1)),
    precision: parseFloat((precision * 100).toFixed(1)),
    recall: parseFloat((recall * 100).toFixed(1)),
    f1Score: parseFloat((f1Score * 100).toFixed(1)),
    truePositives: tp,
    trueNegatives: tn,
    falsePositives: fp,
    falseNegatives: fn,
    totalAnomalies,
    detectedAnomalies,
  };
}

/**
 * Build anomaly report rows for CSV download
 */
export function buildAnomalyReportCSV(
  detections: DetectionResult[],
  moistureData: { timestamp: number; moisture: number; isAnomaly: boolean }[],
  windowSize: number = 10
): string {
  const header = 'Timestamp,Moisture,Reconstruction_Error,Detected_Anomaly,Confidence\n';

  const rows = detections
    .filter(d => d.isAnomaly)
    .map(d => {
      const dp = moistureData[Math.min(d.timestampCenter, moistureData.length - 1)];
      return `${d.timestampCenter},${dp?.moisture?.toFixed(2) ?? ''},${d.reconstructionError.toFixed(6)},true,${(d.confidence * 100).toFixed(1)}%`;
    })
    .join('\n');

  return header + rows;
}

/**
 * Build performance summary CSV
 */
export function buildPerformanceSummaryCSV(metrics: PerformanceMetrics): string {
  return [
    'Metric,Value',
    `Accuracy,${metrics.accuracy}%`,
    `Precision,${metrics.precision}%`,
    `Recall,${metrics.recall}%`,
    `F1 Score,${metrics.f1Score}%`,
    `True Positives,${metrics.truePositives}`,
    `True Negatives,${metrics.trueNegatives}`,
    `False Positives,${metrics.falsePositives}`,
    `False Negatives,${metrics.falseNegatives}`,
    `Total Ground Truth Anomalies,${metrics.totalAnomalies}`,
    `Total Detected Anomalies,${metrics.detectedAnomalies}`,
  ].join('\n');
}
