/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sun, Moon, Key, FileText, Heart, Activity, Download } from 'lucide-react';
import { VitalsData, SessionRecord, SmartSpectraConfig, CameraConsentState } from './types';
import { smartSpectraEngine } from './services/smartSpectraEngine';
import { MedicalDisclaimerBanner } from './components/MedicalDisclaimerBanner';
import { SmartSpectraTracker } from './components/SmartSpectraTracker';
import { Dashboard } from './components/Dashboard';
import { BreathingGuide } from './components/BreathingGuide';
import { SessionHistory } from './components/SessionHistory';
import { PrivacyModal } from './components/PrivacyModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { DevPostDraftModal } from './components/DevPostDraftModal';

type NavTab = 'monitor' | 'breathing' | 'history' | 'privacy';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('monitor');
  const [vitals, setVitals] = useState<VitalsData | null>(null);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [recommendedPatternId, setRecommendedPatternId] = useState<string>('adaptive');

  // Modals state
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isApiKeyOpen, setIsApiKeyOpen] = useState(false);
  const [isDevPostOpen, setIsDevPostOpen] = useState(false);

  // Theme state (persisted)
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('mindpulse_theme');
      if (stored) return stored === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  // Consent state (persisted)
  const [consent, setConsent] = useState<CameraConsentState>(() => {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('mindpulse_consent');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {}
      }
    }
    return {
      hasAgreed: true, // Default active for immediate frictionless testing, can be toggled
      timestamp: Date.now(),
      privacyVersion: '2026.11-DEV-CHALLENGE',
    };
  });

  // SmartSpectra Config state
  const [config, setConfig] = useState<SmartSpectraConfig>(() => smartSpectraEngine.getConfig());

  // Apply dark class to documentElement
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('mindpulse_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('mindpulse_theme', 'light');
    }
  }, [isDark]);

  // Load sessions from localStorage
  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('mindpulse_sessions');
      if (stored) {
        try {
          setSessions(JSON.parse(stored));
        } catch {}
      }
    }
  }, []);

  // Listen to live vitals from SmartSpectraEngine
  useEffect(() => {
    smartSpectraEngine.registerVitalsListener((data: VitalsData) => {
      setVitals(data);
    });
  }, []);

  const handleUpdateConsent = (newConsent: CameraConsentState) => {
    setConsent(newConsent);
    localStorage.setItem('mindpulse_consent', JSON.stringify(newConsent));
  };

  const handleSaveConfig = (newConfig: Partial<SmartSpectraConfig>) => {
    smartSpectraEngine.setConfig(newConfig);
    setConfig(smartSpectraEngine.getConfig());
  };

  const handleSessionComplete = (newSession: SessionRecord) => {
    const updated = [newSession, ...sessions];
    setSessions(updated);
    localStorage.setItem('mindpulse_sessions', JSON.stringify(updated));
  };

  const handleClearHistory = () => {
    if (confirm('Clear all locally saved breathing sessions?')) {
      setSessions([]);
      localStorage.removeItem('mindpulse_sessions');
    }
  };

  const handleNavigateToBreathing = (patternId?: string) => {
    if (patternId) {
      setRecommendedPatternId(patternId);
    }
    setActiveTab('breathing');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Strict Contest Medical Notice Banner */}
      <MedicalDisclaimerBanner onOpenPrivacyModal={() => setIsPrivacyOpen(true)} />

      {/* Top Navigation Bar - Following strict 3-Zone Contract */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-8 h-16">
          
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="p-1.5 bg-indigo-600 rounded-lg text-white">
              <Heart className="w-4 h-4 fill-white" />
            </span>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap">
              MindPulse
            </span>
            <span className="hidden sm:inline-block text-[11px] font-mono text-slate-400">
              · SmartSpectra SDK
            </span>
          </div>

          {/* Zone 2: 4 clean single-line nav links */}
          <nav className="flex items-center gap-1 sm:gap-6 text-xs sm:text-sm font-medium">
            <button
              onClick={() => setActiveTab('monitor')}
              className={`py-1 px-2.5 rounded-md transition whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'monitor'
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Live Monitor
            </button>

            <button
              onClick={() => setActiveTab('breathing')}
              className={`py-1 px-2.5 rounded-md transition whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'breathing'
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Breathing Guide
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`py-1 px-2.5 rounded-md transition whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'history'
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Analytics
            </button>

            <button
              onClick={() => setIsPrivacyOpen(true)}
              className="py-1 px-2.5 rounded-md text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition whitespace-nowrap shrink-0 cursor-pointer"
            >
              Privacy & Consent
            </button>
          </nav>

          {/* Zone 3: 1 primary action + utility buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsApiKeyOpen(true)}
              title="Presage API Key Settings"
              className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            >
              <Key className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsDark(!isDark)}
              title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            <a
              href="/mindpulse-project.zip"
              download="mindpulse-project.zip"
              title="Download Entire Project Source Code (ZIP)"
              className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden lg:inline text-xs font-semibold text-emerald-600 dark:text-emerald-400">Download ZIP</span>
            </a>

            <button
              onClick={() => setIsDevPostOpen(true)}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg transition flex items-center gap-1.5 shadow-sm whitespace-nowrap shrink-0 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden md:inline">DEV Post Draft</span>
              <span className="md:hidden">DEV Post</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Tab 1: Live Monitor (Camera Optical Tracker + Signal Dashboard) */}
        {activeTab === 'monitor' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: SmartSpectra Optical Camera Tracker */}
              <div className="lg:col-span-5 w-full">
                <SmartSpectraTracker
                  vitals={vitals}
                  config={config}
                  onOpenSettings={() => setIsApiKeyOpen(true)}
                  onOpenPrivacy={() => setIsPrivacyOpen(true)}
                />
              </div>

              {/* Right Column: Real-Time Signal Dashboard */}
              <div className="lg:col-span-7 w-full">
                <Dashboard
                  vitals={vitals}
                  onNavigateToBreathing={handleNavigateToBreathing}
                />
              </div>

            </div>
          </div>
        )}

        {/* Tab 2: Interactive Biofeedback Breathing Guide */}
        {activeTab === 'breathing' && (
          <div className="max-w-4xl mx-auto">
            <BreathingGuide
              vitals={vitals}
              initialPatternId={recommendedPatternId}
              onSessionComplete={handleSessionComplete}
            />
          </div>
        )}

        {/* Tab 3: Session History & Analytics */}
        {activeTab === 'history' && (
          <div className="max-w-5xl mx-auto">
            <SessionHistory
              sessions={sessions}
              onClearHistory={handleClearHistory}
              onNavigateToBreathing={() => setActiveTab('breathing')}
            />
          </div>
        )}

      </main>

      {/* Clean Scientific Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 px-4 text-xs text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-500" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">MindPulse</span>
            <span>· Built for the Presage SmartSpectra SDK Challenge on DEV</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <button onClick={() => setIsPrivacyOpen(true)} className="hover:underline">
              Zero-Retention Privacy Policy
            </button>
            <span>·</span>
            <button onClick={() => setIsApiKeyOpen(true)} className="hover:underline">
              API Configuration
            </button>
            <span>·</span>
            <button onClick={() => setIsDevPostOpen(true)} className="hover:underline">
              Contest Submission Template
            </button>
          </div>
        </div>
      </footer>

      {/* Privacy & Camera Consent Modal */}
      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        consent={consent}
        onUpdateConsent={handleUpdateConsent}
      />

      {/* Presage SmartSpectra API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyOpen}
        onClose={() => setIsApiKeyOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
      />

      {/* DEV Community Post Submission Template Modal */}
      <DevPostDraftModal
        isOpen={isDevPostOpen}
        onClose={() => setIsDevPostOpen(false)}
      />

    </div>
  );
}
