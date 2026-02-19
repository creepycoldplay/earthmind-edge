/**
 * Learn Tab — Educational content on TinyML, Edge AI, and Anomaly Detection
 */
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface LearnSection {
  id: string;
  emoji: string;
  title: string;
  content: React.ReactNode;
}

const sections: LearnSection[] = [
  {
    id: '1',
    emoji: '🔍',
    title: 'What is Anomaly Detection?',
    content: (
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
        <p>
          <strong className="text-neon-green">Anomaly detection</strong> is the process of identifying data points, 
          events, or observations that deviate significantly from the expected pattern or norm.
        </p>
        <div className="p-3 rounded-lg" style={{ background: 'hsl(152 100% 50% / 0.05)', border: '1px solid hsl(152 100% 50% / 0.15)' }}>
          <div className="font-semibold text-neon-green mb-1">🌱 Analogy: The Garden Watchman</div>
          <p>
            Imagine a farmer who knows exactly how moist their soil should be at each time of day. 
            If the moisture suddenly spikes to 95% in the middle of a dry afternoon, that's an anomaly — 
            a broken sprinkler, faulty sensor, or flooding. The autoencoder learns the "normal" patterns 
            and raises an alarm when something unusual happens.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg" style={{ background: 'hsl(220 40% 10%)', border: '1px solid hsl(220 30% 20%)' }}>
            <div className="font-semibold text-xs mb-1" style={{ color: 'hsl(174 100% 40%)' }}>Statistical Methods</div>
            <ul className="text-xs space-y-1">
              <li>• Z-score / IQR thresholds</li>
              <li>• Moving average deviation</li>
              <li>• Simple & fast</li>
              <li>• Needs manual tuning</li>
            </ul>
          </div>
          <div className="p-3 rounded-lg" style={{ background: 'hsl(220 40% 10%)', border: '1px solid hsl(152 100% 50% / 0.2)' }}>
            <div className="font-semibold text-xs mb-1 text-neon-green">Autoencoder (This App)</div>
            <ul className="text-xs space-y-1">
              <li>• Learns complex patterns</li>
              <li>• Unsupervised (no labels)</li>
              <li>• Self-adapting threshold</li>
              <li>• Works on edge devices</li>
            </ul>
          </div>
        </div>
        <p>
          Our autoencoder is trained <strong className="text-neon-green">only on normal data</strong>. 
          When an anomaly appears, the model fails to reconstruct it accurately, producing a high 
          <strong> reconstruction error</strong> — our anomaly signal.
        </p>
      </div>
    ),
  },
  {
    id: '2',
    emoji: '🤖',
    title: 'What is TinyML?',
    content: (
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
        <p>
          <strong className="text-neon-green">TinyML</strong> is the field of machine learning focused on 
          deploying trained models on ultra-low-power microcontrollers and embedded systems — 
          devices with as little as <strong>256KB RAM</strong> and no internet connection required.
        </p>
        <div className="grid grid-cols-3 gap-2 my-2">
          {[
            { label: 'Power', value: '< 1mW', color: 'hsl(152 100% 50%)' },
            { label: 'RAM', value: '< 512KB', color: 'hsl(174 100% 40%)' },
            { label: 'Cost', value: '< $5', color: 'hsl(210 100% 65%)' },
          ].map((s) => (
            <div key={s.label} className="text-center p-3 rounded-lg" style={{ background: 'hsl(220 40% 8%)', border: `1px solid ${s.color}20` }}>
              <div className="text-lg font-black font-mono" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="p-3 rounded-lg space-y-2" style={{ background: 'hsl(220 40% 8%)', border: '1px solid hsl(174 100% 40% / 0.2)' }}>
          <div className="font-semibold text-xs" style={{ color: 'hsl(174 100% 40%)' }}>TinyML Pipeline (Used in This App)</div>
          <div className="flex items-center gap-2 text-xs flex-wrap">
            {['Train in Python/TF.js', '→', 'Convert to TFLite', '→', 'Quantize INT8', '→', 'Deploy to MCU'].map((step, i) => (
              <span key={i} style={{ color: i % 2 === 0 ? 'hsl(152 100% 50%)' : 'hsl(215 20% 40%)' }}>
                {step}
              </span>
            ))}
          </div>
        </div>
        <p>
          <strong className="text-neon-green">Quantization</strong> converts 32-bit floating point weights to 
          8-bit integers (INT8), reducing model size by ~4x and inference time significantly — 
          making it feasible to run on devices like the <strong>ESP32</strong> which has only 520KB SRAM.
        </p>
      </div>
    ),
  },
  {
    id: '3',
    emoji: '🌾',
    title: 'Why Edge AI Matters in Agriculture?',
    content: (
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
        <p>
          Agriculture is one of the most data-rich industries on Earth — yet 70% of farms have 
          <strong className="text-neon-green"> no internet connectivity</strong>. Edge AI solves this 
          by processing data locally, at the source.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { title: '⚡ Ultra-Low Latency', desc: 'Detect drought or flooding in milliseconds without waiting for cloud response.' },
            { title: '🔋 Battery Powered', desc: 'Soil sensors can run for months on a single AA battery with TinyML inference.' },
            { title: '🔒 Data Privacy', desc: 'Farm data stays on-device — no proprietary agricultural data sent to cloud servers.' },
            { title: '💰 Cost Effective', desc: 'Eliminate costly cloud subscriptions; a $3 ESP32 can run this entire model.' },
          ].map((item) => (
            <div key={item.title} className="p-3 rounded-lg" style={{ background: 'hsl(220 40% 8%)', border: '1px solid hsl(220 30% 18%)' }}>
              <div className="font-semibold text-xs mb-1" style={{ color: 'hsl(152 100% 50%)' }}>{item.title}</div>
              <p className="text-xs">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="p-3 rounded-lg" style={{ background: 'hsl(152 100% 50% / 0.04)', border: '1px solid hsl(152 100% 50% / 0.15)' }}>
          <strong className="text-neon-green">Real-World Impact:</strong>
          <p className="mt-1">
            Smart irrigation systems using TinyML have demonstrated <strong>30–50% water savings</strong> 
            by detecting soil anomalies and adjusting irrigation in real-time, 
            without cloud connectivity.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: '4',
    emoji: '🚀',
    title: 'Future Hardware Deployment',
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>This browser-based model can be exported and deployed to real microcontrollers with minimal code changes.</p>

        <div className="space-y-3">
          {[
            {
              name: 'ESP32 (Espressif)',
              color: 'hsl(174 100% 40%)',
              specs: '240MHz dual-core, 520KB SRAM, WiFi/BT, $3–6',
              steps: ['Export model to .tflite', 'Use TFLite Micro C++ library', 'Read ADC from capacitive sensor', 'Serial output anomaly alerts'],
            },
            {
              name: 'Arduino Nano 33 BLE Sense',
              color: 'hsl(210 100% 65%)',
              specs: '64MHz ARM Cortex-M4, 256KB RAM, BLE, $25–30',
              steps: ['Use Arduino TinyML toolkit', 'TFLite Micro pre-integrated', 'BLE beacon on anomaly', 'Log to SD card or OLED'],
            },
          ].map((device) => (
            <div key={device.name} className="p-4 rounded-xl" style={{ background: 'hsl(220 40% 8%)', border: `1px solid ${device.color}25` }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full" style={{ background: device.color }} />
                <div className="font-bold text-xs" style={{ color: device.color }}>{device.name}</div>
              </div>
              <div className="text-xs mb-3 font-mono" style={{ color: 'hsl(215 20% 50%)' }}>{device.specs}</div>
              <div className="text-xs font-semibold mb-1.5 text-muted-foreground uppercase tracking-wider">Deployment Steps:</div>
              <ol className="space-y-1">
                {device.steps.map((step, i) => (
                  <li key={i} className="text-xs flex items-start gap-2">
                    <span className="font-mono shrink-0" style={{ color: device.color }}>{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>

        <div className="p-3 rounded-lg text-xs" style={{ background: 'hsl(45 100% 60% / 0.05)', border: '1px solid hsl(45 100% 60% / 0.2)' }}>
          <strong style={{ color: 'hsl(45 100% 60%)' }}>📌 Note:</strong> This app simulates the TFLite quantization process.
          Real deployment requires Python TensorFlow 2.x to generate an actual binary .tflite file.
          The model architecture and training pipeline in this app are fully portable.
        </div>
      </div>
    ),
  },
];

export const LearnTab: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4 animate-fade-slide-in">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-black gradient-text-green mb-2">📚 TinyML Knowledge Center</h2>
        <p className="text-muted-foreground text-sm">
          Understand the science behind Smart Soil AI — from anomaly detection to edge deployment.
        </p>
      </div>

      <Accordion type="multiple" defaultValue={['1']} className="space-y-3">
        {sections.map((section) => (
          <AccordionItem
            key={section.id}
            value={section.id}
            className="glass-card rounded-xl overflow-hidden"
            style={{ border: '1px solid hsl(152 100% 50% / 0.15)' }}
          >
            <AccordionTrigger
              className="px-5 py-4 hover:no-underline"
              style={{ color: 'hsl(160 100% 90%)' }}
            >
              <div className="flex items-center gap-3 text-left">
                <span className="text-xl">{section.emoji}</span>
                <span className="font-bold text-sm">{section.title}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-5">
              {section.content}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Citation footer */}
      <div className="mt-8 p-4 rounded-xl text-xs text-center text-muted-foreground" style={{ background: 'hsl(220 40% 7%)', border: '1px solid hsl(220 30% 14%)' }}>
        <div className="font-mono mb-1" style={{ color: 'hsl(152 100% 50%)' }}>TinyML-Based Soil Moisture Anomaly Detection</div>
        Built with React + TensorFlow.js • Dense Autoencoder • INT8 Quantization Simulation
      </div>
    </div>
  );
};
