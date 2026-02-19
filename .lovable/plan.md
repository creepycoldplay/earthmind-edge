
## 🌱 Smart Soil AI – TinyML Control Center

A full React + TensorFlow.js dashboard with a futuristic dark AgriTech UI. Here's exactly what I'll build:

---

### 🎨 Visual Design System
- **Dark theme** with deep navy/black backgrounds (`#0a0f1e`, `#0d1117`)
- **Green/teal accent colors** (`#00ff88`, `#00d4aa`) for highlights and glowing effects
- **Glassmorphism cards** with `backdrop-blur`, semi-transparent borders, and subtle glow shadows
- **Custom CSS animations**: pulse for anomaly alerts, glow effects, smooth fade-ins
- **Modern monospace + sans-serif font pairing**

---

### 📐 App Structure

**Header**: `🌱 Smart Soil AI – TinyML Control Center` with subtitle "Edge Intelligence for Precision Agriculture" — full-width glowing banner

**Navigation Tabs** (top): Dashboard | Learn

---

### 🗂️ Dashboard Tab — 7 Sections

**Left Sidebar (Control Panel)**
- *Data Controls*: Generate Synthetic Data button, CSV upload, slider for data points (100–1000), slider for anomaly intensity
- *Model Controls*: Train Autoencoder button with live training progress bar, reconstruction threshold slider, Run Detection button
- *TinyML Controls*: Convert to TFLite button, Quantize to INT8 button — all with status indicators

**Section 1 – Live Soil Status Card** (top center)
- Large glowing card showing current moisture value
- Animated status badge: 🟢 NORMAL / 🔴 ANOMALY with CSS pulse animation
- Updates in real-time as detection runs

**Section 2 – Moisture Visualization**
- Recharts line chart (dark themed) — moisture over time
- Red glowing dots overlaid on anomaly timesteps
- Zoom support, hover tooltips with timestamp + moisture value

**Section 3 – AI Brain Visualization**
- Reconstruction error line chart
- Horizontal threshold line (dashed, teal)
- Red shaded regions where error exceeds threshold
- Animated indicator dot that pulses when active

**Section 4 – Performance & Metrics Panel**
- 4 glowing metric cards: Accuracy, Precision, Recall, F1 Score
- Confusion Matrix rendered as a 2×2 color-coded heatmap grid

**Section 5 – TinyML Edge Simulation Panel**
- Glowing panel showing: Original model size (KB), Quantized model size (KB), % reduction, Estimated RAM usage, Inference time (ms)
- Info tooltip: "How this model could run on microcontrollers like ESP32"

**Section 6 – Smart Insights Box**
- Auto-generated text insights based on data patterns:
  - Spike detection, rapid decrease alerts, stability messages
  - Timestamped, styled like a terminal/log feed

**Section 7 – Download Center**
- Download Anomaly Report (CSV)
- Download Model Summary (JSON, simulating .tflite export info)
- Export Performance Summary (CSV)

---

### 📚 Learn Tab

Four accordion sections explaining:
1. **What is Anomaly Detection?** — with visual analogy
2. **What is TinyML?** — definition + why it matters
3. **Why Edge AI in Agriculture?** — use cases, latency benefits
4. **Future Deployment** — ESP32, Arduino Nano 33 BLE, deployment steps

---

### 🤖 TensorFlow.js Autoencoder (Real ML in Browser)

- Load `@tensorflow/tfjs` via npm
- Build a Dense Autoencoder: Input(10) → Dense(8, ReLU) → Dense(10)
- Train only on normal data (sliding windows of 10 timesteps)
- Compute reconstruction error per sample
- Flag anomalies where error > user-set threshold
- Simulate quantization by calculating INT8 size reduction (~4x)

---

### 📁 File Structure
- `src/pages/Index.tsx` — main app shell with tabs
- `src/pages/LearnTab.tsx` — education content
- `src/components/dashboard/` — sidebar, status card, charts, metrics, tinyml panel, insights, download center
- `src/lib/dataGenerator.ts` — synthetic soil data with injected anomalies
- `src/lib/autoencoderModel.ts` — TensorFlow.js model definition & training
- `src/lib/anomalyDetection.ts` — reconstruction error + metrics calculation
- `src/lib/insights.ts` — smart insight generation logic
- `src/index.css` — dark theme, glassmorphism, glow animations

