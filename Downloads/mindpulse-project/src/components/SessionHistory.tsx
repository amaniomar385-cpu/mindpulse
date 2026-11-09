/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Calendar, Download, Trash2, TrendingDown, Clock, Award, Sparkles, ArrowRight } from 'lucide-react';
import { SessionRecord } from '../types';

interface Props {
  sessions: SessionRecord[];
  onClearHistory: () => void;
  onNavigateToBreathing: () => void;
}

export const SessionHistory: React.FC<Props> = ({
  sessions,
  onClearHistory,
  onNavigateToBreathing,
}) => {
  const totalMinutes = Math.round(
    sessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0) / 60
  );

  const avgStressReduction =
    sessions.length > 0
      ? Math.round(
          Math.abs(
            sessions.reduce((acc, s) => acc + (s.stressDelta || 0), 0) / sessions.length
          )
        )
      : 0;

  const avgCoherence =
    sessions.length > 0
      ? Math.round(
          sessions.reduce((acc, s) => acc + (s.coherenceScore || 75), 0) / sessions.length
        )
      : 0;

  const handleExportCsv = () => {
    if (sessions.length === 0) return;
    const headers = [
      'ID',
      'Date',
      'Pattern',
      'DurationSeconds',
      'StartStress',
      'EndStress',
      'StressDelta',
      'AvgPulseBpm',
      'AvgRespirationRPM',
      'CoherenceScore',
    ];
    const rows = sessions.map((s) => [
      s.id,
      `"${s.dateStr}"`,
      `"${s.patternName}"`,
      s.durationSeconds,
      s.startStress,
      s.endStress,
      s.stressDelta,
      s.avgPulse,
      s.avgRespiration,
      s.coherenceScore,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mindpulse-sessions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* Analytics KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 rounded-lg text-indigo-600 dark:text-indigo-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase text-slate-400">Mindful Breathing</div>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
              {totalMinutes} <span className="text-xs font-normal text-slate-400">mins</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 rounded-lg text-emerald-600 dark:text-emerald-400">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase text-slate-400">Avg Stress Reduction</div>
            <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
              -{avgStressReduction} <span className="text-xs font-normal text-slate-400">pts</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-cyan-50 dark:bg-cyan-950/60 rounded-lg text-cyan-600 dark:text-cyan-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase text-slate-400">Average Coherence</div>
            <div className="text-2xl font-bold font-mono text-cyan-600 dark:text-cyan-400 tabular-nums">
              {avgCoherence}%
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-purple-50 dark:bg-purple-950/60 rounded-lg text-purple-600 dark:text-purple-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase text-slate-400">Completed Sessions</div>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
              {sessions.length}
            </div>
          </div>
        </div>

      </div>

      {/* Sessions Table Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        
        {/* Table Header Controls */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" />
              Biofeedback Session History
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Locally stored physiological trajectories and relaxation outcomes
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              disabled={sessions.length === 0}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-lg transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
            <button
              onClick={onClearHistory}
              disabled={sessions.length === 0}
              className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 disabled:opacity-40 text-rose-700 dark:text-rose-300 text-xs font-medium rounded-lg transition flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Log
            </button>
          </div>
        </div>

        {/* Sessions List */}
        {sessions.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                No Biofeedback Sessions Recorded Yet
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Complete your first guided breathing exercise to monitor your heart rate variability (HRV) and stress
                reduction trends over time.
              </p>
            </div>
            <button
              onClick={onNavigateToBreathing}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition inline-flex items-center gap-1.5"
            >
              <span>Start First Session</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-mono text-[11px] uppercase border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3">Date & Time</th>
                  <th className="px-6 py-3">Technique</th>
                  <th className="px-6 py-3">Duration</th>
                  <th className="px-6 py-3">Stress Delta</th>
                  <th className="px-6 py-3">Pulse (BPM)</th>
                  <th className="px-6 py-3">Coherence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                {sessions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition">
                    <td className="px-6 py-3.5 font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {s.dateStr}
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap font-medium text-indigo-600 dark:text-indigo-400">
                      {s.patternName}
                    </td>
                    <td className="px-6 py-3.5 font-mono whitespace-nowrap tabular-nums">
                      {Math.round(s.durationSeconds / 60)} min ({s.durationSeconds}s)
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-mono tabular-nums">
                        <span>{s.startStress} → {s.endStress}</span>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                            s.stressDelta <= 0
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {s.stressDelta <= 0 ? `${s.stressDelta}` : `+${s.stressDelta}`}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 font-mono whitespace-nowrap tabular-nums">
                      {s.avgPulse} BPM
                    </td>
                    <td className="px-6 py-3.5 font-mono whitespace-nowrap text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">
                      {s.coherenceScore}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};
