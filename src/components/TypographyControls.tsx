import React from 'react';
import { Type, Sliders, Square, Minus } from 'lucide-react';
import { LabelMode, SerializedConfig, InfoConfig, TextSizePreset, LabelBorderStyle } from '../types/label';

interface TypographyControlsProps {
  mode: LabelMode;
  serializedConfig: SerializedConfig;
  setSerializedConfig: React.Dispatch<React.SetStateAction<SerializedConfig>>;
  infoConfig: InfoConfig;
  setInfoConfig: React.Dispatch<React.SetStateAction<InfoConfig>>;
}

export const TypographyControls: React.FC<TypographyControlsProps> = ({
  mode,
  serializedConfig,
  setSerializedConfig,
  infoConfig,
  setInfoConfig,
}) => {
  // Handle preset selection
  const handlePresetSelect = (preset: TextSizePreset) => {
    if (mode === 'serialized') {
      let titleSize = 14;
      let serialSize = 30; // Bigger by default
      let subtitleSize = 9;
      let barcodeHeight = 42;

      switch (preset) {
        case 'compact':
          titleSize = 11;
          serialSize = 22;
          subtitleSize = 8;
          barcodeHeight = 35;
          break;
        case 'balanced':
          titleSize = 14;
          serialSize = 30;
          subtitleSize = 9;
          barcodeHeight = 42;
          break;
        case 'large':
          titleSize = 16;
          serialSize = 38;
          subtitleSize = 10;
          barcodeHeight = 46;
          break;
        case 'xlarge':
          titleSize = 18;
          serialSize = 46;
          subtitleSize = 11;
          barcodeHeight = 50;
          break;
        default:
          break;
      }

      setSerializedConfig((prev) => ({
        ...prev,
        preset,
        titleSize,
        serialSize,
        subtitleSize,
        barcodeHeight,
      }));
    } else {
      let titleSize = 11;
      let imageNameSize = 16;
      let fieldLabelSize = 9;
      let fieldValueSize = 12;

      switch (preset) {
        case 'compact':
          titleSize = 9;
          imageNameSize = 13;
          fieldLabelSize = 8;
          fieldValueSize = 10;
          break;
        case 'balanced':
          titleSize = 11;
          imageNameSize = 16;
          fieldLabelSize = 9;
          fieldValueSize = 12;
          break;
        case 'large':
          titleSize = 13;
          imageNameSize = 20;
          fieldLabelSize = 10;
          fieldValueSize = 14;
          break;
        case 'xlarge':
          titleSize = 15;
          imageNameSize = 24;
          fieldLabelSize = 12;
          fieldValueSize = 17;
          break;
        default:
          break;
      }

      setInfoConfig((prev) => ({
        ...prev,
        preset,
        titleSize,
        imageNameSize,
        fieldLabelSize,
        fieldValueSize,
      }));
    }
  };

  const currentPreset = mode === 'serialized' ? serializedConfig.preset : infoConfig.preset;
  const currentFont = mode === 'serialized' ? serializedConfig.fontFamily : infoConfig.fontFamily;
  const currentBorder = mode === 'serialized' ? serializedConfig.borderStyle : infoConfig.borderStyle;

  const fontOptions = [
    { label: 'Modern Sans (Plus Jakarta)', value: 'Plus Jakarta Sans, sans-serif' },
    { label: 'Technical Mono (JetBrains)', value: 'JetBrains Mono, monospace' },
    { label: 'Editorial Serif (Playfair)', value: 'Playfair Display, Georgia, serif' },
    { label: 'Standard Clean (System)', value: 'system-ui, -apple-system, sans-serif' },
  ];

  return (
    <div id="typography" className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-slate-800" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Text Size & Typography Controls
          </h3>
        </div>
        <span className="text-xs text-slate-400">Exact physical point sizes (pt)</span>
      </div>

      {/* Preset selector buttons */}
      <div className="mb-5">
        <label className="block text-xs font-semibold text-slate-600 mb-2">
          Quick Text Size Presets
        </label>
        <div className="grid grid-cols-5 gap-1.5 p-1 bg-slate-100 rounded-lg">
          {(['compact', 'balanced', 'large', 'xlarge', 'custom'] as TextSizePreset[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => handlePresetSelect(p)}
              className={`py-1.5 px-2 text-xs font-medium rounded-md capitalize transition-colors ${
                currentPreset === p
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {p === 'xlarge' ? 'XL' : p}
            </button>
          ))}
        </div>
      </div>

      {/* Granular Sliders */}
      <div className="space-y-4 pt-1">
        {mode === 'serialized' ? (
          <>
            {/* Company Title Size */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-medium text-slate-700">Company Title Font Size</span>
                <span className="font-mono text-slate-500 font-semibold">{serializedConfig.titleSize} pt</span>
              </div>
              <input
                type="range"
                min={8}
                max={26}
                step={1}
                value={serializedConfig.titleSize}
                onChange={(e) =>
                  setSerializedConfig((prev) => ({
                    ...prev,
                    preset: 'custom',
                    titleSize: parseInt(e.target.value, 10),
                  }))
                }
                className="w-full accent-slate-900 cursor-pointer"
              />
            </div>

            {/* Serial Number Size */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-bold text-slate-800">Asset # / Serial Code Font Size (Middle)</span>
                <span className="font-mono text-slate-900 font-bold bg-slate-100 px-2 py-0.5 rounded">{serializedConfig.serialSize} pt</span>
              </div>
              <input
                type="range"
                min={16}
                max={56}
                step={1}
                value={serializedConfig.serialSize}
                onChange={(e) =>
                  setSerializedConfig((prev) => ({
                    ...prev,
                    preset: 'custom',
                    serialSize: parseInt(e.target.value, 10),
                  }))
                }
                className="w-full accent-slate-900 cursor-pointer"
              />
            </div>

            {/* Subtitle / Note Size */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-medium text-slate-700">Subtitle / Meta Font Size</span>
                <span className="font-mono text-slate-500 font-semibold">{serializedConfig.subtitleSize} pt</span>
              </div>
              <input
                type="range"
                min={7}
                max={16}
                step={1}
                value={serializedConfig.subtitleSize}
                onChange={(e) =>
                  setSerializedConfig((prev) => ({
                    ...prev,
                    preset: 'custom',
                    subtitleSize: parseInt(e.target.value, 10),
                  }))
                }
                className="w-full accent-slate-900 cursor-pointer"
              />
            </div>

            {/* Barcode Height */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-medium text-slate-700">Barcode Vertical Height</span>
                <span className="font-mono text-slate-500 font-semibold">{serializedConfig.barcodeHeight} pt</span>
              </div>
              <input
                type="range"
                min={25}
                max={65}
                step={1}
                value={serializedConfig.barcodeHeight}
                onChange={(e) =>
                  setSerializedConfig((prev) => ({
                    ...prev,
                    barcodeHeight: parseInt(e.target.value, 10),
                  }))
                }
                className="w-full accent-slate-900 cursor-pointer"
              />
            </div>

            {/* Serial Character Spacing */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-medium text-slate-700">Serial Code Letter Spacing</span>
                <span className="font-mono text-slate-500 font-semibold">{serializedConfig.letterSpacing || 2} px</span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={serializedConfig.letterSpacing || 2}
                onChange={(e) =>
                  setSerializedConfig((prev) => ({
                    ...prev,
                    letterSpacing: parseInt(e.target.value, 10),
                  }))
                }
                className="w-full accent-slate-900 cursor-pointer"
              />
            </div>
          </>
        ) : (
          <>
            {/* Image Name Size */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-medium text-slate-700">Image Name Size</span>
                <span className="font-mono text-slate-500 font-semibold">{infoConfig.imageNameSize} pt</span>
              </div>
              <input
                type="range"
                min={11}
                max={26}
                step={1}
                value={infoConfig.imageNameSize}
                onChange={(e) =>
                  setInfoConfig((prev) => ({
                    ...prev,
                    preset: 'custom',
                    imageNameSize: parseInt(e.target.value, 10),
                  }))
                }
                className="w-full accent-slate-900 cursor-pointer"
              />
            </div>

            {/* Field Value Size (Date & User) */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-medium text-slate-700">Date & User Name Size</span>
                <span className="font-mono text-slate-500 font-semibold">{infoConfig.fieldValueSize} pt</span>
              </div>
              <input
                type="range"
                min={9}
                max={20}
                step={1}
                value={infoConfig.fieldValueSize}
                onChange={(e) =>
                  setInfoConfig((prev) => ({
                    ...prev,
                    preset: 'custom',
                    fieldValueSize: parseInt(e.target.value, 10),
                  }))
                }
                className="w-full accent-slate-900 cursor-pointer"
              />
            </div>

            {/* Field Label Size */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-medium text-slate-700">Field Header Label Size</span>
                <span className="font-mono text-slate-500 font-semibold">{infoConfig.fieldLabelSize} pt</span>
              </div>
              <input
                type="range"
                min={7}
                max={14}
                step={1}
                value={infoConfig.fieldLabelSize}
                onChange={(e) =>
                  setInfoConfig((prev) => ({
                    ...prev,
                    preset: 'custom',
                    fieldLabelSize: parseInt(e.target.value, 10),
                  }))
                }
                className="w-full accent-slate-900 cursor-pointer"
              />
            </div>
          </>
        )}

        {/* Font Family Selection */}
        <div className="pt-2">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Font Family
          </label>
          <select
            value={currentFont}
            onChange={(e) => {
              const val = e.target.value;
              if (mode === 'serialized') {
                setSerializedConfig((prev) => ({ ...prev, fontFamily: val }));
              } else {
                setInfoConfig((prev) => ({ ...prev, fontFamily: val }));
              }
            }}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-slate-900 focus:outline-none"
          >
            {fontOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Border / Cut Guide */}
        <div className="pt-2">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Border & Cut Guide
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'none', label: 'No Border', desc: 'Flush edge' },
              { id: 'subtle_guide', label: 'Dashed Guide', desc: 'Cutting line' },
              { id: 'solid_border', label: 'Solid Border', desc: 'Framed box' },
            ].map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => {
                  if (mode === 'serialized') {
                    setSerializedConfig((prev) => ({ ...prev, borderStyle: b.id as LabelBorderStyle }));
                  } else {
                    setInfoConfig((prev) => ({ ...prev, borderStyle: b.id as LabelBorderStyle }));
                  }
                }}
                className={`p-2 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
                  currentBorder === b.id
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="font-semibold">{b.label}</div>
                <div className={`text-[10px] ${currentBorder === b.id ? 'text-slate-300' : 'text-slate-400'}`}>
                  {b.desc}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
