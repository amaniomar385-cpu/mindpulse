/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldCheck, Lock, EyeOff, Cpu, AlertTriangle, Check, Trash2, Download } from 'lucide-react';
import { CameraConsentState } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  consent: CameraConsentState;
  onUpdateConsent: (newConsent: CameraConsentState) => void;
}

export const PrivacyModal: React.FC<Props> = ({
  isOpen,
  onClose,
  consent,
  onUpdateConsent,
}) => {
  const [hasScrolledTerms, setHasScrolledTerms] = useState(false);

  if (!isOpen) return null;

  const handleAcceptConsent = () => {
    onUpdateConsent({
      hasAgreed: true,
      timestamp: Date.now(),
      privacyVersion: '2026.11-DEV-CHALLENGE',
    });
    onClose();
  };

  const handleRevokeConsent = () => {
    onUpdateConsent({
      hasAgreed: false,
      timestamp: null,
      privacyVersion: '2026.11-DEV-CHALLENGE',
    });
  };

  const handleClearLocalData = () => {
    if (confirm('Are you sure you want to delete all locally recorded breathing sessions and preferences?')) {
      localStorage.removeItem('mindpulse_sessions');
      localStorage.removeItem('mindpulse_presage_key');
      alert('Local session history and cached settings have been completely wiped.');
    }
  };

  const handleExportData = () => {
    const rawSessions = localStorage.getItem('mindpulse_sessions') || '[]';
    const blob = new Blob([rawSessions], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mindpulse-telemetry-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 rounded-lg text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Camera Consent & Privacy Protocol</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Presage SmartSpectra SDK Challenge Compliance & Standards
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

        {/* Scrollable Content */}
        <div
          className="p-6 overflow-y-auto space-y-5 text-sm"
          onScroll={() => setHasScrolledTerms(true)}
        >
          {/* Medical Notice Box */}
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-lg text-amber-900 dark:text-amber-200 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-xs tracking-wider uppercase text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              Official Medical Disclaimer
            </div>
            <p className="text-xs leading-relaxed">
              <strong>MindPulse is a wellness & self-regulation tool.</strong> It is <strong>NOT</strong> intended
              for medical diagnosis, clinical treatment, physiological anomaly detection, or emergency medical
              decision-making. All metrics (pulse, breathing, HRV, stress) are computed via optical approximations
              for mindfulness, biofeedback, and stress regulation purposes only.
            </p>
          </div>

          {/* Privacy Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg">
              <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-medium text-xs mb-1">
                <Cpu className="w-4 h-4 text-blue-500" />
                In-Memory Processing
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Camera frames are analyzed on the fly in volatile RAM. No pixel buffer is ever recorded to disk.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg">
              <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-medium text-xs mb-1">
                <EyeOff className="w-4 h-4 text-emerald-500" />
                Zero Video Storage
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Zero raw video frames leave your device. No cloud storage, no server databases, and no telemetry feeds.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg">
              <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-medium text-xs mb-1">
                <Lock className="w-4 h-4 text-purple-500" />
                No Facial Identification
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                We only measure ambient light micro-reflections (rPPG). We do not perform face identification or profiling.
              </p>
            </div>
          </div>

          {/* Detailed Explanations */}
          <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-200 dark:border-slate-800 pt-4">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
              How the Presage SmartSpectra Technology Works
            </h4>
            <p>
              When you grant camera access, MindPulse uses contactless optical remote Photoplethysmography (rPPG)
              and the Presage SmartSpectra SDK. As blood pulses through facial capillaries with each heartbeat, it
              subtly modulates the skin’s light absorption—primarily in the green spectrum (540–577 nm).
            </p>
            <p>
              By extracting spatial averages across the forehead and cheek region of interest (ROI), the SDK measures
              cardiac pulse intervals, extracts heart rate variability (HRV), and derives respiration rates from
              periodic micromovements and respiratory sinus arrhythmia.
            </p>

            <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm pt-2">
              Data Retention & User Sovereignty
            </h4>
            <p>
              Session history (start/end stress, session duration, breathing protocol) is stored exclusively in your
              browser&apos;s local storage (<code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[11px]">localStorage</code>).
              You can download your data as JSON or wipe it with a single click below.
            </p>
          </div>

          {/* Local Data Management */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-slate-600 dark:text-slate-400">Manage Your Local Data:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportData}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Export JSON
              </button>
              <button
                onClick={handleClearLocalData}
                className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 rounded-md hover:bg-rose-100 transition flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Wipe Local Data
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Current Status:{' '}
            <span className={consent.hasAgreed ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-amber-600 font-medium'}>
              {consent.hasAgreed ? '✓ Consent Active (Local Only)' : 'Pending Acceptance'}
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {consent.hasAgreed ? (
              <button
                onClick={handleRevokeConsent}
                className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition"
              >
                Revoke Consent
              </button>
            ) : null}
            <button
              onClick={handleAcceptConsent}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 rounded-lg transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Check className="w-4 h-4" />
              {consent.hasAgreed ? 'Keep Consent & Close' : 'I Understand & Agree to Consent'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
