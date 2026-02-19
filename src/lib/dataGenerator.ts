/**
 * Synthetic Soil Moisture Data Generator
 * Generates time-series data simulating real soil moisture readings
 * with controllable anomaly injection.
 */

export interface SoilDataPoint {
  timestamp: number;
  moisture: number;
  isAnomaly: boolean;
}

/**
 * Generates a smooth base signal using sine waves + noise
 */
function generateNormalMoisture(t: number): number {
  // Multi-frequency sinusoid simulating diurnal cycles
  const base = 45 + 10 * Math.sin(t * 0.05) + 5 * Math.sin(t * 0.13 + 1.2);
  const noise = (Math.random() - 0.5) * 4;
  return Math.max(20, Math.min(80, base + noise));
}

/**
 * Main data generation function
 * @param numPoints - number of timesteps to generate
 * @param anomalyIntensity - 0–1 scale controlling anomaly magnitude
 */
export function generateSoilData(
  numPoints: number = 300,
  anomalyIntensity: number = 0.5
): SoilDataPoint[] {
  const data: SoilDataPoint[] = [];

  // Decide anomaly positions (approximately 8% of data points)
  const anomalyCount = Math.floor(numPoints * 0.08);
  const anomalySet = new Set<number>();

  while (anomalySet.size < anomalyCount) {
    // Avoid first and last 20 points
    anomalySet.add(Math.floor(Math.random() * (numPoints - 40)) + 20);
  }

  for (let i = 0; i < numPoints; i++) {
    const baseMoisture = generateNormalMoisture(i);

    if (anomalySet.has(i)) {
      // Inject anomaly: sudden spike or drop
      const type = Math.random() > 0.5 ? 'spike' : 'drop';
      const magnitude = 20 + anomalyIntensity * 30; // 20–50 units

      const anomalyValue =
        type === 'spike'
          ? Math.min(100, baseMoisture + magnitude)
          : Math.max(0, baseMoisture - magnitude);

      data.push({ timestamp: i, moisture: anomalyValue, isAnomaly: true });
    } else {
      data.push({ timestamp: i, moisture: baseMoisture, isAnomaly: false });
    }
  }

  return data;
}

/**
 * Creates sliding windows of fixed size for model input
 * @param data - array of moisture values (numbers)
 * @param windowSize - size of each window (default 10)
 */
export function createWindows(data: number[], windowSize: number = 10): number[][] {
  const windows: number[][] = [];
  for (let i = 0; i <= data.length - windowSize; i++) {
    windows.push(data.slice(i, i + windowSize));
  }
  return windows;
}

/**
 * Normalize a window to [0, 1] range using min-max scaling
 */
export function normalizeWindows(windows: number[][]): {
  normalized: number[][];
  min: number;
  max: number;
} {
  const flat = windows.flat();
  const min = Math.min(...flat);
  const max = Math.max(...flat);
  const range = max - min || 1;

  const normalized = windows.map((w) => w.map((v) => (v - min) / range));
  return { normalized, min, max };
}

/**
 * Parse CSV string into SoilDataPoint array
 * Expects columns: timestamp, moisture (optional isAnomaly column)
 */
export function parseCSV(csvText: string): SoilDataPoint[] {
  const lines = csvText.trim().split('\n');
  const header = lines[0].toLowerCase();
  const hasMoisture = header.includes('moisture');

  return lines
    .slice(1)
    .map((line, i) => {
      const parts = line.split(',').map((p) => p.trim());
      if (hasMoisture) {
        return {
          timestamp: parseInt(parts[0]) || i,
          moisture: parseFloat(parts[1]) || 50,
          isAnomaly: false,
        };
      }
      return {
        timestamp: i,
        moisture: parseFloat(parts[0]) || 50,
        isAnomaly: false,
      };
    })
    .filter((p) => !isNaN(p.moisture));
}
