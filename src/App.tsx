/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { SerializedConfigPanel } from './components/SerializedConfigPanel';
import { InfoLabelConfigPanel } from './components/InfoLabelConfigPanel';
import { TypographyControls } from './components/TypographyControls';
import { LabelPreview } from './components/LabelPreview';
import { ExportToolbar } from './components/ExportToolbar';
import { PrintContainer } from './components/PrintContainer';
import { SavedConfigsModal } from './components/SavedConfigsModal';
import {
  LabelMode,
  ExportFormat,
  SerializedConfig,
  InfoConfig,
  RenderedLabelItem,
} from './types/label';
import { SavedProfile } from './types/storage';
import { generateLabelsPdf } from './utils/pdfGenerator';
import { getTodayFormatted } from './utils/dateHelper';
import {
  getSavedProfiles,
  saveLastActiveConfig,
  loadLastActiveConfig,
} from './utils/storageHelper';
import { Barcode, FileText, CheckCircle2, Info, Bookmark } from 'lucide-react';

export default function App() {
  // Try loading last active session from browser storage
  const lastActive = useMemo(() => loadLastActiveConfig(), []);

  // Mode: Default to Information Label as requested
  const [mode, setMode] = useState<LabelMode>(lastActive?.mode || 'information');

  // Export format: Single roll (4"x2") vs Avery 5163 sheet (10 labels per 8.5"x11" page)
  const [exportFormat, setExportFormat] = useState<ExportFormat>(
    lastActive?.exportFormat || 'single_roll'
  );

  // Currently viewed label index in preview
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Saved configs modal open state
  const [isSavedModalOpen, setIsSavedModalOpen] = useState<boolean>(false);
  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>(() => getSavedProfiles());

  // Serialized configuration state (Matches the user's uploaded reference image format by default)
  const [serializedConfig, setSerializedConfig] = useState<SerializedConfig>(
    lastActive?.serializedConfig || {
      companyTitle: 'COMPANY TITLE',
      subtitle: '',
      startNumber: 1,
      endNumber: 10,
      prefix: '',
      suffix: '',
      step: 1,
      barcodeFormat: 'CODE128',
      showBarcodeHumanReadable: false,
      borderStyle: 'none',

      // Typography: bigger Asset # by default (30pt)
      preset: 'balanced',
      titleSize: 15,
      serialSize: 30,
      subtitleSize: 9,
      barcodeHeight: 42,
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      textAlign: 'center',
      letterSpacing: 2,
    }
  );

  // Custom list of serial numbers (if user wants to paste specific list)
  const [customSerialList, setCustomSerialList] = useState<string>(
    lastActive?.customSerialList || ''
  );
  const [isCustomListMode, setIsCustomListMode] = useState<boolean>(false);

  // Information label configuration state (Clean defaults with NO hardcoded user names)
  const [infoConfig, setInfoConfig] = useState<InfoConfig>(
    lastActive?.infoConfig || {
      companyName: '',
      imageName: 'Field_Specimen_North_01.raw',
      imageDate: getTodayFormatted('ISO'),
      userName: '',
      notes: '',
      thumbnailDataUrl: null,
      copiesCount: 5,

      isBatchMode: false,
      batchItems: [
        {
          id: '1',
          imageName: 'Field_Specimen_North_01.raw',
          imageDate: getTodayFormatted('ISO'),
          userName: '',
        },
        {
          id: '2',
          imageName: 'Field_Specimen_North_02.raw',
          imageDate: getTodayFormatted('ISO'),
          userName: '',
        },
        {
          id: '3',
          imageName: 'Field_Specimen_North_03.raw',
          imageDate: getTodayFormatted('ISO'),
          userName: '',
        },
      ],

      layoutStyle: 'clean_card',
      borderStyle: 'none',
      includeBarcode: false,

      // Typography
      preset: 'balanced',
      titleSize: 11,
      imageNameSize: 16,
      fieldLabelSize: 9,
      fieldValueSize: 12,
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      textAlign: 'left',
    }
  );

  // Auto-save last active configuration to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      saveLastActiveConfig({
        mode,
        serializedConfig,
        infoConfig,
        customSerialList,
        exportFormat,
      });
    }, 600);
    return () => clearTimeout(timer);
  }, [mode, serializedConfig, infoConfig, customSerialList, exportFormat]);

  // Handle loading a saved profile
  const handleLoadProfile = (profile: SavedProfile) => {
    setMode(profile.mode);
    setSerializedConfig(profile.serializedConfig);
    setInfoConfig(profile.infoConfig);
    if (profile.customSerialList !== undefined) {
      setCustomSerialList(profile.customSerialList);
    }
    if (profile.exportFormat) {
      setExportFormat(profile.exportFormat);
    }
    setCurrentIndex(0);
    setToastMessage(`Loaded configuration: "${profile.name}"`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Generate the list of rendered label items based on active mode
  const renderedItems = useMemo<RenderedLabelItem[]>(() => {
    if (mode === 'serialized') {
      if (isCustomListMode && customSerialList.trim().length > 0) {
        const lines = customSerialList
          .split('\n')
          .map((l) => l.trim())
          .filter((l) => l.length > 0)
          .slice(0, 2000);
        return lines.map((line, idx) => ({
          id: `custom-${idx}`,
          index: idx,
          mode: 'serialized',
          topTitle: serializedConfig.companyTitle,
          primaryCode: line,
          barcodeData: line,
          showBarcode: true,
        }));
      }

      // Sequential generation from startNumber to endNumber (capped at 2000)
      const items: RenderedLabelItem[] = [];
      const MAX_LABELS = 2000;

      const rawStart = Number(serializedConfig.startNumber);
      const rawEnd = Number(serializedConfig.endNumber);
      const rawStep = Number(serializedConfig.step);

      const start = Number.isFinite(rawStart) ? rawStart : 1;
      const end = Number.isFinite(rawEnd) ? rawEnd : 1;
      const step = Number.isFinite(rawStep) && rawStep > 0 ? rawStep : 1;

      let idx = 0;
      if (start <= end) {
        for (let num = start; num <= end && idx < MAX_LABELS; num += step) {
          const code = `${serializedConfig.prefix || ''}${num}${serializedConfig.suffix || ''}`;
          items.push({
            id: `seq-${num}-${idx}`,
            index: idx++,
            mode: 'serialized',
            topTitle: serializedConfig.companyTitle,
            primaryCode: code,
            barcodeData: code,
            showBarcode: true,
          });
        }
      } else {
        // Descending order (e.g. from 10 down to 1 or 5 down to -5)
        for (let num = start; num >= end && idx < MAX_LABELS; num -= step) {
          const code = `${serializedConfig.prefix || ''}${num}${serializedConfig.suffix || ''}`;
          items.push({
            id: `seq-${num}-${idx}`,
            index: idx++,
            mode: 'serialized',
            topTitle: serializedConfig.companyTitle,
            primaryCode: code,
            barcodeData: code,
            showBarcode: true,
          });
        }
      }

      // Always guarantee at least 1 item
      if (items.length === 0) {
        const fallbackCode = `${serializedConfig.prefix || ''}${start}${serializedConfig.suffix || ''}`;
        items.push({
          id: `seq-fallback`,
          index: 0,
          mode: 'serialized',
          topTitle: serializedConfig.companyTitle,
          primaryCode: fallbackCode,
          barcodeData: fallbackCode,
          showBarcode: true,
        });
      }

      return items;
    } else {
      // Information Label Mode
      if (infoConfig.isBatchMode && infoConfig.batchItems.length > 0) {
        return infoConfig.batchItems.map((item, idx) => ({
          id: item.id || `info-batch-${idx}`,
          index: idx,
          mode: 'information',
          topTitle: infoConfig.companyName,
          primaryCode: item.imageName || 'Untitled_Image.jpg',
          barcodeData: item.imageName || 'INFO',
          showBarcode: false,
          metaFields: [
            { label: 'Image Date', value: item.imageDate || getTodayFormatted('ISO') },
            { label: "User's Name", value: item.userName || 'Unassigned' },
          ],
          thumbnailUrl: item.thumbnailDataUrl,
          notes: item.notes,
        }));
      }

      // Single item with multiple copies
      const count = Math.max(1, infoConfig.copiesCount || 1);
      const items: RenderedLabelItem[] = [];
      for (let i = 0; i < count; i++) {
        items.push({
          id: `info-single-${i}`,
          index: i,
          mode: 'information',
          topTitle: infoConfig.companyName,
          primaryCode: infoConfig.imageName || 'Untitled_Image.jpg',
          barcodeData: infoConfig.imageName || 'INFO',
          showBarcode: false,
          metaFields: [
            { label: 'Image Date', value: infoConfig.imageDate || getTodayFormatted('ISO') },
            { label: "User's Name", value: infoConfig.userName || 'Unassigned' },
          ],
          thumbnailUrl: infoConfig.thumbnailDataUrl || undefined,
          notes: infoConfig.notes,
        });
      }
      return items;
    }
  }, [mode, serializedConfig, customSerialList, isCustomListMode, infoConfig]);

  // Keep index within bounds
  const safeCurrentIndex = Math.min(currentIndex, Math.max(0, renderedItems.length - 1));

  // Trigger browser print
  const handleDirectPrint = () => {
    window.print();
  };

  // Trigger PDF export
  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      const pdfLabels = renderedItems.map((item) => ({
        id: item.id,
        topTitle: item.topTitle,
        primaryCode: item.primaryCode,
        barcodeData: item.barcodeData,
        showBarcode: item.showBarcode,
        subtitle: mode === 'serialized' ? serializedConfig.subtitle : undefined,
        mode: item.mode,
        fields: item.metaFields,
        thumbnailUrl: item.thumbnailUrl,
        notes: item.notes,
      }));

      const options = {
        format: exportFormat,
        borderStyle: mode === 'serialized' ? serializedConfig.borderStyle : infoConfig.borderStyle,
        fontFamily: mode === 'serialized' ? serializedConfig.fontFamily : infoConfig.fontFamily,
        titleSize: mode === 'serialized' ? serializedConfig.titleSize : infoConfig.titleSize,
        primarySize: mode === 'serialized' ? serializedConfig.serialSize : infoConfig.imageNameSize,
        subtitleSize: mode === 'serialized' ? serializedConfig.subtitleSize : infoConfig.fieldLabelSize,
        barcodeHeight: serializedConfig.barcodeHeight,
        showBarcodeHumanReadable: serializedConfig.showBarcodeHumanReadable,
      };

      const filename =
        mode === 'serialized'
          ? `4x2_serialized_labels_${serializedConfig.companyTitle.replace(/\s+/g, '_') || 'batch'}.pdf`
          : `4x2_information_labels_${infoConfig.imageName.replace(/\s+/g, '_') || 'batch'}.pdf`;

      await generateLabelsPdf(pdfLabels, exportFormat, options, 'download', filename);

      setToastMessage(`Successfully exported ${renderedItems.length} 4"×2" labels to ${filename}!`);
      setTimeout(() => setToastMessage(null), 4500);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('An error occurred generating the PDF. Please check your inputs and try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* Top Navigation Bar adhering to Top Bar Contract */}
      <Header
        onDownloadPdf={handleDownloadPdf}
        onDirectPrint={handleDirectPrint}
        onOpenSavedConfigs={() => setIsSavedModalOpen(true)}
        totalLabels={renderedItems.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-6">
        {/* Mode Selector Segmented Tabs & Save Config Shortcut */}
        <div id="editor" className="flex items-center justify-between flex-wrap gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setMode('information');
                setCurrentIndex(0);
              }}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                mode === 'information'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4 text-slate-800" />
              <span>Information Label (Image, Date & User)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('serialized');
                setCurrentIndex(0);
              }}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                mode === 'serialized'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Barcode className="w-4 h-4 text-slate-800" />
              <span>Serialized Barcode Label</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSavedModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <Bookmark className="w-3.5 h-3.5 text-slate-700" />
              <span>Save / Manage Presets</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
              <span>Size:</span>
              <span className="font-semibold text-slate-800 font-mono">4.0" × 2.0"</span>
            </div>
          </div>
        </div>

        {/* 2-Column Split: Controls on Left, Sticky Live Preview on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form & Typography Settings */}
          <div className="lg:col-span-6 space-y-6">
            {mode === 'serialized' ? (
              <SerializedConfigPanel
                config={serializedConfig}
                onChange={setSerializedConfig}
                customSerialList={customSerialList}
                setCustomSerialList={setCustomSerialList}
                isCustomListMode={isCustomListMode}
                setIsCustomListMode={setIsCustomListMode}
              />
            ) : (
              <InfoLabelConfigPanel
                config={infoConfig}
                onChange={setInfoConfig}
              />
            )}

            {/* Typography & Text Size Controls ("Select text size") */}
            <TypographyControls
              mode={mode}
              serializedConfig={serializedConfig}
              setSerializedConfig={setSerializedConfig}
              infoConfig={infoConfig}
              setInfoConfig={setInfoConfig}
            />

            {/* Print & Sheet Format Selector */}
            <ExportToolbar
              exportFormat={exportFormat}
              setExportFormat={setExportFormat}
              totalLabels={renderedItems.length}
              onDownloadPdf={handleDownloadPdf}
              onDirectPrint={handleDirectPrint}
              isGeneratingPdf={isGeneratingPdf}
            />
          </div>

          {/* Right Column: Sticky Live 4x2 Label Preview */}
          <div id="preview" className="lg:col-span-6 space-y-6 lg:sticky lg:top-24">
            <LabelPreview
              mode={mode}
              items={renderedItems}
              currentIndex={safeCurrentIndex}
              onSelectIndex={setCurrentIndex}
              serializedConfig={serializedConfig}
              infoConfig={infoConfig}
            />

            {/* Informational specs box */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs text-xs text-slate-600 space-y-3">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Info className="w-4 h-4 text-slate-700" />
                <span>Printing & PDF Compatibility</span>
              </div>
              <ul className="space-y-1.5 list-disc list-inside text-slate-600">
                <li>
                  <strong className="text-slate-800">Direct Thermal Printers:</strong> Select{' '}
                  <em>Direct 4" × 2" Roll</em> for Zebra, Rollo, MUNBYN, and DYMO 4x2 rolls.
                </li>
                <li>
                  <strong className="text-slate-800">Laser & Inkjet Printers:</strong> Select{' '}
                  <em>Avery® 5163 / 5963</em> for 10 labels per 8.5" × 11" sheet (2 cols × 5 rows).
                </li>
                <li>
                  <strong className="text-slate-800">Persistent Configurations:</strong> Click{' '}
                  <em>Saved Presets</em> to store custom font, layout, and serial profiles to browser storage.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Success Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2.5 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Saved Configurations Management Modal */}
      <SavedConfigsModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        currentMode={mode}
        currentSerializedConfig={serializedConfig}
        currentInfoConfig={infoConfig}
        currentCustomSerialList={customSerialList}
        currentExportFormat={exportFormat}
        onLoadProfile={handleLoadProfile}
        savedProfiles={savedProfiles}
        setSavedProfiles={setSavedProfiles}
        onNotify={(msg) => {
          setToastMessage(msg);
          setTimeout(() => setToastMessage(null), 4000);
        }}
      />

      {/* Native Browser Print Container */}
      <PrintContainer
        items={renderedItems}
        format={exportFormat}
        serializedConfig={serializedConfig}
        infoConfig={infoConfig}
      />
    </div>
  );
}
