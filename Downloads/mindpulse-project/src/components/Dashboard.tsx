/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect } from 'react';
import { Activity, Wind, Heart, Brain, Gauge, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { VitalsData, StressLevelCategory } from '../types';

interface Props {
  vitals: VitalsData | null;
  onNavigateToBreathing: (recommendedPatternId?: string) => void;
}

export const Dashboard: React.FC<Props> = ({ vitals, onNavigateToBreathing }) => {
  const ppgCanvasRef = useRef<HTMLCanvasElement>(null);
  const respCanvasRef = useRef<HTMLCanvasElement>(null);
  const ppgHistoryRef = useRef<number[]>([]);
  const respHistoryRef = useRef<number[]>([]);

  // Update waveform buffers on new vitals sample
  useEffect(() => {
    if (!vitals) return;

    // Optical PPG waveform buffer
    ppgHistoryRef.current.push(vitals.rawPpgSample);
    if (ppgHistoryRef.current.length > 120) {
      ppgHistoryRef.current.shift();
    }

    // Respiration waveform buffer
    respHistoryRef.current.push(vitals.rawRespSample);
    if (respHistoryRef.current.length > 80) {
      respHistoryRef.current.shift();
    }
  }, [vitals]);

  // Render Live PPG Waveform Canvas
  useEffect(() => {
    let animId: number;

    const renderWaves = () => {
      // Draw PPG
      const ppgCanvas = ppgCanvasRef.current;
      if (ppgCanvas) {
        const ctx = ppgCanvas.getContext('2d');
        if (ctx) {
          const w = ppgCanvas.width;
          const h = ppgCanvas.height;
          ctx.clearRect(0, 0, w, h);

          // Subtle grid lines
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, h * 0.5);
          ctx.lineTo(w, h * 0.5);
          ctx.stroke();

          const data = ppgHistoryRef.current;
          if (data.length > 1) {
            ctx.beginPath();
            ctx.strokeStyle = '#f43f5e'; // Rose-500
            ctx.lineWidth = 2;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';

            const step = w / 120;
            for (let i = 0; i < data.length; i++) {
              const x = i * step;
              const y = h * 0.85 - data[i] * (h * 0.7);
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.stroke();

            // Glow point at head of wave
            const lastX = (data.length - 1) * step;
            const lastY = h * 0.85 - data[data.length - 1] * (h * 0.7);
            ctx.beginPath();
            ctx.arc(lastX, lastY, 3.5, 0, Math.PI * 2);
            ctx.fillStyle = '#f43f5e';
            ctx.shadowColor = '#f43f5e';
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      }

      // Draw Respiration Wave
      const respCanvas = respCanvasRef.current;
      if (respCanvas) {
        const ctx = respCanvas.getContext('2d');
        if (ctx) {
          const w = respCanvas.width;
          const h = respCanvas.height;
          ctx.clearRect(0, 0, w, h);

          const data = respHistoryRef.current;
          if (data.length > 1) {
            ctx.beginPath();
            ctx.strokeStyle = '#06b6d4'; // Cyan-500
            ctx.lineWidth = 2;
            ctx.lineJoin = 'round';

            const step = w / 80;
            for (let i = 0; i < data.length; i++) {
              const x = i * step;
              const y = h * 0.85 - data[i] * (h * 0.7);
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.stroke();

            // Cyan head
            const lastX = (data.length - 1) * step;
            const lastY = h * 0.85 - data[data.length - 1] * (h * 0.7);
            ctx.beginPath();
            ctx.arc(lastX, lastY, 3.5, 0, Math.PI * 2);
            ctx.fillStyle = '#06b6d4';
            ctx.shadowColor = '#06b6d4';
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      }

      animId = requestAnimationFrame(renderWaves);
    };

    animId = requestAnimationFrame(renderWaves);
    return () => cancelAnimationFrame(animId);
  }, []);

  const pulse = vitals?.pulseBpm ?? 72;
  const resp = vitals?.respirationRate ?? 14;
  const stress = vitals?.stressIndex ?? 38;
  const rmssd = vitals?.hrvRmssd ?? 42;
  const sdnn = vitals?.hrvSdnn ?? 48;
  const category: StressLevelCategory = vitals?.stressCategory ?? 'balanced';

  // Stress category visual config
  const getCategoryTheme = (cat: StressLevelCategory) => {
    switch (cat) {
      case 'relaxed':
        return {
          label: 'Relaxed & Calm',
          bg: 'bg-emerald-50 dark:bg-emerald-950/40',
          text: 'text-emerald-700 dark:text-emerald-300',
          border: 'border-emerald-200 dark:border-emerald-800',
          bar: 'bg-emerald-500',
          rec: 'coherence',
          recName: 'Heart Coherence (5.5s)',
        };
      case 'balanced':
        return {
          label: 'Nominal & Balanced',
          bg: 'bg-blue-50 dark:bg-blue-950/40',
          text: 'text-blue-700 dark:text-blue-300',
          border: 'border-blue-200 dark:border-blue-800',
          bar: 'bg-blue-500',
          rec: 'box',
          recName: 'Box Breathing (4-4-4-4)',
        };
      case 'elevated':
        return {
          label: 'Elevated Tension',
          bg: 'bg-amber-50 dark:bg-amber-950/40',
          text: 'text-amber-700 dark:text-amber-300',
          border: 'border-amber-200 dark:border-amber-800',
          bar: 'bg-amber-500',
          rec: 'quick_reset',
          recName: 'Quick Vagal Reset (3-2-5)',
        };
      case 'high_stress':
        return {
          label: 'Acute Stress Detected',
          bg: 'bg-rose-50 dark:bg-rose-950/40',
          text: 'text-rose-700 dark:text-rose-300',
          border: 'border-rose-200 dark:border-rose-800',
          bar: 'bg-rose-500',
          rec: '478',
          recName: '4-7-8 Parasympathetic Reset',
        };
    }
  };

  const theme = getCategoryTheme(category);

  return (
    <div className="space-y-6">
      
      {/* Real-time Physiological Vitals Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Pulse Rate Card with Live Optical PPG Wave */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-500" />
              Pulse Rate (BPM)
            </span>
            <span className="font-mono text-[10px]">rPPG Pulse</span>
          </div>

          <div className="flex items-baseline gap-2 my-1">
            <span className="text-3xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
              {pulse}
            </span>
            <span className="text-xs font-mono uppercase text-slate-400">BPM</span>
          </div>

          {/* Mini Waveform Canvas */}
          <div className="h-14 w-full bg-slate-50 dark:bg-slate-950/70 rounded-lg p-1 border border-slate-100 dark:border-slate-800/80 overflow-hidden relative mt-2">
            <canvas ref={ppgCanvasRef} width={220} height={48} className="w-full h-full" />
            <span className="absolute bottom-1 right-2 text-[9px] font-mono text-slate-400">
              Photoplethysmogram
            </span>
          </div>
        </div>

        {/* Breathing Rate Card with Live Respiration Wave */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Wind className="w-4 h-4 text-cyan-500" />
              Respiration (RPM)
            </span>
            <span className="font-mono text-[10px]">Optical Rhythm</span>
          </div>

          <div className="flex items-baseline gap-2 my-1">
            <span className="text-3xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
              {resp}
            </span>
            <span className="text-xs font-mono uppercase text-slate-400">breaths/min</span>
          </div>

          {/* Mini Waveform Canvas */}
          <div className="h-14 w-full bg-slate-50 dark:bg-slate-950/70 rounded-lg p-1 border border-slate-100 dark:border-slate-800/80 overflow-hidden relative mt-2">
            <canvas ref={respCanvasRef} width={220} height={48} className="w-full h-full" />
            <span className="absolute bottom-1 right-2 text-[9px] font-mono text-slate-400">
              Thoracic Micromotion
            </span>
          </div>
        </div>

        {/* Real-Time Stress Index Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-purple-500" />
              Stress Index (0-100)
            </span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${theme.bg} ${theme.text}`}>
              {theme.label.split(' ')[0]}
            </span>
          </div>

          <div className="flex items-baseline gap-2 my-1">
            <span className="text-3xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
              {stress}
            </span>
            <span className="text-xs font-mono uppercase text-slate-400">/ 100</span>
          </div>

          {/* Progress bar meter */}
          <div className="mt-2 space-y-1.5">
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${theme.bar}`}
                style={{ width: `${Math.min(100, Math.max(5, stress))}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>Calm (0)</span>
              <span>Nominal (50)</span>
              <span>High (100)</span>
            </div>
          </div>
        </div>

        {/* Heart Rate Variability (HRV) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-indigo-500" />
              Autonomic HRV
            </span>
            <span className="font-mono text-[10px]">Vagal Tone</span>
          </div>

          <div className="flex items-baseline gap-2 my-1">
            <span className="text-3xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
              {rmssd}
            </span>
            <span className="text-xs font-mono uppercase text-slate-400">ms (RMSSD)</span>
          </div>

          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex justify-between">
              <span>SDNN Spread:</span>
              <span className="font-mono font-medium text-slate-700 dark:text-slate-300 tabular-nums">
                {sdnn} ms
              </span>
            </div>
            <div className="flex justify-between">
              <span>Nervous State:</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {rmssd > 50 ? 'Parasympathetic' : 'Sympathetic Drive'}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Adaptive Recommendation & Facial Expression Intelligence Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Dynamic Biofeedback Prescription Banner */}
        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white rounded-xl p-5 border border-indigo-800/40 shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
              <Brain className="w-4 h-4" />
              Presage SmartSpectra Biofeedback Prescription
            </div>
            <h3 className="text-lg font-bold tracking-tight text-white">
              {stress > 65
                ? 'Elevated Sympathetic Arousal Detected'
                : stress > 40
                ? 'Moderate Daily Cognitive Load'
                : 'Optimal Vagal Coherence State'}
            </h3>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Based on your real-time heart rate ({pulse} BPM), respiration frequency ({resp} RPM), and RMSSD HRV ({rmssd} ms),
              we recommend a <strong>{theme.recName}</strong> biofeedback session to guide your nervous system into rhythmic resonance.
            </p>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10 relative z-10">
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Target: 5.5 breaths/min</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Estimated -35% Stress Delta</span>
              </div>
            </div>

            <button
              onClick={() => onNavigateToBreathing(theme.rec)}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition flex items-center gap-2 shadow-lg shadow-indigo-500/25 cursor-pointer"
            >
              <span>Begin Adaptive Breathing</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Facial Expression & Tension Analysis */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-3">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-purple-500" />
              Facial Tension Indicators
            </span>
            <span className="font-mono text-[10px]">Micro-Expressions</span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Brow Furrow */}
            <div className="space-y-1">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Brow Corrugator Tension:</span>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-200 tabular-nums">
                  {vitals?.facialTension?.browFurrow ?? 24}%
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-purple-500 h-full transition-all duration-300"
                  style={{ width: `${vitals?.facialTension?.browFurrow ?? 24}%` }}
                />
              </div>
            </div>

            {/* Jaw Tension */}
            <div className="space-y-1">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Masseter Jaw Clench:</span>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-200 tabular-nums">
                  {vitals?.facialTension?.jawTension ?? 18}%
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 h-full transition-all duration-300"
                  style={{ width: `${vitals?.facialTension?.jawTension ?? 18}%` }}
                />
              </div>
            </div>

            {/* Blink Cadence */}
            <div className="space-y-1">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Spontaneous Blink Cadence:</span>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-200 tabular-nums">
                  {vitals?.facialTension?.blinkRatePerMin ?? 16} / min
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-500 h-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (vitals?.facialTension?.blinkRatePerMin ?? 16) * 3)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <AlertCircle className="w-3 h-3 text-slate-400 shrink-0" />
            <span>Smooth, relaxed facial muscles directly foster autonomic calm.</span>
          </div>
        </div>

      </div>

    </div>
  );
};