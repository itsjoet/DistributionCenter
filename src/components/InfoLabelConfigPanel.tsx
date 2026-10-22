import React, { useRef } from 'react';
import { Calendar, User, FileText, Image as ImageIcon, Sparkles, Upload, Plus, Trash2, Copy } from 'lucide-react';
import { InfoConfig, InfoItem } from '../types/label';
import { getTodayFormatted } from '../utils/dateHelper';

interface InfoLabelConfigPanelProps {
  config: InfoConfig;
  onChange: React.Dispatch<React.SetStateAction<InfoConfig>>;
}

export const InfoLabelConfigPanel: React.FC<InfoLabelConfigPanelProps> = ({
  config,
  onChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set today's date
  const handleSetToday = () => {
    const today = getTodayFormatted('ISO');
    onChange((prev) => ({
      ...prev,
      imageDate: today,
    }));
  };

  // Handle image upload for thumbnail
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Auto-populate Image Name if blank or untitled
      const nameWithoutExt = file.name;
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        onChange((prev) => ({
          ...prev,
          imageName: prev.imageName && prev.imageName !== 'Sample_Capture_001.raw' ? prev.imageName : nameWithoutExt,
          thumbnailDataUrl: result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Batch item additions
  const handleAddBatchItem = () => {
    const newItem: InfoItem = {
      id: `item-${Date.now()}`,
      imageName: `IMG_${String(config.batchItems.length + 1).padStart(4, '0')}.jpg`,
      imageDate: config.imageDate || getTodayFormatted('ISO'),
      userName: config.userName || '',
    };
    onChange((prev) => ({
      ...prev,
      batchItems: [...prev.batchItems, newItem],
    }));
  };

  const handleRemoveBatchItem = (id: string) => {
    onChange((prev) => ({
      ...prev,
      batchItems: prev.batchItems.filter((item) => item.id !== id),
    }));
  };

  const handleUpdateBatchItem = (id: string, updates: Partial<InfoItem>) => {
    onChange((prev) => ({
      ...prev,
      batchItems: prev.batchItems.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    }));
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-slate-800" />
          <h2 className="text-base font-bold text-slate-900">
            Information Label Configuration
          </h2>
        </div>

        <div className="flex items-center gap-1.5 p-0.5 bg-slate-100 rounded-md">
          <button
            type="button"
            onClick={() => onChange((prev) => ({ ...prev, isBatchMode: false }))}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              !config.isBatchMode ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Single Label
          </button>
          <button
            type="button"
            onClick={() => {
              onChange((prev) => {
                if (prev.batchItems.length === 0) {
                  return {
                    ...prev,
                    isBatchMode: true,
                    batchItems: [
                      {
                        id: '1',
                        imageName: prev.imageName || 'DSC_9201_Inspection.raw',
                        imageDate: prev.imageDate || getTodayFormatted('ISO'),
                        userName: prev.userName || '',
                      },
                      {
                        id: '2',
                        imageName: 'DSC_9202_Inspection.raw',
                        imageDate: prev.imageDate || getTodayFormatted('ISO'),
                        userName: prev.userName || '',
                      },
                    ],
                  };
                }
                return { ...prev, isBatchMode: true };
              });
            }}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              config.isBatchMode ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Batch Images ({config.batchItems.length || 2})
          </button>
        </div>
      </div>

      {!config.isBatchMode ? (
        /* Single Information Label Form */
        <div className="space-y-4">
          {/* Optional Organization Header */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Organization / Project Header (Optional)
            </label>
            <input
              type="text"
              value={config.companyName}
              onChange={(e) => onChange((prev) => ({ ...prev, companyName: e.target.value }))}
              placeholder="e.g. DIGITAL ARCHIVE SYSTEM or QA LAB"
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-800 uppercase focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
            />
          </div>

          {/* 1. Image Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-slate-600" />
                <span>Image Name</span>
              </span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] font-medium text-slate-600 hover:text-slate-900 underline flex items-center gap-1 cursor-pointer"
              >
                <Upload className="w-3 h-3" />
                <span>Load from photo file</span>
              </button>
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <input
              type="text"
              value={config.imageName}
              onChange={(e) => onChange((prev) => ({ ...prev, imageName: e.target.value }))}
              placeholder="e.g. DSC_4901_HighRes.raw or Site_Survey_North.jpg"
              className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
            />
          </div>

          {/* 2. Image Date (with Today button!) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-600" />
                <span>Image Date</span>
              </label>

              {/* The required "Today" selection button */}
              <button
                type="button"
                onClick={handleSetToday}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Select "Today"</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="date"
                value={config.imageDate}
                onChange={(e) => onChange((prev) => ({ ...prev, imageDate: e.target.value }))}
                className="w-full text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
              <div className="flex items-center text-xs text-slate-500 bg-slate-100/70 px-3 py-2 rounded-lg">
                <span>Display format: </span>
                <strong className="text-slate-800 ml-1.5 font-mono">{config.imageDate || 'Select Date'}</strong>
              </div>
            </div>
          </div>

          {/* 3. User's Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-600" />
              <span>User's Name</span>
            </label>
            <input
              type="text"
              value={config.userName}
              onChange={(e) => onChange((prev) => ({ ...prev, userName: e.target.value }))}
              placeholder="e.g. Operator Name, Jane Doe, or Reviewer #1"
              className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
            />
          </div>

          {/* Print Copies Count */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Print Copies Count
            </label>
            <input
              type="number"
              min={1}
              max={2000}
              value={config.copiesCount}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  copiesCount: Math.max(1, Math.min(2000, parseInt(e.target.value, 10) || 1)),
                }))
              }
              className="w-full sm:w-1/2 text-sm bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-800 font-mono font-bold"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Quantity of identical labels to generate and export.
            </p>
          </div>
        </div>
      ) : (
        /* Batch Information Labels List */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Each row generates an individual 4" × 2" information label.
            </span>
            <button
              type="button"
              onClick={handleAddBatchItem}
              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Image Row</span>
            </button>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {config.batchItems.map((item, index) => (
              <div
                key={item.id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 relative"
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Label #{index + 1}</span>
                  {config.batchItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveBatchItem(item.id)}
                      className="text-red-500 hover:text-red-700 p-1 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                      Image Name
                    </label>
                    <input
                      type="text"
                      value={item.imageName}
                      onChange={(e) => handleUpdateBatchItem(item.id, { imageName: e.target.value })}
                      placeholder="Image Name"
                      className="w-full text-xs bg-white border border-slate-200 rounded-md px-2.5 py-1.5 font-semibold text-slate-800"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="block text-[11px] font-medium text-slate-600">
                        Date
                      </label>
                      <button
                        type="button"
                        onClick={() => handleUpdateBatchItem(item.id, { imageDate: getTodayFormatted('ISO') })}
                        className="text-[10px] text-slate-600 hover:text-slate-900 font-semibold underline"
                      >
                        Today
                      </button>
                    </div>
                    <input
                      type="date"
                      value={item.imageDate}
                      onChange={(e) => handleUpdateBatchItem(item.id, { imageDate: e.target.value })}
                      className="w-full text-xs font-mono bg-white border border-slate-200 rounded-md px-2 py-1.5 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                      User Name
                    </label>
                    <input
                      type="text"
                      value={item.userName}
                      onChange={(e) => handleUpdateBatchItem(item.id, { userName: e.target.value })}
                      placeholder="User Name"
                      className="w-full text-xs bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-800 font-medium"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
