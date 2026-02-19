/**
 * Smart Insights Engine
 * Analyzes soil data patterns and generates human-readable alerts
 */

import type { SoilDataPoint } from './dataGenerator';
import type { DetectionResult } from './anomalyDetection';

export interface Insight {
  id: string;
  type: 'warning' | 'critical' | 'info' | 'success';
  icon: string;
  message: string;
  timestamp: Date;
  timestep?: number;
}

/**
 * Generate insights from data + detection results
 */
export function generateInsights(
  data: SoilDataPoint[],
  detections: DetectionResult[],
  threshold: number
): Insight[] {
  const insights: Insight[] = [];
  const now = new Date();

  if (!data.length) return insights;

  // 1. System status
  const anomalyCount = detections.filter(d => d.isAnomaly).length;
  if (anomalyCount === 0) {
    insights.push({
      id: 'stable',
      type: 'success',
      icon: '✅',
      message: 'System stable. All moisture readings within normal parameters.',
      timestamp: now,
    });
  }

  // 2. High anomaly rate warning
  const anomalyRate = anomalyCount / Math.max(detections.length, 1);
  if (anomalyRate > 0.15) {
    insights.push({
      id: 'high-rate',
      type: 'critical',
      icon: '🚨',
      message: `High anomaly rate detected: ${(anomalyRate * 100).toFixed(1)}% of windows flagged. Sensor calibration recommended.`,
      timestamp: now,
    });
  }

  // 3. Sudden spike detection
  for (let i = 1; i < data.length; i++) {
    const delta = data[i].moisture - data[i - 1].moisture;
    if (Math.abs(delta) > 20) {
      const direction = delta > 0 ? 'spike' : 'drop';
      insights.push({
        id: `spike-${i}`,
        type: 'warning',
        icon: delta > 0 ? '📈' : '📉',
        message: `Sudden ${direction} detected at timestep ${i}: ${Math.abs(delta).toFixed(1)} unit change (${data[i - 1].moisture.toFixed(1)}% → ${data[i].moisture.toFixed(1)}%).`,
        timestamp: now,
        timestep: i,
      });
    }
  }

  // 4. Rapid decrease over last 20 samples
  const last20 = data.slice(-20);
  if (last20.length >= 20) {
    const trend = last20[19].moisture - last20[0].moisture;
    if (trend < -10) {
      insights.push({
        id: 'rapid-decrease',
        type: 'warning',
        icon: '💧',
        message: `Moisture decreasing rapidly over last 20 samples: −${Math.abs(trend).toFixed(1)}%. Consider irrigation.`,
        timestamp: now,
      });
    } else if (trend > 10) {
      insights.push({
        id: 'rapid-increase',
        type: 'info',
        icon: '🌧️',
        message: `Moisture increasing steadily over last 20 samples: +${trend.toFixed(1)}%. Possible rainfall or irrigation active.`,
        timestamp: now,
      });
    }
  }

  // 5. Overall moisture level
  const avgMoisture = data.reduce((s, d) => s + d.moisture, 0) / data.length;
  if (avgMoisture < 30) {
    insights.push({
      id: 'low-moisture',
      type: 'critical',
      icon: '🏜️',
      message: `Average moisture critically low: ${avgMoisture.toFixed(1)}%. Immediate irrigation required.`,
      timestamp: now,
    });
  } else if (avgMoisture > 70) {
    insights.push({
      id: 'high-moisture',
      type: 'warning',
      icon: '🌊',
      message: `Average moisture high: ${avgMoisture.toFixed(1)}%. Risk of waterlogging — reduce irrigation.`,
      timestamp: now,
    });
  } else {
    insights.push({
      id: 'optimal-moisture',
      type: 'info',
      icon: '🌱',
      message: `Average moisture optimal: ${avgMoisture.toFixed(1)}%. Ideal conditions for crop growth.`,
      timestamp: now,
    });
  }

  // 6. Model threshold suggestion
  const avgError = detections.reduce((s, d) => s + d.reconstructionError, 0) / Math.max(detections.length, 1);
  const suggestedThreshold = avgError * 2.5;
  if (Math.abs(suggestedThreshold - threshold) > 0.05 && detections.length > 0) {
    insights.push({
      id: 'threshold-suggestion',
      type: 'info',
      icon: '🎯',
      message: `AI suggestion: adjust threshold to ${suggestedThreshold.toFixed(3)} for optimal detection (current: ${threshold.toFixed(3)}).`,
      timestamp: now,
    });
  }

  // 7. Cluster of anomalies
  const anomalyTimesteps = detections.filter(d => d.isAnomaly).map(d => d.timestampCenter);
  for (let i = 0; i < anomalyTimesteps.length - 2; i++) {
    if (anomalyTimesteps[i + 2] - anomalyTimesteps[i] < 15) {
      insights.push({
        id: `cluster-${i}`,
        type: 'critical',
        icon: '⚡',
        message: `Anomaly cluster detected around timestep ${anomalyTimesteps[i + 1]}. Persistent sensor fault or soil disturbance.`,
        timestamp: now,
        timestep: anomalyTimesteps[i + 1],
      });
      break; // only report first cluster
    }
  }

  // Sort: critical first, then warning, then info, then success
  const order: Record<string, number> = { critical: 0, warning: 1, info: 2, success: 3 };
  return insights.sort((a, b) => order[a.type] - order[b.type]).slice(0, 8);
}
