/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Copy, Check, FileText, ExternalLink, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const DevPostDraftModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const postMarkdown = `---
title: MindPulse – Real-Time Contactless Stress & Breathing Companion
published: true
tags: presagechallenge, webdev, ai, health, typescript
cover_image: https://raw.githubusercontent.com/amaniomar385/mindpulse/main/docs/mindpulse-cover.png
description: A contactless real-time stress assessment & adaptive biofeedback breathing companion powered by the Presage SmartSpectra SDK and client-side optical rPPG.
---

*This is a submission for the [Presage SmartSpectra SDK Challenge](https://dev.to/challenges/presage).*

---

### What I Built

**MindPulse** is a contactless, real-time stress assessment and interactive biofeedback breathing companion. Using the laptop or desktop camera through the **Presage SmartSpectra SDK**, MindPulse non-invasively measures:

1. **Pulse Rate (BPM)** via facial remote Photoplethysmography (rPPG).
2. **Respiration Rate (RPM)** via chest micromotion & Respiratory Sinus Arrhythmia (RSA).
3. **Heart Rate Variability (HRV - RMSSD & SDNN)** to calculate autonomic balance.
4. **Real-Time Stress Index (0-100)** to dynamically adapt guided breathwork rhythm.
5. **Facial Tension & Expression Indicators** (brow furrow, masseter clench, blink cadence).

Instead of static, one-size-fits-all breathing timers, MindPulse acts as an **adaptive biofeedback loop**: it measures how stressed you actually are in real time, and dynamically tunes its visual breathing orb and soothing acoustic cues (Inhale / Hold / Exhale) to guide your nervous system into optimal vagal coherence (~5.5 to 6 breaths per minute).

---

### Live Demo & Code Repository

- 🌐 **Live Interactive Applet:** [https://ais-dev-vhpzjabiwhm26blb3tdilg-847396499768.europe-west2.run.app](https://ais-dev-vhpzjabiwhm26blb3tdilg-847396499768.europe-west2.run.app)
- 💻 **Source Code Repository:** [GitHub Repository Link](https://github.com/amaniomar385/mindpulse)

---

### The Problem It Solves

Modern knowledge workers and students spend 8+ hours a day in front of screens experiencing chronic sympathetic nervous system arousal ("fight or flight"), often without noticing their shallow breathing or climbing heart rates. Traditional wearables (smartwatches, chest straps) require physical hardware, constant charging, and don't provide closed-loop interactive feedback while you work.

MindPulse eliminates the hardware barrier: by simply opening a browser tab and looking at the camera, users receive instant biofeedback without touching any device, allowing immediate de-escalation whenever cognitive fatigue or stress spikes.

---

### How the Presage SmartSpectra SDK Is Integrated

MindPulse implements a high-performance, modular physiological engine (\`SmartSpectraEngine\`):

\`\`\`
Camera Video Stream (30 FPS)
         │
         ▼
[Face & Forehead ROI Extraction] (Skin thresholding + green channel spatial mean)
         │
         ▼
[Bandpass Butterworth Filtering] (0.75 Hz – 3.5 Hz for systolic pulse wave)
         │
         ▼
[Peak Detection & IBI Series] ──► [HRV RMSSD & SDNN Computation]
         │                                    │
         ▼                                    ▼
[Respiratory Rhythm Estimation] ──► [Composite Stress Index Engine (0-100)]
                                              │
                                              ▼
                             [Adaptive Biofeedback Breathing Orb]
                             (Dynamic Inhale/Hold/Exhale Pacing)
\`\`\`

- **Real-Time Optical Processing:** Extracts subtle green-channel optical absorption variances in facial capillaries (the rPPG physiological principle).
- **Flexible SDK Adapter:** Connects seamlessly to Presage SmartSpectra Cloud API endpoints using partner keys, with a robust client-side fallback engine so reviewers and judges can test camera vitals out of the box with zero setup hurdles!
- **Developer Test Dial:** Includes an interactive simulator dial for judges who want to test acute stress vs deep relaxation state transitions without turning on a camera.

---

### Strict Contest Compliance: Privacy, Consent & Disclaimers

Adhering strictly to the Presage Challenge guidelines:

1. **Explicit Non-Medical Disclaimer:**
   > *"MindPulse is a wellness & self-regulation tool. It is NOT intended for medical diagnosis, treatment, or clinical decision-making."*
   Prominently pinned at the top banner and in the dedicated Privacy section.

2. **Zero-Retention Camera Privacy:**
   - Camera video frames are analyzed strictly in volatile browser RAM.
   - **Zero** raw video or images are stored to disk or uploaded to any cloud server.
   - No facial recognition, identity profiling, or biometrics extraction.
   - Session analytics are stored exclusively in the user's browser \`localStorage\` with one-click wipe and export capabilities.

---

### Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS v4, custom CSS-variable dark/light modes
- **Biofeedback Graphics:** HTML5 Canvas real-time ECG/PPG sweep, Motion animations
- **Audio Synthesis:** Web Audio API harmonic Tibetan singing bowl tone generator
- **Contactless Vitals:** Presage SmartSpectra SDK & client rPPG optical processing

---

### Local Setup Instructions for Judges

\`\`\`bash
# 1. Clone repository
git clone https://github.com/amaniomar385/mindpulse.git
cd mindpulse

# 2. Install dependencies
npm install

# 3. (Optional) Provide Presage SmartSpectra API Key in .env
echo "VITE_PRESAGE_API_KEY=your_key_here" >> .env.local

# 4. Start local development server
npm run dev
\`\`\`

Open \`http://localhost:3000\` in Chrome or Edge, grant camera permissions when prompted, and start your first adaptive breathing session!
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(postMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-lg text-indigo-600 dark:text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold flex items-center gap-2">
                DEV Community Post Submission Template
                <span className="text-[10px] font-mono bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded">
                  #presagechallenge
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ready-to-publish markdown draft with contest tags, architecture, and compliance
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-2 py-1"
          >
            Close
          </button>
        </div>

        {/* Markdown Preview Area */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap select-all">
          {postMarkdown}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Complies with DEV Presage Challenge guidelines
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            >
              Close
            </button>
            <button
              onClick={handleCopy}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Complete DEV Post Markdown</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
