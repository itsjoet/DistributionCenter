import React from 'react';
import { Download, Printer, Settings2, FileSpreadsheet, Layers, RotateCw, HelpCircle, Check, ArrowRight } from 'lucide-react';
import { ExportFormat, PrintOrientation } from '../types/label';

interface ExportToolbarProps {
  exportFormat: ExportFormat;
  setExportFormat: (format: ExportFormat) => void;
  printOrientation: PrintOrientation;
  setPrintOrientation: (orientation: PrintOrientation) => void;
  totalLabels: number;
  onDownloadPdf: () => void;
  onDirectPrint: () => void;
  isGeneratingPdf: boolean;
  onOpenPrinterGuide: () => void;
}

export const ExportToolbar: React.FC<ExportToolbarProps> = ({
  exportFormat,
  setExportFormat,
  printOrientation,
  setPrintOrientation,
  totalLabels,
  onDownloadPdf,
  onDirectPrint,
  isGeneratingPdf,
  onOpenPrinterGuide,
}) => {
  const calculatedSheets = Math.ceil(totalLabels / 10);

  return (
    <div id="export-format" className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-slate-800" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            PDF Export & Print Settings
          </h3>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          <strong className="text-slate-900">{totalLabels}</strong> {totalLabels === 1 ? 'label' : 'labels'} queued
        </div>
      </div>

      {/* Format Selection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Single Roll Format */}
        <button
          type="button"
          onClick={() => setExportFormat('single_roll')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative ${
            exportFormat === 'single_roll'
              ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
              : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              <span>Direct 4" × 2" Single Label Roll</span>
            </span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                exportFormat === 'single_roll' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
              }`}
            >
              Thermal Roll
            </span>
          </div>
          <p
            className={`text-xs ${
              exportFormat === 'single_roll' ? 'text-slate-300' : 'text-slate-500'
            }`}
          >
            One 4" × 2" page per label. Designed for Zebra, Rollo, Brother, DYMO, and MUNBYN thermal printers.
          </p>
          <div
            className={`text-[11px] font-mono mt-2 font-medium ${
              exportFormat === 'single_roll' ? 'text-slate-200' : 'text-slate-700'
            }`}
          >
            Total Pages: {totalLabels} pages (4.0" × 2.0")
          </div>
        </button>

        {/* Avery 5163 / 5963 Letter Sheet */}
        <button
          type="button"
          onClick={() => setExportFormat('avery_5163')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative ${
            exportFormat === 'avery_5163'
              ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
              : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Avery® 5163 / 5963 Sheet</span>
            </span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                exportFormat === 'avery_5163' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
              }`}
            >
              8.5" × 11"
            </span>
          </div>
          <p
            className={`text-xs ${
              exportFormat === 'avery_5163' ? 'text-slate-300' : 'text-slate-500'
            }`}
          >
            Standard 10 labels per Letter page (2 columns × 5 rows). Fits Avery 5163, 5263, 5963, 8163 laser/inkjet sheets.
          </p>
          <div
            className={`text-[11px] font-mono mt-2 font-medium ${
              exportFormat === 'avery_5163' ? 'text-slate-200' : 'text-slate-700'
            }`}
          >
            Total Sheets: {calculatedSheets} {calculatedSheets === 1 ? 'sheet' : 'sheets'} (10 labels/sheet)
          </div>
        </button>
      </div>

      {/* Orientation & Sideways Print Correction Section (Active for Single Roll) */}
      {exportFormat === 'single_roll' && (
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <RotateCw className="w-4 h-4 text-slate-700" />
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Roll Feed Direction & Orientation
              </span>
            </div>

            <button
              type="button"
              onClick={onOpenPrinterGuide}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-100/80 hover:bg-amber-200/80 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
              <span>Fix Sideways / Cut-off Print</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-500">
            If your thermal printer feeds lengthwise or your driver rotates the page sideways, toggle to <strong>Rotated 90°</strong>.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Normal 0deg */}
            <button
              type="button"
              onClick={() => setPrintOrientation('normal')}
              className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                printOrientation === 'normal'
                  ? 'border-slate-900 bg-white ring-1 ring-slate-900 shadow-xs'
                  : 'border-slate-200 bg-white/70 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-bold text-slate-900">Normal (4" × 2")</span>
                {printOrientation === 'normal' && <Check className="w-3.5 h-3.5 text-slate-900" />}
              </div>
              <span className="text-[10px] text-slate-500 block">
                Standard horizontal feed
              </span>
            </button>

            {/* Rotated 90deg */}
            <button
              type="button"
              onClick={() => setPrintOrientation('rotate90')}
              className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                printOrientation === 'rotate90'
                  ? 'border-amber-600 bg-amber-50 ring-1 ring-amber-600 shadow-xs'
                  : 'border-slate-200 bg-white/70 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-bold text-slate-900">Rotated 90° (2" × 4")</span>
                {printOrientation === 'rotate90' && <Check className="w-3.5 h-3.5 text-amber-700" />}
              </div>
              <span className="text-[10px] text-amber-700 font-medium block">
                Fixes sideways/cut-off prints
              </span>
            </button>

            {/* Inverted 180deg */}
            <button
              type="button"
              onClick={() => setPrintOrientation('rotate180')}
              className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                printOrientation === 'rotate180'
                  ? 'border-slate-900 bg-white ring-1 ring-slate-900 shadow-xs'
                  : 'border-slate-200 bg-white/70 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-bold text-slate-900">Inverted 180°</span>
                {printOrientation === 'rotate180' && <Check className="w-3.5 h-3.5 text-slate-900" />}
              </div>
              <span className="text-[10px] text-slate-500 block">
                For upside-down dispensers
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Main Export Action Bar */}
      <div className="pt-2 flex items-center justify-between gap-3 flex-wrap border-t border-slate-100">
        <div className="text-xs text-slate-500">
          Selected: <strong className="text-slate-800">{exportFormat === 'single_roll' ? (printOrientation === 'rotate90' ? 'Thermal Roll (Rotated 90°)' : 'Thermal Roll (4"×2")') : 'Avery 5163 Sheet'}</strong>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onDirectPrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-700" />
            <span>Direct Browser Print</span>
          </button>

          <button
            type="button"
            onClick={onDownloadPdf}
            disabled={isGeneratingPdf}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isGeneratingPdf ? 'Generating PDF...' : `Download ${totalLabels} Labels (.pdf)`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
