import React, { useState } from 'react';
import { Barcode, Hash, Building2, ListFilter, Sparkles, AlertCircle } from 'lucide-react';
import { SerializedConfig, BarcodeFormat } from '../types/label';

interface SerializedConfigPanelProps {
  config: SerializedConfig;
  onChange: React.Dispatch<React.SetStateAction<SerializedConfig>>;
  customSerialList: string;
  setCustomSerialList: (val: string) => void;
  isCustomListMode: boolean;
  setIsCustomListMode: (val: boolean) => void;
}

export const SerializedConfigPanel: React.FC<SerializedConfigPanelProps> = ({
  config,
  onChange,
  customSerialList,
  setCustomSerialList,
  isCustomListMode,
  setIsCustomListMode,
}) => {
  // Preset match from the user's attached image
  const applyImageMockupPreset = () => {
    setIsCustomListMode(false);
    onChange((prev) => ({
      ...prev,
      companyTitle: 'COMPANY TITLE',
      subtitle: '',
      prefix: '',
      suffix: '',
      startNumber: 1,
      endNumber: 10,
      step: 1,
      serialSize: 30, // Large asset # by default
      barcodeFormat: 'CODE128',
      showBarcodeHumanReadable: false,
    }));
  };

  const rawStart = Number(config.startNumber);
  const rawEnd = Number(config.endNumber);
  const rawStep = Number(config.step);

  const safeStart = Number.isFinite(rawStart) ? rawStart : 0;
  const safeEnd = Number.isFinite(rawEnd) ? rawEnd : 0;
  const safeStep = Number.isFinite(rawStep) && rawStep > 0 ? rawStep : 1;

  const rawCount = Math.floor(Math.abs(safeEnd - safeStart) / safeStep) + 1;
  const calculatedTotalLabels = Math.min(2000, Math.max(1, rawCount));
  const isCapped = rawCount > 2000;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
      {/* Header with reference image quick-match */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Barcode className="w-5 h-5 text-slate-800" />
          <h2 className="text-base font-bold text-slate-900">
            Serialized Barcode Label
          </h2>
        </div>

        <button
          type="button"
          onClick={applyImageMockupPreset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Apply Reference Image Format</span>
        </button>
      </div>

      {/* 1. Header & Title Controls */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Company Title (Top Header)</span>
          </label>
          <input
            type="text"
            value={config.companyTitle}
            onChange={(e) => onChange((prev) => ({ ...prev, companyTitle: e.target.value }))}
            placeholder="e.g. COMPANY TITLE or ACME INDUSTRIES"
            className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none uppercase"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Displayed prominently at the top center of each 4" × 2" label.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Subtitle / Department / Tagline (Optional)
          </label>
          <input
            type="text"
            value={config.subtitle}
            onChange={(e) => onChange((prev) => ({ ...prev, subtitle: e.target.value }))}
            placeholder="e.g. ASSET TRACKING SYSTEM or QUALITY INSPECTION"
            className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
          />
        </div>
      </div>

      {/* 2. Serialization Mode Toggle: Sequential vs Custom List */}
      <div className="pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Serial & Asset Number Range
          </label>
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-md">
            <button
              type="button"
              onClick={() => setIsCustomListMode(false)}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                !isCustomListMode ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Start # to End #
            </button>
            <button
              type="button"
              onClick={() => setIsCustomListMode(true)}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                isCustomListMode ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Custom Paste List
            </button>
          </div>
        </div>

        {!isCustomListMode ? (
          /* Start # to End # Controls */
          <div className="space-y-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200/70">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Prefix (Optional)
                </label>
                <input
                  type="text"
                  value={config.prefix}
                  onChange={(e) => onChange((prev) => ({ ...prev, prefix: e.target.value }))}
                  placeholder="e.g. ASSET- or #"
                  className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Suffix (Optional)
                </label>
                <input
                  type="text"
                  value={config.suffix}
                  onChange={(e) => onChange((prev) => ({ ...prev, suffix: e.target.value }))}
                  placeholder="e.g. -A or -2026"
                  className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-mono"
                />
              </div>
            </div>

            {/* Start # and End # */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Start #
                </label>
                <input
                  type="number"
                  value={config.startNumber}
                  onChange={(e) => {
                    const val = e.target.value;
                    onChange((prev) => ({ ...prev, startNumber: val === '' ? '' : val }));
                  }}
                  className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  End #
                </label>
                <input
                  type="number"
                  value={config.endNumber}
                  onChange={(e) => {
                    const val = e.target.value;
                    onChange((prev) => ({ ...prev, endNumber: val === '' ? '' : val }));
                  }}
                  className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Step Increment
                </label>
                <input
                  type="number"
                  min={1}
                  value={config.step}
                  onChange={(e) => {
                    const val = e.target.value;
                    onChange((prev) => ({ ...prev, step: val === '' ? '' : Math.max(1, parseInt(val, 10) || 1) }));
                  }}
                  className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-mono"
                />
              </div>
            </div>

            {isCapped && (
              <div className="flex items-center gap-1.5 p-2 bg-amber-50 text-amber-800 text-xs rounded-lg border border-amber-200">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>Range capped at 2,000 labels to preserve browser memory and performance.</span>
              </div>
            )}

            <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs flex items-center justify-between text-slate-600 flex-wrap gap-2">
              <span className="flex items-center gap-2">
                <span>Range: </span>
                <strong className="text-slate-900 font-mono">
                  {config.prefix}{safeStart}{config.suffix} → {config.prefix}{safeEnd}{config.suffix}
                </strong>
                {safeStart > safeEnd && (
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                    Descending
                  </span>
                )}
              </span>
              <span className="font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                {calculatedTotalLabels} {calculatedTotalLabels === 1 ? 'label' : 'labels'}
              </span>
            </div>
          </div>
        ) : (
          /* Custom Serial List Textarea */
          <div className="space-y-2 bg-slate-50/70 p-4 rounded-xl border border-slate-200/70">
            <label className="block text-xs font-medium text-slate-700">
              Paste Serial Numbers (One per line)
            </label>
            <textarea
              rows={5}
              value={customSerialList}
              onChange={(e) => setCustomSerialList(e.target.value)}
              placeholder="SN-1000294&#10;SN-1000295&#10;SN-1000296&#10;SN-1000297"
              className="w-full text-xs font-mono bg-white border border-slate-200 rounded-lg p-3 text-slate-800 focus:ring-2 focus:ring-slate-900 focus:outline-none"
            />
            <span className="text-[11px] text-slate-500">
              Each non-empty line produces a separate 4" × 2" label.
            </span>
          </div>
        )}
      </div>

      {/* 3. Barcode Configuration */}
      <div className="pt-2 border-t border-slate-100 space-y-4">
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
          Barcode Symbology & Settings
        </label>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Symbology Format
            </label>
            <select
              value={config.barcodeFormat}
              onChange={(e) => onChange((prev) => ({ ...prev, barcodeFormat: e.target.value as BarcodeFormat }))}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium"
            >
              <option value="CODE128">Code 128 (Recommended - High Density)</option>
              <option value="CODE39">Code 39 (Standard Alphanumeric)</option>
              <option value="EAN13">EAN-13 (13 Digits)</option>
              <option value="UPC">UPC (12 Digits)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Human-Readable Below Bars
            </label>
            <button
              type="button"
              onClick={() => onChange((prev) => ({ ...prev, showBarcodeHumanReadable: !prev.showBarcodeHumanReadable }))}
              className={`w-full text-xs rounded-lg px-3 py-2 border transition-colors text-left flex items-center justify-between ${
                config.showBarcodeHumanReadable
                  ? 'bg-slate-900 text-white border-slate-900 font-medium'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <span>{config.showBarcodeHumanReadable ? 'Enabled' : 'Hidden (Matches Reference)'}</span>
              <span className="text-[10px] opacity-75">
                {config.showBarcodeHumanReadable ? 'Shown' : 'Off'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
