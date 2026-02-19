/**
 * TensorFlow.js Dense Autoencoder for Anomaly Detection
 * Architecture: Input(10) → Dense(8, ReLU) → Dense(10)
 * Trained only on normal (non-anomalous) data windows
 */

import * as tf from '@tensorflow/tfjs';

export interface TrainingConfig {
  epochs?: number;
  batchSize?: number;
  learningRate?: number;
  onEpochEnd?: (epoch: number, loss: number, progress: number) => void;
}

export interface ModelInfo {
  originalSizeKB: number;
  quantizedSizeKB: number;
  reductionPercent: number;
  estimatedRAMKB: number;
  inferenceTimeMs: number;
  parameterCount: number;
}

let model: tf.Sequential | null = null;
let isModelTrained = false;

/**
 * Build the dense autoencoder
 */
export function buildAutoencoder(inputSize: number = 10): tf.Sequential {
  const ae = tf.sequential();

  // Encoder
  ae.add(tf.layers.dense({
    units: 8,
    activation: 'relu',
    inputShape: [inputSize],
    name: 'encoder',
    kernelInitializer: 'glorotUniform',
  }));

  // Decoder
  ae.add(tf.layers.dense({
    units: inputSize,
    activation: 'sigmoid',
    name: 'decoder',
    kernelInitializer: 'glorotUniform',
  }));

  ae.compile({
    optimizer: tf.train.adam(0.001),
    loss: 'meanSquaredError',
  });

  return ae;
}

/**
 * Train the autoencoder on normal data only
 * @param normalWindows - 2D array of normalized windows from non-anomalous samples
 * @param config - training configuration with optional progress callback
 */
export async function trainAutoencoder(
  normalWindows: number[][],
  config: TrainingConfig = {}
): Promise<{ loss: number[] }> {
  const {
    epochs = 50,
    batchSize = 32,
    onEpochEnd,
  } = config;

  model = buildAutoencoder(10);
  isModelTrained = false;

  const xs = tf.tensor2d(normalWindows);
  const lossHistory: number[] = [];

  await model.fit(xs, xs, {
    epochs,
    batchSize,
    shuffle: true,
    validationSplit: 0.1,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        const loss = logs?.loss ?? 0;
        lossHistory.push(loss);
        const progress = Math.round(((epoch + 1) / epochs) * 100);
        onEpochEnd?.(epoch + 1, loss, progress);
      },
    },
  });

  xs.dispose();
  isModelTrained = true;
  return { loss: lossHistory };
}

/**
 * Compute reconstruction error for each window
 * @param windows - 2D array of normalized windows (all samples)
 * @returns array of per-window MSE reconstruction errors
 */
export function computeReconstructionError(windows: number[][]): number[] {
  if (!model) throw new Error('Model not trained yet');

  const xs = tf.tensor2d(windows);
  const reconstructed = model.predict(xs) as tf.Tensor;
  
  // Per-sample MSE
  const diff = xs.sub(reconstructed);
  const squaredDiff = diff.square();
  const mse = squaredDiff.mean(1);
  
  const errors = Array.from(mse.dataSync());
  
  xs.dispose();
  reconstructed.dispose();
  diff.dispose();
  squaredDiff.dispose();
  mse.dispose();

  return errors;
}

/**
 * Calculate model size and TinyML memory statistics
 */
export function getModelInfo(): ModelInfo {
  if (!model) {
    return {
      originalSizeKB: 0,
      quantizedSizeKB: 0,
      reductionPercent: 0,
      estimatedRAMKB: 0,
      inferenceTimeMs: 0,
      parameterCount: 0,
    };
  }

  // Count parameters: (10×8 + 8) + (8×10 + 10) = 88+8+80+10 = 186 params
  const paramCount = model.countParams();
  
  // Float32 = 4 bytes per param
  const originalSizeKB = (paramCount * 4) / 1024;
  
  // INT8 quantization = 1 byte per param (~4x reduction) + overhead
  const quantizedSizeKB = (paramCount * 1) / 1024 + 2; // +2KB for metadata/header
  
  const reductionPercent = Math.round(((originalSizeKB - quantizedSizeKB) / originalSizeKB) * 100);
  
  // Estimated RAM: activations + weights + overhead (for embedded target)
  const estimatedRAMKB = quantizedSizeKB * 2 + 4; // activations ≈ weight size, +4KB runtime
  
  // Simulated inference time (typical for ARM Cortex-M at ~80MHz)
  const inferenceTimeMs = parseFloat((paramCount * 0.002 + Math.random() * 0.3).toFixed(2));

  return {
    originalSizeKB: parseFloat(originalSizeKB.toFixed(2)),
    quantizedSizeKB: parseFloat(quantizedSizeKB.toFixed(2)),
    reductionPercent,
    estimatedRAMKB: parseFloat(estimatedRAMKB.toFixed(2)),
    inferenceTimeMs,
    parameterCount: paramCount,
  };
}

/**
 * Export a simulated model summary as JSON (mimicking .tflite metadata)
 */
export function exportModelSummaryJSON(): string {
  const info = getModelInfo();
  const summary = {
    model_name: 'soil_moisture_autoencoder',
    version: '1.0.0',
    format: 'TFLite-INT8-simulated',
    architecture: {
      type: 'Dense Autoencoder',
      input_shape: [10],
      layers: [
        { name: 'encoder', type: 'Dense', units: 8, activation: 'relu' },
        { name: 'decoder', type: 'Dense', units: 10, activation: 'sigmoid' },
      ],
    },
    parameters: info.parameterCount,
    original_size_kb: info.originalSizeKB,
    quantized_size_kb: info.quantizedSizeKB,
    quantization: 'INT8',
    size_reduction_percent: info.reductionPercent,
    estimated_ram_kb: info.estimatedRAMKB,
    inference_time_ms: info.inferenceTimeMs,
    target_devices: ['ESP32', 'Arduino Nano 33 BLE', 'STM32', 'Raspberry Pi Pico'],
    created_at: new Date().toISOString(),
  };
  return JSON.stringify(summary, null, 2);
}

export function isModelReady(): boolean {
  return isModelTrained && model !== null;
}

export function getModel(): tf.Sequential | null {
  return model;
}
