# MindPulse – Real-Time Stress & Breathing Companion

> **Presage SmartSpectra SDK Challenge Submission on DEV Community**  
> *Category:* Best Thoughtful Real-World Use / Best Overall Human-Sensing Experience  
> *Tags:* `#presagechallenge` `#webdev` `#ai` `#health`

![MindPulse Banner](https://raw.githubusercontent.com/amaniomar385/mindpulse/main/docs/mindpulse-cover.png)

MindPulse is a contactless, real-time stress assessment and interactive biofeedback breathing companion. By integrating the **Presage SmartSpectra SDK** with client-side optical remote Photoplethysmography (rPPG), MindPulse transforms standard laptop and desktop webcams into contactless physiological monitors. It measures real-time heart pulse (BPM), respiration rate (RPM), Heart Rate Variability (HRV - RMSSD/SDNN), and facial tension to calculate a live Stress Index (0–100) and guide the user through adaptive biofeedback breathing exercises that dynamically restore autonomic balance.

---

## ⚠️ Official Medical Disclaimer

> **MindPulse is a wellness & self-regulation tool. It is NOT intended for medical diagnosis, treatment, physiological anomaly detection, or clinical decision-making.**
>
> All biometric calculations (pulse rate, respiration, HRV, stress index) are optical approximations designed exclusively for mindfulness training, biofeedback, and everyday stress regulation. If experiencing cardiovascular, respiratory, or mental health emergencies, consult a licensed medical professional immediately.

---

## ✨ Key Features

1. **Camera Consent & Privacy Protocol**
   - **In-Memory Frame Processing:** All optical video analysis occurs locally in volatile RAM.
   - **Zero Video Retention:** No raw video frames, face images, or biometric identifiers are stored on disk or transmitted to external servers.
   - **No Facial Identification:** Analyzes micro-variations in capillary light reflection, not facial identity.
   - **User Data Sovereignty:** Session history is stored exclusively in `localStorage` with one-click wipe and export capabilities.

2. **Real-Time Signal Dashboard**
   - **Contactless Pulse Rate (BPM):** Live systolic and dicrotic pulse waveforms rendered on a 60 FPS HTML5 Canvas.
   - **Respiration Rate (RPM):** Thoracic micromotion and Respiratory Sinus Arrhythmia (RSA) waveform.
   - **Autonomic Stress Index (0–100):** Real-time gauge based on Baevsky's autonomic index (Relaxed, Balanced, Elevated, Acute Stress).
   - **HRV Telemetry:** Instantaneous RMSSD (ms) and SDNN (ms) quantifying vagal nerve tone.
   - **Facial Tension Indicators:** Corrugator brow furrow, masseter jaw clenching, and spontaneous blink cadence.

3. **Adaptive Biofeedback Breathing Guide**
   - **Dynamic Biofeedback Rhythm:** Automatically tunes inhalation, breath retention, and exhalation periods based on the user's live stress and pulse signals.
   - **Clinically Studied Techniques:**
     - *Resonant Coherence (5.5s In / 5.5s Out)* – Stimulates 0.1 Hz vagus nerve resonance.
     - *Box Breathing (4-4-4-4)* – Used by elite responders to suppress acute adrenaline spikes.
     - *4-7-8 Relaxing Breath* – Extended parasympathetic exhalation for anxiety relief.
     - *Quick Vagal Reset (3-2-5)* – Fast 60-second decompression.
   - **Acoustic Feedback:** Soothing harmonic tones (432 Hz / 528 Hz singing bowl frequencies) synthesized on-the-fly via Web Audio API.
   - **Heart Coherence Gauge:** Live feedback indicating when breathing synchronizes with HRV wave peaks.

4. **Session History & Analytics**
   - Tracks stress delta before vs. after breathwork (e.g., -34% stress reduction).
   - Mindful breathing minutes counter, calm streaks, and session breakdown.
   - One-click CSV and JSON data export.

5. **Integrated DEV Community Submission Drawer**
   - Complete, pre-formatted DEV Community markdown post template with 1-click clipboard copy directly inside the application.

---

## 📁 Project Folder Structure

```
mindpulse/
├── .env.example                       # Environment variables template
├── index.html                         # Entry HTML with typography and metadata
├── metadata.json                      # Applet configuration & camera permissions
├── package.json                       # Dependencies & build scripts
├── tsconfig.json                      # TypeScript strict compiler configuration
├── vite.config.ts                     # Vite + Tailwind v4 bundler configuration
├── src/
│   ├── main.tsx                       # React DOM entry point
│   ├── App.tsx                        # Root layout adhering to 3-zone header contract
│   ├── index.css                      # Tailwind v4 configuration & @custom-variant dark
│   ├── types.ts                       # TypeScript interfaces for vitals, sessions & config
│   ├── services/
│   │   ├── smartSpectraEngine.ts      # Core Presage SDK bridge & rPPG computer vision engine
│   │   └── audioBiofeedback.ts        # Web Audio API harmonic tone synthesizer
│   └── components/
│       ├── MedicalDisclaimerBanner.tsx# Visible, compliant non-medical disclaimer banner
│       ├── PrivacyModal.tsx           # Full camera consent & zero-storage privacy protocol
│       ├── ApiKeyModal.tsx            # Presage API key settings & engine mode selector
│       ├── SmartSpectraTracker.tsx    # Live camera viewport, face ROI mesh & signal diagnostics
│       ├── Dashboard.tsx              # Real-Time Signal Dashboard with animated waveforms
│       ├── BreathingGuide.tsx         # Animated breathing orb & biofeedback session engine
│       ├── SessionHistory.tsx         # Analytics, stress reduction logs & CSV export
│       └── DevPostDraftModal.tsx      # Contest submission markdown viewer & copy tool
└── README.md                          # Comprehensive setup instructions & architecture guide
```

---

## 🛠️ Tech Stack

- **Framework:** React 19 (Vite)
- **Language:** TypeScript 5.8 (Strict Mode)
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`, `@custom-variant dark`)
- **Icons:** Lucide React
- **Audio Synthesizer:** Web Audio API (Native Oscillator & BiquadFilter)
- **Celebration Feedback:** Canvas Confetti
- **Physiological Sensing:** Presage SmartSpectra SDK & client-side optical rPPG

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+ or 20+
- Modern web browser (Chrome, Edge, Firefox, Safari) with webcam support

### 1. Clone the repository
```bash
git clone https://github.com/amaniomar385/mindpulse.git
cd mindpulse
```

### 2. Install dependencies
```bash
npm install
```

### 3. (Optional) Configure Presage SmartSpectra API Key
MindPulse is built with a dual-engine architecture:
- **Zero-Setup Mode:** It operates natively on the webcam using the built-in optical rPPG computer vision algorithm—no external API key required!
- **Presage Cloud Mode:** If you have an official Presage SmartSpectra API key or partner token, create a `.env.local` file:

```bash
cp .env.example .env.local
```
Add your key:
```env
VITE_PRESAGE_API_KEY="your_presage_api_key_here"
```
*(Alternatively, enter your API key directly via the 🔑 key icon in the application navigation bar at any time).*

### 4. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 🧪 Testing Guidelines for Judges

1. **Camera Consent:** Upon opening the app, notice the persistent non-medical disclaimer banner. Click **"Privacy & Consent"** in the top navigation to review the zero-storage policy, local frame processing, and data rights.
2. **Face ROI Tracking:** Notice the green bounding box and forehead rPPG target area on the camera view. If your camera is disabled or in a sandbox, MindPulse seamlessly transitions to the **Simulated Telemetry Engine** so you can test all features without hardware.
3. **Stress Dial Simulator:** In the camera feed card, click **"Stress Test Dial"** to open a slider that allows you to drag stress from 10 (Relaxed) to 90 (Acute Stress) to observe real-time waveform, HRV, and respiratory adaptations.
4. **Adaptive Breathing:** Click **"Begin Adaptive Breathing"** from the dashboard. Observe the breathing circle rhythmically guiding your pace, with harmonic audio cues and real-time pulse synchronization.
5. **Session Celebration & History:** Complete a 1-minute or 2-minute session to trigger the celebratory confetti and view your stress reduction in the **"Analytics"** tab.
6. **DEV Post Template:** Click **"DEV Post Draft"** in the top right header to inspect or copy the full submission post formatted for DEV Community.

---

## 📄 License & Attribution

- Built by Omar Amani for the [Presage SmartSpectra SDK Challenge](https://dev.to/challenges/presage) on DEV Community.
- Licensed under the Apache-2.0 License.
