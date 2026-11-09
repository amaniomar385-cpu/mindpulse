/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldAlert, X, Info } from 'lucide-react';

interface Props {
  onOpenPrivacyModal?: () => void;
}

export const MedicalDisclaimerBanner: React.FC<Props> = ({ onOpenPrivacyModal }) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) {
    return (
      <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/50 py-1.5 px-4 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>Wellness & Self-Regulation Tool · Non-Medical</span>
        </div>
        <button
          onClick={() => setIsDismissed(false)}
          className="text-amber-700 dark:text-amber-300 underline hover:text-amber-900 text-xs"
        >
          View Full Disclaimer
        </button>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label="Medical Disclaimer"
      className="bg-amber-50/90 dark:bg-amber-950/60 border-b border-amber-200/80 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-xs py-2 px-4 transition-colors"
    >
      <div className="max-w-7xl mx-auto flex items-start sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
          <p className="leading-snug">
            <strong className="font-semibold text-amber-950 dark:text-amber-100">Medical Notice:</strong>{' '}
            MindPulse is a wellness & self-regulation tool. It is{' '}
            <strong className="underline decoration-amber-400 font-semibold">NOT</strong> intended for medical diagnosis,
            treatment, or clinical decision-making. If experiencing health concerns, consult a licensed healthcare
            provider.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {onOpenPrivacyModal && (
            <button
              onClick={onOpenPrivacyModal}
              className="text-xs font-medium text-amber-800 dark:text-amber-300 underline hover:text-amber-950 whitespace-nowrap"
            >
              Privacy & Standards
            </button>
          )}
          <button
            onClick={() => setIsDismissed(true)}
            aria-label="Minimize disclaimer"
            className="p-1 text-amber-700 hover:text-amber-950 dark:text-amber-400 dark:hover:text-amber-200 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
