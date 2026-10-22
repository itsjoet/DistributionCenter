import React, { useState } from 'react';
import { X, HelpCircle, Check, RotateCw, AlertTriangle, Printer, SlidersHorizontal, ArrowRight } from 'lucide-react';
import { PrintOrientation } from '../types/label';

interface PrinterGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  printOrientation: PrintOrientation;
  setPrintOrientation: (orientation: PrintOrientation) => void;
}

export const PrinterGuideModal: React.FC<PrinterGuideModalProps> = ({
  isOpen,
  onClose,
  printOrientation,
  setPrintOrientation,
}) => {
  const [activeTab, setActiveTab] = useState<'explanation' | 'chrome' | 'windows' | 'mac'>('explanation');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-700">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Fix Sideways & Cut-off Printing
              </h2>
              <p className="text-xs text-slate-500">
                Printer driver vs. 4" × 2" thermal roll setup guide
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer"
            aria-label="Close dialog"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Orientation Switcher Bar directly inside the modal */}
        <div className="px-6 py-3.5 bg-amber-50 border-b border-amber-100 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-xs text-amber-900 font-medium">
            <RotateCw className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Need immediate fix? Switch PDF / Print Orientation:</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-amber-200 shadow-xs">
            <button
              type="button"
              onClick={() => setPrintOrientation('normal')}
              className={`px-3 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                printOrientation === 'normal'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Normal (4"×2")
            </button>
            <button
              type="button"
              onClick={() => setPrintOrientation('rotate90')}
              className={`px-3 py-1 text-xs font-semibold rounded transition-colors cursor-pointer flex items-center gap-1 ${
                printOrientation === 'rotate90'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-amber-800 hover:bg-amber-100'
              }`}
            >
              <span>Rotated 90° (Feed Direction)</span>
              {printOrientation === 'rotate90' && <Check className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => setPrintOrientation('rotate180')}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                printOrientation === 'rotate180'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              180° Inverted
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-slate-200 px-6 bg-white gap-2 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('explanation')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'explanation'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Why This Happens
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('chrome')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'chrome'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Chrome / Browser Print Dialog
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('windows')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'windows'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Windows (Zebra / Rollo / MUNBYN)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('mac')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'mac'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            macOS Settings
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-600 leading-relaxed">
          {activeTab === 'explanation' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Is this a "me" issue or this program?</span>
                </h3>
                <p>
                  <strong>It is a classic mismatch between thermal printer roll feed mechanics and system print dialog defaults!</strong>
                </p>
                <p>
                  Desktop thermal printers (like Zebra, Rollo, MUNBYN, Brother, and DYMO) feed 4-inch wide rolls with a 2-inch advance. When you open a PDF or click Print, the operating system print dialog often defaults to <strong>Paper Size: Letter (8.5" × 11")</strong> or <strong>4" × 6" Shipping</strong>, and auto-rotates the 4" wide canvas 90° into a portrait slot. Because the physical roll is only 2" along the feed, <strong>the remaining 2 inches get cut off!</strong>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1.5">
                  <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Solution 1: Toggle In-App Rotation</span>
                  </div>
                  <p className="text-emerald-800 text-[11px]">
                    Click <strong>"Rotated 90° (Feed Direction)"</strong> above. This re-aligns the PDF canvas so it matches your printer's native roll feed direction automatically.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50 space-y-1.5">
                  <div className="font-bold text-blue-900 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                    <span>Solution 2: Select 4" × 2" Paper Size</span>
                  </div>
                  <p className="text-blue-800 text-[11px]">
                    In your computer's print dialog, select <strong>Paper Size: 4" × 2"</strong> (or 100mm × 50mm) and set <strong>Scale to 100%</strong> or Fit to Printable Area.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'chrome' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Printer className="w-4 h-4 text-slate-700" />
                <span>Chrome / Edge Print Dialog Settings</span>
              </h4>
              <ol className="list-decimal list-inside space-y-2.5 text-slate-700">
                <li className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <strong>Destination:</strong> Select your thermal label printer (not "Save as PDF").
                </li>
                <li className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <strong>More settings &gt; Paper size:</strong> Change from <em>"Letter"</em> or <em>"4x6"</em> to <strong>4" × 2"</strong> or <strong>100mm × 50mm</strong>. If missing, see the Windows/Mac tab to add a custom size.
                </li>
                <li className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <strong>Scale:</strong> Select <strong>"Fit to printable area"</strong> or <strong>100%</strong> (do not use "Fit to page" if the paper size is Letter).
                </li>
                <li className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <strong>Orientation:</strong> Try toggling between <em>Landscape</em> and <em>Portrait</em>, or use the <strong>"Rotated 90°"</strong> button in our app!
                </li>
              </ol>
            </div>
          )}

          {activeTab === 'windows' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">
                Windows Printer Driver Setup (Zebra, Rollo, MUNBYN)
              </h4>
              <p>
                Thermal printers store their label stock dimensions in the Windows printer preferences:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-slate-700">
                <li>Open Windows <strong>Settings &gt; Bluetooth & Devices &gt; Printers & Scanners</strong>.</li>
                <li>Click your thermal printer &gt; <strong>Printing preferences</strong>.</li>
                <li>Look for <strong>Page Setup</strong> or <strong>Stock / Media</strong>.</li>
                <li>Set or add a new stock: <strong>Width: 4.00" (101.6mm)</strong> and <strong>Height: 2.00" (50.8mm)</strong>.</li>
                <li>Under <strong>Orientation</strong>, select <strong>Landscape</strong> (or if it feeds lengthwise, select Portrait).</li>
                <li>Click <strong>Apply</strong> and <strong>OK</strong>.</li>
              </ol>
            </div>
          )}

          {activeTab === 'mac' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">
                macOS Print Dialog Settings
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-slate-700">
                <li>In the Print dialog, click <strong>Paper Size</strong> dropdown.</li>
                <li>If 4" × 2" is not listed, scroll down to <strong>Manage Custom Sizes...</strong></li>
                <li>Click <strong>+</strong>, name it <strong>4x2 Label</strong>, and enter <strong>Width: 4 in</strong> and <strong>Height: 2 in</strong> with <strong>0 in margins</strong>.</li>
                <li>Select this newly created 4x2 Label size and click Print!</li>
              </ol>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 font-mono">
            Active: <span className="font-bold text-slate-800">{printOrientation === 'normal' ? 'Normal 4"×2"' : printOrientation === 'rotate90' ? 'Rotated 90°' : printOrientation}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Got It, Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
