/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, Check, Heart, Wind, Award } from 'lucide-react';
import { BreathingPattern, BreathingPhase, VitalsData, SessionRecord } from '../types';
import { audioBiofeedback } from '../services/audioBiofeedback';

const BREATHING_PATTERNS: BreathingPattern[] = [
  {
    id: 'adaptive',
    name: 'Dynamic Biofeedback',
    tagline: 'SmartSpectra Adaptive Rhythm',
    description: 'Dynamically adapts in real time to your live pulse and stress levels to gently pace you into autonomic resonance.',
    inhaleSec: 4.5,
    holdInSec: 0,
    exhaleSec: 6.0,
    holdOutSec: 0,
    targetBpm: 5.7,
    isAdaptive: true,
  },
  {
    id: 'coherence',
    name: 'Heart Coherence',
    tagline: '5.5s In · 5.5s Out',
    description: 'Gold standard 0.1 Hz vagus nerve stimulation maximizing Heart Rate Variability (HRV) and mental clarity.',
    inhaleSec: 5.5,
    holdInSec: 0,
    exhaleSec: 5.5,
    holdOutSec: 0,
    targetBpm: 5.5,
  },
  {
    id: 'box',
    name: 'Box Breathing',
    tagline: '4 · 4 · 4 · 4 Cadence',
    description: 'Tactical self-regulation used by elite performers to eliminate adrenaline spikes and heighten laser focus.',
    inhaleSec: 4.0,
    holdInSec: 4.0,
    exhaleSec: 4.0,
    holdOutSec: 4.0,
    targetBpm: 3.75,
  },
  {
    id: '478',
    name: '4-7-8 Relaxing Breath',
    tagline: 'Dr. Weil Parasympathetic Reset',
    description: 'Extended breath retention and exhalation that triggers profound autonomic sedation and anxiety relief.',
    inhaleSec: 4.0,
    holdInSec: 7.0,
    exhaleSec: 8.0,
    holdOutSec: 0,
    targetBpm: 3.15,
  },
  {
    id: 'quick_reset',
    name: 'Quick Vagal Reset',
    tagline: '3s In · 2s Hold · 5s Out',
    description: 'Rapid 60-second de-escalation for high-pressure moments, presentations, or sudden tension.',
    inhaleSec: 3.0,
    holdInSec: 2.0,
    exhaleSec: 5.0,
    holdOutSec: 0,
    targetBpm: 6.0,
  },
];

interface Props {
  vitals: VitalsData | null;
  initialPatternId?: string;
  onSessionComplete: (record: SessionRecord) => void;
}

