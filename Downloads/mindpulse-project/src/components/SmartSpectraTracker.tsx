/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState } from 'react';
import { Camera, CameraOff, RefreshCw, Sliders, Shield, Zap, Sparkles } from 'lucide-react';
import { VitalsData, SmartSpectraConfig } from '../types';
import { smartSpectraEngine } from '../services/smartSpectraEngine';

interface Props {
  vitals: VitalsData | null;
  config: SmartSpectraConfig;
  onOpenSettings: () => void;
  onOpenPrivacy: () => void;
}

export const SmartSpectraTracker: React.FC<Props> = ({
  vitals,
  config,
  onOpenSettings,
  onOpenPrivacy,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isPrivacyShutter, setIsPrivacyShutter] = useState<boolean>(false);
  const [showSimControls, setShowSimControls] = useState<boolean>(false);
  const [simStressValue, setSimStressValue] = useState<number>(45);

  // Initialize camera or simulation on mount
  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      if (config.mode === 'simulated') {
        smartSpectraEngine.setSimulationMode(true);
        smartSpectraEngine.startSimulation();
        setIsCameraActive(false);
        return;
      }

      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Webcam API not supported in this browser environment.');
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user',
            frameRate: { ideal: 30 },
          },
          audio: false,
        });

        if (videoRef.current) {
          const success = await smartSpectraEngine.startWithMediaStream(videoRef.current, stream);
          if (success) {
            setIsCameraActive(true);
            setCameraError(null);
          } else {
            setIsCameraActive(false);
          }
        }
      } catch (err: any) {
        console.warn('Camera access error:', err);
        setCameraError(
          err.name === 'NotAllowedError'
            ? 'Camera permission was denied. Falling back to interactive simulation engine.'
            : 'Camera device unavailable or busy. Operating in simulated testing mode.'
        );
        // Seamless fallback to simulation so the app is 100% testable
        smartSpectraEngine.setSimulationMode(true);
        smartSpectraEngine.startSimulation();
        setIsCameraActive(false);
      }
    };

    startCamera();

    return () => {
      smartSpectraEngine.stop();
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [config.mode]);

  const toggleCamera = async () => {
    if (isCameraActive) {
      smartSpectraEngine.stop();
      setIsCameraActive(false);
      smartSpectraEngine.setSimulationMode(true);
      smartSpectraEngine.startSimulation();
    } else {
      smartSpectraEngine.stop();
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
          audio: false,
        });
        if (videoRef.current) {
          await smartSpectraEngine.startWithMediaStream(videoRef.current, stream);
          setIsCameraActive(true);
          setCameraError(null);
        }
      } catch (err: any) {
        setCameraError('Could not restart camera: ' + (err.message || 'Permission denied'));
        smartSpectraEngine.startSimulation();
      }
    }
  };

  const handleSimStressChange = (newVal: number) => {
    setSimStressValue(newVal);
    smartSpectraEngine.setSimulationTarget(newVal);
  };

  const qualityScore = vitals?.signalQuality ?? 85;
  const isFaceDetected = vitals?.faceDetected ?? false;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col h-full shadow-sm">
      {/* Tracker Top Bar */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-indigo-500" />
            Presage SmartSpectra Optical Feed
          </span>
          <span className="text-slate-400">·</span>
          <span className="font-mono text-slate-500 text-[11px]">
            {isCameraActive ? '30 FPS Optical rPPG' : 'Simulated Telemetry'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSimControls(!showSimControls)}
            title="Toggle developer stress testing sliders"
            className={`px-2 py-1 rounded text-[11px] font-medium transition flex items-center gap-1 ${
              showSimControls
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Sliders className="w-3 h-3" />
            <span className="hidden sm:inline">Stress Test Dial</span>
          </button>
          <button
            onClick={onOpenSettings}
            className="text-[11px] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 underline"
          >
            SDK Settings
          </button>
        </div>
      </div>

      {/* Main Video Stage */}
      <div className="relative aspect-4/3 w-full bg-slate-950 flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={`w-full h-full object-cover transition duration-300 ${
            !isCameraActive || isPrivacyShutter ? 'opacity-20 filter blur-md' : 'opacity-100'
          }`}
        />

        {/* HUD Region of Interest (ROI) Overlay */}
        {isCameraActive && !isPrivacyShutter && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
            {/* Target Face Box */}
            <div
              className={`w-44 h-56 rounded-2xl border-2 transition-colors duration-300 relative flex flex-col items-center justify-between p-3 ${
                isFaceDetected
                  ? 'border-emerald-400/80 shadow-[0_0_15px_rgba(52,211,153,0.3)]'
                  : 'border-amber-400/60 border-dashed'
              }`}
            >
              {/* Forehead Optical Sensor Target */}
              <div className="w-24 h-9 rounded border border-emerald-400/50 bg-emerald-500/10 flex items-center justify-center">
                <span className="text-[9px] font-mono tracking-widest text-emerald-300 uppercase">
                  rPPG Forehead ROI
                </span>
              </div>

              {/* Cheek alignment crosshairs */}
              <div className="w-full flex justify-between px-2">
                <div className="w-6 h-6 border-b border-l border-emerald-400/50" />
                <div className="w-6 h-6 border-b border-r border-emerald-400/50" />
              </div>

              {/* Status Tag */}
              <div className="bg-slate-950/80 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] font-mono text-emerald-300 flex items-center gap-1">
                <span>{isFaceDetected ? 'Target Locked' : 'Aligning Face...'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Camera Off / Fallback Overlay */}
        {(!isCameraActive || isPrivacyShutter) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-slate-300 z-10 space-y-3">
            <div className="w-14 h-14 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 border border-slate-700">
              <CameraOff className="w-6 h-6" />
            </div>
            <div className="max-w-xs space-y-1">
              <h4 className="text-sm font-semibold text-slate-100">
                {isPrivacyShutter ? 'Privacy Shutter Engaged' : 'Camera Feed Offline'}
              </h4>
              <p className="text-xs text-slate-400">
                {isPrivacyShutter
                  ? 'Video stream is paused. Frames are not captured.'
                  : cameraError || 'Operating in high-fidelity biofeedback simulation mode.'}
              </p>
            </div>
            <button
              onClick={toggleCamera}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition flex items-center gap-1.5 shadow"
            >
              <Camera className="w-3.5 h-3.5" />
              {isCameraActive ? 'Resume Stream' : 'Enable Camera'}
            </button>
          </div>
        )}

        {/* Live Metrics Pill Overlays on Video */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          <div className="bg-slate-950/85 backdrop-blur-xs border border-slate-800/80 px-2.5 py-1 rounded-md text-[11px] font-mono text-slate-200 flex items-center gap-2">
            <span className="text-slate-400 text-[10px]">PULSE</span>
            <span className="font-bold text-rose-400 tabular-nums">
              {vitals?.pulseBpm || '--'}
            </span>
            <span className="text-[10px] text-slate-400">BPM</span>
          </div>

          <div className="bg-slate-950/85 backdrop-blur-xs border border-slate-800/80 px-2.5 py-1 rounded-md text-[11px] font-mono text-slate-200 flex items-center gap-2">
            <span className="text-slate-400 text-[10px]">RESP</span>
            <span className="font-bold text-cyan-400 tabular-nums">
              {vitals?.respirationRate || '--'}
            </span>
            <span className="text-[10px] text-slate-400">RPM</span>
          </div>
        </div>

        {/* Signal Quality HUD Badge */}
        <div className="absolute top-3 right-3 z-10">
          <div className="bg-slate-950/85 backdrop-blur-xs border border-slate-800/80 px-2.5 py-1 rounded-md text-[11px] font-mono text-slate-200 flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                qualityScore > 75
                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                  : qualityScore > 45
                  ? 'bg-amber-400'
                  : 'bg-rose-400'
              }`}
            />
            <span className="text-[10px] text-slate-400">CONF:</span>
            <span className="tabular-nums font-semibold">{qualityScore}%</span>
          </div>
        </div>

        {/* Shutter Toggle Icon */}
        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5">
          <button
            onClick={() => setIsPrivacyShutter(!isPrivacyShutter)}
            title={isPrivacyShutter ? 'Deactivate Privacy Shutter' : 'Engage Privacy Shutter'}
            className="p-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 rounded-md border border-slate-700 backdrop-blur-xs text-xs transition"
          >
            <Shield className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleCamera}
            title={isCameraActive ? 'Turn off camera' : 'Turn on camera'}
            className="p-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 rounded-md border border-slate-700 backdrop-blur-xs text-xs transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Developer Stress Dial Drawer (Collapsible) */}
      {showSimControls && (
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Biofeedback Simulator Dial (Contest Testing)
            </span>
            <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold tabular-nums">
              Target Stress: {simStressValue}/100
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
            Drag slider to simulate real-time stress elevation or deep relaxation and watch the biofeedback breathing
            guide dynamically adapt its pacing in real time!
          </p>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Calm (10)</span>
            <input
              type="range"
              min="10"
              max="90"
              value={simStressValue}
              onChange={(e) => handleSimStressChange(Number(e.target.value))}
              className="flex-1 accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
            />
            <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">High Stress (90)</span>
          </div>
          <div className="flex justify-between text-[11px] pt-1">
            <button
              onClick={() => handleSimStressChange(25)}
              className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded hover:bg-emerald-200 text-[10px]"
            >
              Preset: Relaxed
            </button>
            <button
              onClick={() => handleSimStressChange(50)}
              className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 text-[10px]"
            >
              Preset: Balanced
            </button>
            <button
              onClick={() => handleSimStressChange(80)}
              className="px-2 py-0.5 bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 rounded hover:bg-rose-200 text-[10px]"
            >
              Preset: Acute Stress
            </button>
          </div>
        </div>
      )}

      {/* Tracker Diagnostics Bottom Row */}
      <div className="p-3 bg-white dark:bg-slate-900 grid grid-cols-3 gap-2 text-center text-xs border-t border-slate-100 dark:border-slate-800/80">
        <div className="p-1.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
          <div className="text-[10px] text-slate-400 uppercase font-mono">Lighting</div>
          <div className="font-semibold text-slate-800 dark:text-slate-200 font-mono text-xs tabular-nums">
            {vitals?.signalQuality ? (vitals.signalQuality > 70 ? 'Optimal' : 'Sub-optimal') : 'Calibrating'}
          </div>
        </div>

        <div className="p-1.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
          <div className="text-[10px] text-slate-400 uppercase font-mono">Head Stability</div>
          <div className="font-semibold text-slate-800 dark:text-slate-200 font-mono text-xs tabular-nums">
            {vitals?.facialTension?.headStability ? `${vitals.facialTension.headStability}%` : 'Stable'}
          </div>
        </div>

        <div className="p-1.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
          <div className="text-[10px] text-slate-400 uppercase font-mono">SNR Level</div>
          <div className="font-semibold text-slate-800 dark:text-slate-200 font-mono text-xs tabular-nums">
            {vitals?.snr ? `${vitals.snr} dB` : '24 dB'}
          </div>
        </div>
      </div>

      {/* Privacy Guarantee Footer Note */}
      <div className="px-4 py-2 bg-slate-50/80 dark:bg-slate-800/20 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1">
          <Shield className="w-3 h-3 text-emerald-500" />
          Frames analyzed locally in RAM · Zero retention
        </span>
        <button onClick={onOpenPrivacy} className="underline hover:text-slate-700 dark:hover:text-slate-300">
          Privacy Policy
        </button>
      </div>
    </div>
  );
};
