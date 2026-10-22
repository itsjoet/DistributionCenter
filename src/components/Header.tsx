import React from 'react';
import { Printer, Download, Sparkles } from 'lucide-react';

interface HeaderProps {
  onDownloadPdf: () => void;
  onDirectPrint: () => void;
  onOpenSavedConfigs: () => void;
  totalLabels: number;
}

export const Header: React.FC<HeaderProps> = ({
  onDownloadPdf,
  onDirectPrint,
  onOpenSavedConfigs,
  totalLabels,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-4 bg-white border-b border-slate-200 sticky top-0 z-40">
      {/* Zone 1: Single text element wordmark */}
      <a href="/" className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 flex items-center gap-2">
        <span className="w-7 h-7 rounded bg-slate-900 text-white flex items-center justify-center text-xs font-mono font-bold">
          4×2
        </span>
        <span>PDF Label Maker</span>
      </a>

      {/* Zone 2: 4-5 clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
        <a href="#editor" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
          Label Editor
        </a>
        <a href="#preview" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
          Live 4×2 Preview
        </a>
        <a href="#typography" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
          Text Sizing
        </a>
        <a href="#export-format" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
          Roll & Avery 5163
        </a>
      </nav>

      {/* Zone 3: 1 primary action area */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={onOpenSavedConfigs}
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-2xs"
          title="Save or load configuration profiles"
        >
          <span>Saved Presets</span>
        </button>

        <button
          onClick={onDirectPrint}
          type="button"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          title="Print directly to connected thermal or sheet printer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print</span>
        </button>

        <button
          onClick={onDownloadPdf}
          type="button"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export {totalLabels} {totalLabels === 1 ? 'Label' : 'Labels'} PDF</span>
        </button>
      </div>
    </header>
  );
};