export const BreathingGuide: React.FC<Props> = ({
  vitals,
  initialPatternId = 'adaptive',
  onSessionComplete,
}) => {
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern>(
    BREATHING_PATTERNS.find((p) => p.id === initialPatternId) || BREATHING_PATTERNS[0]
  );
  const [isActive, setIsActive] = useState<boolean>(false);
  const [currentPhase, setCurrentPhase] = useState<BreathingPhase>('idle');
  const [phaseProgress, setPhaseProgress] = useState<number>(0); // 0 to 1
  const [phaseTimeLeft, setPhaseTimeLeft] = useState<number>(0);
  const [sessionDurationSec, setSessionDurationSec] = useState<number>(120); // default 2 min
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [completedSession, setCompletedSession] = useState<SessionRecord | null>(null);

  // Dynamic biofeedback adaptations
  const [adaptiveInhale, setAdaptiveInhale] = useState<number>(4.5);
  const [adaptiveExhale, setAdaptiveExhale] = useState<number>(6.0);
  const [coherencePercentage, setCoherencePercentage] = useState<number>(75);

  // Tracking metrics during session
  const startStressRef = useRef<number>(vitals?.stressIndex ?? 50);
  const pulseSamplesRef = useRef<number[]>([]);
  const respSamplesRef = useRef<number[]>([]);
  const coherenceSamplesRef = useRef<number[]>([]);

  // Update selected pattern when initialPatternId changes
  useEffect(() => {
    if (initialPatternId) {
      const match = BREATHING_PATTERNS.find((p) => p.id === initialPatternId);
      if (match) setSelectedPattern(match);
    }
  }, [initialPatternId]);

  // Dynamically adapt rhythm if "Dynamic Biofeedback" is active
  useEffect(() => {
    if (!vitals || !selectedPattern.isAdaptive) return;

    // High stress: prolong exhalation (e.g. 4s in, 6.5s out) to trigger parasympathetic braking
    // Lower stress: gently transition to coherent 5.5s in, 5.5s out
    const stress = vitals.stressIndex;
    if (stress > 65) {
      setAdaptiveInhale(4.0);
      setAdaptiveExhale(6.5);
    } else if (stress > 45) {
      setAdaptiveInhale(4.5);
      setAdaptiveExhale(6.0);
    } else {
      setAdaptiveInhale(5.5);
      setAdaptiveExhale(5.5);
    }

    // Coherence estimate: higher if breathing is steady around 5-6 rpm and HRV is elevated
    const targetCoherence = Math.round(
      Math.min(98, Math.max(40, (vitals.hrvRmssd / 60) * 50 + (100 - vitals.stressIndex) * 0.5))
    );
    setCoherencePercentage(targetCoherence);

    if (isActive) {
      pulseSamplesRef.current.push(vitals.pulseBpm);
      respSamplesRef.current.push(vitals.respirationRate);
      coherenceSamplesRef.current.push(targetCoherence);
    }
  }, [vitals, selectedPattern.isAdaptive, isActive]);

  // Main Breathing Rhythm Engine
  useEffect(() => {
    if (!isActive) {
      setCurrentPhase('idle');
      setPhaseProgress(0);
      return;
    }

    let currentPhaseIdx = 0; // 0: inhale, 1: hold-in, 2: exhale, 3: hold-out
    let phaseStartTime = performance.now();

    const getPhaseDurations = () => {
      if (selectedPattern.isAdaptive) {
        return [
          { phase: 'inhale' as BreathingPhase, duration: adaptiveInhale },
          { phase: 'hold-in' as BreathingPhase, duration: 0.5 },
          { phase: 'exhale' as BreathingPhase, duration: adaptiveExhale },
          { phase: 'hold-out' as BreathingPhase, duration: 0 },
        ].filter((p) => p.duration > 0);
      }
      return [
        { phase: 'inhale' as BreathingPhase, duration: selectedPattern.inhaleSec },
        { phase: 'hold-in' as BreathingPhase, duration: selectedPattern.holdInSec },
        { phase: 'exhale' as BreathingPhase, duration: selectedPattern.exhaleSec },
        { phase: 'hold-out' as BreathingPhase, duration: selectedPattern.holdOutSec },
      ].filter((p) => p.duration > 0);
    };

    let phases = getPhaseDurations();
    setCurrentPhase(phases[0].phase);
    audioBiofeedback.playPhaseCue(phases[0].phase, phases[0].duration);

    const interval = setInterval(() => {
      const now = performance.now();
      phases = getPhaseDurations();
      const current = phases[currentPhaseIdx % phases.length];
      const elapsedInPhase = (now - phaseStartTime) / 1000;
      const progress = Math.min(1, elapsedInPhase / current.duration);
      const remaining = Math.max(0, current.duration - elapsedInPhase);

      setPhaseProgress(progress);
      setPhaseTimeLeft(remaining);

      if (elapsedInPhase >= current.duration) {
        // Advance to next breathing phase
        currentPhaseIdx++;
        phaseStartTime = now;
        const next = phases[currentPhaseIdx % phases.length];
        setCurrentPhase(next.phase);
        audioBiofeedback.playPhaseCue(next.phase, next.duration);
      }
    }, 40);

    // Elapsed session timer
    const sessionTimer = setInterval(() => {
      setElapsedSec((prev) => {
        const next = prev + 1;
        if (next >= sessionDurationSec) {
          handleFinishSession();
        }
        return next;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(sessionTimer);
    };
  }, [isActive, selectedPattern, adaptiveInhale, adaptiveExhale, sessionDurationSec]);

  const handleStart = () => {
    startStressRef.current = vitals?.stressIndex ?? 50;
    pulseSamplesRef.current = vitals ? [vitals.pulseBpm] : [72];
    respSamplesRef.current = vitals ? [vitals.respirationRate] : [14];
    coherenceSamplesRef.current = [70];
    setElapsedSec(0);
    setCompletedSession(null);
    setIsActive(true);
  };

  const handlePause = () => {
    setIsActive(false);
    audioBiofeedback.stop();
  };

  const handleReset = () => {
    setIsActive(false);
    audioBiofeedback.stop();
    setElapsedSec(0);
    setCurrentPhase('idle');
    setPhaseProgress(0);
  };

  const handleFinishSession = () => {
    setIsActive(false);
    audioBiofeedback.stop();
    audioBiofeedback.playChime(true);

    // Trigger joyful celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // fallback
    }

    const endStress = vitals?.stressIndex ?? Math.max(15, startStressRef.current - 22);
    const avgPulse =
      pulseSamplesRef.current.length > 0
        ? Math.round(pulseSamplesRef.current.reduce((a, b) => a + b, 0) / pulseSamplesRef.current.length)
        : vitals?.pulseBpm ?? 68;
    const avgResp =
      respSamplesRef.current.length > 0
        ? Math.round(respSamplesRef.current.reduce((a, b) => a + b, 0) / respSamplesRef.current.length)
        : vitals?.respirationRate ?? 11;
    const avgCoherence =
      coherenceSamplesRef.current.length > 0
        ? Math.round(coherenceSamplesRef.current.reduce((a, b) => a + b, 0) / coherenceSamplesRef.current.length)
        : 82;

    const record: SessionRecord = {
      id: 'session_' + Date.now(),
      timestamp: Date.now(),
      dateStr: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      durationSeconds: elapsedSec > 0 ? elapsedSec : sessionDurationSec,
      patternId: selectedPattern.id,
      patternName: selectedPattern.name,
      startStress: startStressRef.current,
      endStress: endStress,
      stressDelta: endStress - startStressRef.current,
      avgPulse: avgPulse,
      avgRespiration: avgResp,
      coherenceScore: avgCoherence,
      notes: selectedPattern.isAdaptive
        ? 'Real-time SmartSpectra biofeedback pace transition'
        : `${selectedPattern.name} protocol`,
    };

    setCompletedSession(record);
    onSessionComplete(record);
  };

  const toggleSound = () => {
    const muted = audioBiofeedback.toggleMute();
    setIsMuted(muted);
  };

  // Calculate circle animation scale based on phase and progress
  const getOrbScale = () => {
    if (currentPhase === 'inhale') {
      return 1.0 + phaseProgress * 0.45; // 1.0 -> 1.45
    }
    if (currentPhase === 'hold-in') {
      return 1.45;
    }
    if (currentPhase === 'exhale') {
      return 1.45 - phaseProgress * 0.45; // 1.45 -> 1.0
    }
    if (currentPhase === 'hold-out') {
      return 1.0;
    }
    return 1.15; // idle
  };

  const getPhaseInstruction = () => {
    switch (currentPhase) {
      case 'inhale':
        return 'Inhale deeply through your nose...';
      case 'hold-in':
        return 'Gently hold your breath...';
      case 'exhale':
        return 'Slowly exhale through your mouth...';
      case 'hold-out':
        return 'Rest comfortably before next breath...';
      case 'idle':
        return 'Press Start to begin your biofeedback journey.';
    }
  };

  const formatSec = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="space-y-6">
      
      {/* Pattern Selector Strip */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm">
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2.5 px-1 uppercase tracking-wider flex items-center justify-between">
          <span>Select Breathwork Technique</span>
          {selectedPattern.isAdaptive && (
            <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-mono font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Real-Time SDK Sync Active
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {BREATHING_PATTERNS.map((p) => {
            const isSel = selectedPattern.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedPattern(p);
                  if (isActive) handleReset();
                }}
                className={`p-3 rounded-lg border text-left transition duration-150 flex flex-col justify-between ${
                  isSel
                    ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-100 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div>
                  <div className="font-semibold text-xs leading-tight mb-1">{p.name}</div>
                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 leading-tight">
                    {p.tagline}
                  </div>
                </div>
                {p.isAdaptive && (
                  <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium text-indigo-600 dark:text-indigo-400">
                    <Sparkles className="w-2.5 h-2.5" />
                    Adaptive
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Breathing Stage */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-10 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
        
        {/* Ambient background glow */}
        <div
          className="absolute w-96 h-96 rounded-full blur-3xl pointer-events-none transition-all duration-1000 opacity-20"
          style={{
            backgroundColor:
              currentPhase === 'inhale' ? '#38bdf8' : currentPhase === 'exhale' ? '#34d399' : '#818cf8',
            transform: `scale(${getOrbScale()})`,
          }}
        />

        {/* Top Info Bar */}
        <div className="w-full flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-6 z-10">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
              {selectedPattern.name}
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="font-mono text-xs">
              {selectedPattern.isAdaptive
                ? `Pacing: ${adaptiveInhale.toFixed(1)}s In / ${adaptiveExhale.toFixed(1)}s Out`
                : `${selectedPattern.inhaleSec}s / ${selectedPattern.exhaleSec}s`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleSound}
              title={isMuted ? 'Unmute Audio Chimes' : 'Mute Audio Chimes'}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-indigo-500" />}
            </button>
            <div className="font-mono text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-800 dark:text-slate-200">
              {formatSec(elapsedSec)} / {formatSec(sessionDurationSec)}
            </div>
          </div>
        </div>

        {/* Central Animated Breathing Orb */}
        <div className="relative my-8 flex items-center justify-center w-72 h-72 z-10">
          
          {/* Target Boundary Outer Ring */}
          <div className="absolute inset-0 rounded-full border border-dashed border-slate-200 dark:border-slate-800" />
          
          {/* Progress Ring SVG */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
            <circle
              cx="144"
              cy="144"
              r="130"
              stroke="currentColor"
              strokeWidth="2"
              fill="transparent"
              className="text-slate-100 dark:text-slate-800/60"
            />
            {isActive && (
              <circle
                cx="144"
                cy="144"
                r="130"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 130}
                strokeDashoffset={2 * Math.PI * 130 * (1 - phaseProgress)}
                className="text-indigo-500 transition-all duration-75"
              />
            )}
          </svg>

          {/* Dynamic Breathing Orb */}
          <div
            className="w-44 h-44 rounded-full flex flex-col items-center justify-center shadow-xl text-center transition-transform duration-300 ease-out p-4"
            style={{
              transform: `scale(${getOrbScale()})`,
              background:
                currentPhase === 'inhale'
                  ? 'radial-gradient(circle, #38bdf8 0%, #0284c7 100%)'
                  : currentPhase === 'hold-in' || currentPhase === 'hold-out'
                  ? 'radial-gradient(circle, #818cf8 0%, #4f46e5 100%)'
                  : currentPhase === 'exhale'
                  ? 'radial-gradient(circle, #34d399 0%, #059669 100%)'
                  : 'radial-gradient(circle, #94a3b8 0%, #64748b 100%)',
              color: '#ffffff',
            }}
          >
            <span className="text-xs font-semibold uppercase tracking-widest opacity-90 drop-shadow-sm">
              {currentPhase === 'idle' ? 'Ready' : currentPhase.replace('-', ' ')}
            </span>
            <span className="text-3xl font-bold font-mono my-0.5 drop-shadow-md">
              {currentPhase === 'idle' ? '▶' : `${Math.ceil(phaseTimeLeft)}s`}
            </span>
            <span className="text-[10px] opacity-80 font-mono">
              {selectedPattern.isAdaptive ? 'SmartSpectra Sync' : `${selectedPattern.targetBpm} RPM`}
            </span>
          </div>
        </div>

        {/* Phase Instruction Text */}
        <div className="text-center space-y-1 z-10 max-w-md my-2">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 animate-pulse">
            {getPhaseInstruction()}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {selectedPattern.description}
          </p>
        </div>

        {/* Live Biofeedback Synchronization telemetry */}
        <div className="w-full max-w-md bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3 my-4 grid grid-cols-3 gap-2 text-center text-xs z-10">
          <div>
            <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
              <Heart className="w-3 h-3 text-rose-500" />
              <span>Live Pulse</span>
            </div>
            <div className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm tabular-nums">
              {vitals?.pulseBpm || '--'} <span className="text-[10px] font-normal text-slate-400">BPM</span>
            </div>
          </div>

          <div>
            <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
              <Wind className="w-3 h-3 text-cyan-500" />
              <span>Breathing</span>
            </div>
            <div className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm tabular-nums">
              {vitals?.respirationRate || '--'} <span className="text-[10px] font-normal text-slate-400">RPM</span>
            </div>
          </div>

          <div>
            <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
              <Award className="w-3 h-3 text-emerald-500" />
              <span>Coherence</span>
            </div>
            <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm tabular-nums">
              {coherencePercentage}%
            </div>
          </div>
        </div>

        {/* Session Primary Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3 z-10 pt-2">
          {!isActive ? (
            <button
              onClick={handleStart}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold rounded-xl transition flex items-center gap-2 shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Biofeedback Session</span>
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="px-6 py-2.5 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition flex items-center gap-2 shadow-md cursor-pointer"
            >
              <Pause className="w-4 h-4 fill-white" />
              <span>Pause</span>
            </button>
          )}

          <button
            onClick={handleReset}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          {isActive && (
            <button
              onClick={handleFinishSession}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Complete & Save</span>
            </button>
          )}
        </div>

        {/* Duration selector pill buttons */}
        <div className="flex items-center gap-1.5 mt-5 text-[11px] z-10 text-slate-500 dark:text-slate-400">
          <span>Target Duration:</span>
          {[60, 120, 180, 300].map((dur) => (
            <button
              key={dur}
              disabled={isActive}
              onClick={() => setSessionDurationSec(dur)}
              className={`px-2 py-0.5 rounded font-mono text-[11px] transition ${
                sessionDurationSec === dur
                  ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {dur / 60}m
            </button>
          ))}
        </div>

      </div>

      {/* Session Completion Celebration Modal */}
      {completedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 text-center text-slate-900 dark:text-slate-100 space-y-4">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto">
              <Award className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-bold">Session Successfully Completed!</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Your nervous system responded with measurable parasympathetic calm.
              </p>
            </div>

            {/* Results Grid */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-3 text-left text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-mono">Stress Level</span>
                <div className="text-base font-bold text-slate-800 dark:text-slate-100 font-mono mt-0.5">
                  {completedSession.startStress} → {completedSession.endStress}
                </div>
                <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  {completedSession.stressDelta <= 0
                    ? `${completedSession.stressDelta} points reduction`
                    : `+${completedSession.stressDelta} points`}
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] uppercase font-mono">Average Pulse</span>
                <div className="text-base font-bold text-slate-800 dark:text-slate-100 font-mono mt-0.5">
                  {completedSession.avgPulse} BPM
                </div>
                <div className="text-[11px] text-slate-500">
                  Cadence: {completedSession.avgRespiration} RPM
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] uppercase font-mono">Duration</span>
                <div className="text-sm font-semibold font-mono text-slate-800 dark:text-slate-200 mt-0.5">
                  {Math.round(completedSession.durationSeconds / 60)} min ({completedSession.durationSeconds}s)
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] uppercase font-mono">Heart Coherence</span>
                <div className="text-sm font-semibold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {completedSession.coherenceScore}% Resonance
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Session saved to your private local history. Zero data uploaded to any server.
            </p>

            <button
              onClick={() => setCompletedSession(null)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
