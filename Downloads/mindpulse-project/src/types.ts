/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type StressLevelCategory = 'relaxed' | 'balanced' | 'elevated' | 'high_stress';

export interface VitalsData {
  /** Pulse rate in beats per minute */
  pulseBpm: number;
  /** Respiratory rate in breaths per minute */
  respirationRate: number;
  /** Heart rate variability: Root Mean Square of Successive Differences (ms) */
  hrvRmssd: number;
  /** Standard deviation of NN intervals (ms) */
  hrvSdnn: number;
  /** Composite stress index (0 to 100) */
  stressIndex: number;
  /** Qualitative stress classification */
  stressCategory: StressLevelCategory;
  /** Signal quality score (0 to 100%) */
  signalQuality: number;
  /** Whether a face is currently detected in ROI */
  faceDetected: boolean;
  /** Whether motion artifact is detected */
  motionArtifact: boolean;
  /** Signal-to-noise ratio in dB */
  snr: number;
  /** Facial tension metrics */
  facialTension: {
    browFurrow: number; // 0 - 100
    jawTension: number; // 0 - 100
    blinkRatePerMin: number;
    headStability: number; // 0 - 100
  };
  /** Latest normalized optical pulse photoplethysmogram sample */
  rawPpgSample: number;
  /** Latest normalized respiration sample */
  rawRespSample: number;
  /** Timestamp in ms */
  timestamp: number;
}

export interface BreathingPattern {
  id: string;
  name: string;
  tagline: string;
  description: string;
  inhaleSec: number;
  holdInSec: number;
  exhaleSec: number;
  holdOutSec: number;
  targetBpm: number; // target breaths per minute
  isAdaptive?: boolean;
}

export type BreathingPhase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out' | 'idle';

export interface SessionRecord {
  id: string;
  timestamp: number;
  dateStr: string;
  durationSeconds: number;
  patternId: string;
  patternName: string;
  startStress: number;
  endStress: number;
  stressDelta: number; // negative is stress reduction
  avgPulse: number;
  avgRespiration: number;
  coherenceScore: number; // 0 - 100%
  notes?: string;
}

export interface SmartSpectraConfig {
  apiKey: string;
  endpoint: string;
  mode: 'auto' | 'sdk' | 'rppg' | 'simulated';
  isConnected: boolean;
  model: string;
}

export interface CameraConsentState {
  hasAgreed: boolean;
  timestamp: number | null;
  privacyVersion: string;
}
