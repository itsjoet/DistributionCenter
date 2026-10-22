import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ZoomIn, ZoomOut, Maximize2, LayoutGrid, Eye, Check } from 'lucide-react';
import { RenderedLabelItem, LabelMode, SerializedConfig, InfoConfig } from '../types/label';
import { generateBarcodeDataUrl } from '../utils/barcodeHelper';

interface LabelPreviewProps {
  mode: LabelMode;
  items: RenderedLabelItem[];
  currentIndex: number;
  onSelectIndex: (index: number) => void;
  serializedConfig: SerializedConfig;
  infoConfig: InfoConfig;
}

export const LabelPreview: React.FC<LabelPreviewProps> = ({
  mode,
  items,
  currentIndex,
  onSelectIndex,
  serializedConfig,
  infoConfig,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [showRuler, setShowRuler] = useState<boolean>(true);
  const [isGridView, setIsGridView] = useState<boolean>(false);

  const currentItem = items[currentIndex] || items[0];

  // Generate current barcode image
  const barcodeUrl = useMemo(() => {
    if (!currentItem) return '';
    if (mode === 'serialized') {
      return generateBarcodeDataUrl(
        currentItem.barcodeData || currentItem.primaryCode || '0000000001',
        serializedConfig.barcodeFormat,
        {
          height: Math.round(serializedConfig.barcodeHeight * 1.5),
          width: 2,
          displayValue: serializedConfig.showBarcodeHumanReadable,
          fontSize: 12,
        }
      );
    } else {
      if (!infoConfig.includeBarcode) return '';
      return generateBarcodeDataUrl(currentItem.barcodeData || 'INFO-LABEL', 'CODE128', {
        height: 35,
        width: 1.5,
        displayValue: false,
      });
    }
  }, [currentItem, mode, serializedConfig, infoConfig.includeBarcode]);

  if (!currentItem) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
        No label to display.
      </div>
    );
  }

  // Active font and border styles
  const activeFont = mode === 'serialized' ? serializedConfig.fontFamily : infoConfig.fontFamily;
  const activeBorder = mode === 'serialized' ? serializedConfig.borderStyle : infoConfig.borderStyle;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Preview Top Toolbar */}
      <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-slate-700" />
            <span>Interactive 4" × 2" Label Preview</span>
          </span>
          <span className="text-xs text-slate-400">·</span>
          <span className="text-xs font-mono text-slate-600 bg-slate-200/60 px-2 py-0.5 rounded">
            288pt × 144pt (2:1)
          </span>
        </div>

        {/* Zoom & View Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5">
            <button
              onClick={() => setZoomLevel((prev) => Math.max(60, prev - 15))}
              className="p-1 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-100 transition-colors"
              title="Zoom out"
              type="button"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-2 text-slate-600 min-w-[40px] text-center">
              {zoomLevel}%
            </span>
            <button
              onClick={() => setZoomLevel((prev) => Math.min(160, prev + 15))}
              className="p-1 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-100 transition-colors"
              title="Zoom in"
              type="button"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setShowRuler(!showRuler)}
            type="button"
            className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
              showRuler
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Ruler
          </button>

          <button
            onClick={() => setIsGridView(!isGridView)}
            type="button"
            className={`px-2.5 py-1 text-xs rounded-lg border transition-colors flex items-center gap-1 ${
              isGridView
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Grid ({items.length})</span>
          </button>
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="p-6 md:p-10 bg-slate-100/70 flex flex-col items-center justify-center min-h-[380px] overflow-auto relative">
        {/* Physical 4" x 2" label mockup */}
        <div
          className="relative transition-all duration-150"
          style={{
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: 'center center',
          }}
        >
          {/* Dimensional Ruler markings */}
          {showRuler && (
            <>
              {/* Top Width Ruler: 4 Inches */}
              <div className="absolute -top-6 left-0 right-0 flex items-center justify-between text-[10px] font-mono text-slate-500 border-b border-slate-300 pb-1">
                <span>0"</span>
                <span>1"</span>
                <span className="font-semibold text-slate-700">4.0" (101.6 mm)</span>
                <span>3"</span>
                <span>4"</span>
              </div>
              {/* Left Height Ruler: 2 Inches */}
              <div className="absolute -left-7 top-0 bottom-0 flex flex-col justify-between text-[10px] font-mono text-slate-500 border-r border-slate-300 pr-1 text-right">
                <span>0"</span>
                <span className="font-semibold text-slate-700">2.0"</span>
                <span>2"</span>
              </div>
            </>
          )}

          {/* Label Card (Standard 4" x 2" aspect ratio, calibrated to 480px x 240px for screen) */}
          <div
            id="printable-label-single"
            className={`w-[480px] h-[240px] bg-white rounded-sm shadow-md p-6 flex flex-col justify-between relative select-none ${
              activeBorder === 'solid_border'
                ? 'border-2 border-slate-800'
                : activeBorder === 'subtle_guide'
                ? 'border-2 border-dashed border-slate-300'
                : 'border border-slate-200'
            }`}
            style={{ fontFamily: activeFont }}
          >
            {mode === 'serialized' ? (
              /* Serialized Label Layout (Follows the user's reference image) */
              <div className="w-full h-full flex flex-col justify-between items-center text-center">
                {/* 1. COMPANY TITLE (Top center) */}
                <div className="w-full pt-1">
                  <h1
                    className="font-bold tracking-tight text-slate-900 uppercase truncate"
                    style={{ fontSize: `${serializedConfig.titleSize * 1.3}px` }}
                  >
                    {serializedConfig.companyTitle || 'COMPANY TITLE'}
                  </h1>
                  {serializedConfig.subtitle && (
                    <p
                      className="text-slate-500 font-medium tracking-normal mt-0.5 truncate"
                      style={{ fontSize: `${serializedConfig.subtitleSize * 1.3}px` }}
                    >
                      {serializedConfig.subtitle}
                    </p>
                  )}
                </div>

                {/* 2. ########## (Middle serial number) */}
                <div className="w-full my-auto py-1">
                  <span
                    className="font-bold text-slate-950 font-mono tracking-widest block truncate select-all"
                    style={{
                      fontSize: `${serializedConfig.serialSize * 1.3}px`,
                      letterSpacing: `${serializedConfig.letterSpacing || 2}px`,
                    }}
                  >
                    {currentItem.primaryCode}
                  </span>
                </div>

                {/* 3. Barcode (Bottom center) */}
                <div className="w-full flex flex-col items-center justify-end pb-1">
                  {barcodeUrl ? (
                    <img
                      src={barcodeUrl}
                      alt={`Barcode for ${currentItem.primaryCode}`}
                      className="max-h-[75px] max-w-[85%] object-contain"
                    />
                  ) : (
                    <div className="h-12 border border-dashed border-slate-300 flex items-center justify-center w-3/4 text-xs text-slate-400">
                      Barcode will render here
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Information Label Layout */
              <div className="w-full h-full flex flex-col justify-between text-left">
                {/* Header line */}
                <div>
                  {infoConfig.companyName && (
                    <div
                      className="text-slate-500 font-bold uppercase tracking-wider mb-1 truncate"
                      style={{ fontSize: `${infoConfig.titleSize * 1.1}px` }}
                    >
                      {infoConfig.companyName}
                    </div>
                  )}

                  {/* Image Name Field */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div
                        className="font-bold text-slate-400 uppercase tracking-wider"
                        style={{ fontSize: `${infoConfig.fieldLabelSize * 1.2}px` }}
                      >
                        Image Name
                      </div>
                      <div
                        className="font-extrabold text-slate-900 truncate leading-tight mt-0.5"
                        style={{ fontSize: `${infoConfig.imageNameSize * 1.25}px` }}
                        title={currentItem.primaryCode}
                      >
                        {currentItem.primaryCode || 'Untitled_Image.jpg'}
                      </div>
                    </div>

                    {/* Optional thumbnail image if attached */}
                    {currentItem.thumbnailUrl && (
                      <img
                        src={currentItem.thumbnailUrl}
                        alt="Thumbnail"
                        className="w-14 h-14 object-cover rounded border border-slate-300 shrink-0"
                      />
                    )}
                  </div>
                </div>

                {/* Subtle hairline separator */}
                <div className="w-full border-t border-slate-200 my-1" />

                {/* Metadata Fields: Image Date & User's Name */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Image Date */}
                  <div>
                    <div
                      className="font-bold text-slate-400 uppercase tracking-wider"
                      style={{ fontSize: `${infoConfig.fieldLabelSize * 1.2}px` }}
                    >
                      Image Date
                    </div>
                    <div
                      className="font-bold text-slate-800 tabular-nums truncate mt-0.5"
                      style={{ fontSize: `${infoConfig.fieldValueSize * 1.2}px` }}
                    >
                      {currentItem.metaFields?.find((f) => f.label.toLowerCase().includes('date'))?.value ||
                        infoConfig.imageDate}
                    </div>
                  </div>

                  {/* User's Name */}
                  <div>
                    <div
                      className="font-bold text-slate-400 uppercase tracking-wider"
                      style={{ fontSize: `${infoConfig.fieldLabelSize * 1.2}px` }}
                    >
                      User's Name
                    </div>
                    <div
                      className="font-bold text-slate-800 truncate mt-0.5"
                      style={{ fontSize: `${infoConfig.fieldValueSize * 1.2}px` }}
                    >
                      {currentItem.metaFields?.find((f) => f.label.toLowerCase().includes('user'))?.value ||
                        infoConfig.userName ||
                        'Unassigned'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Batch Navigation & Pagination Bar */}
      {items.length > 1 && (
        <div className="px-6 py-3 border-t border-slate-200 bg-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onSelectIndex(0)}
              disabled={currentIndex === 0}
              className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="First label"
              type="button"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onSelectIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Previous label"
              type="button"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-medium text-slate-700 px-3 py-1 bg-slate-100 rounded-md tabular-nums">
              Label <strong className="text-slate-900">{currentIndex + 1}</strong> of{' '}
              <strong className="text-slate-900">{items.length}</strong>
            </span>

            <button
              onClick={() => onSelectIndex(Math.min(items.length - 1, currentIndex + 1))}
              disabled={currentIndex === items.length - 1}
              className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Next label"
              type="button"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onSelectIndex(items.length - 1)}
              disabled={currentIndex === items.length - 1}
              className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Last label"
              type="button"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Slider Scrubber */}
          <div className="hidden sm:flex items-center gap-2 flex-1 max-w-xs">
            <input
              type="range"
              min={0}
              max={items.length - 1}
              value={currentIndex}
              onChange={(e) => onSelectIndex(parseInt(e.target.value, 10))}
              className="w-full accent-slate-900 cursor-pointer"
            />
          </div>

          <div className="text-xs text-slate-500 font-mono">
            ID: <span className="text-slate-800 font-semibold">{currentItem.primaryCode}</span>
          </div>
        </div>
      )}

      {/* Grid Drawer for multi-label inspect */}
      {isGridView && (
        <div className="p-6 border-t border-slate-200 bg-slate-50 max-h-[300px] overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Batch Preview ({items.length} Labels)
            </h4>
            <span className="text-xs text-slate-500">Click any card to select for detailed preview</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {items.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => {
                  onSelectIndex(idx);
                }}
                type="button"
                className={`p-2.5 rounded-lg border text-left transition-all bg-white relative cursor-pointer ${
                  idx === currentIndex
                    ? 'border-slate-900 ring-2 ring-slate-900/10 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                  <span>#{idx + 1}</span>
                  {idx === currentIndex && <Check className="w-3 h-3 text-slate-900" />}
                </div>
                <div className="text-xs font-mono font-bold text-slate-900 truncate">
                  {item.primaryCode}
                </div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">
                  {mode === 'serialized' ? item.topTitle : item.metaFields?.[0]?.value || item.topTitle}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
