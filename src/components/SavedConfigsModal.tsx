import React, { useState, useRef } from 'react';
import { X, Bookmark, BookmarkPlus, Download, Upload, Trash2, Check, ArrowRight, RotateCcw, Clock } from 'lucide-react';
import { SavedProfile } from '../types/storage';
import { LabelMode, SerializedConfig, InfoConfig, ExportFormat } from '../types/label';
import { saveProfile, deleteProfile, updateProfile, exportProfilesJson, importProfilesJson } from '../utils/storageHelper';

interface SavedConfigsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: LabelMode;
  currentSerializedConfig: SerializedConfig;
  currentInfoConfig: InfoConfig;
  currentCustomSerialList: string;
  currentExportFormat: ExportFormat;
  onLoadProfile: (profile: SavedProfile) => void;
  savedProfiles: SavedProfile[];
  setSavedProfiles: React.Dispatch<React.SetStateAction<SavedProfile[]>>;
  onNotify: (msg: string) => void;
}

export const SavedConfigsModal: React.FC<SavedConfigsModalProps> = ({
  isOpen,
  onClose,
  currentMode,
  currentSerializedConfig,
  currentInfoConfig,
  currentCustomSerialList,
  currentExportFormat,
  onLoadProfile,
  savedProfiles,
  setSavedProfiles,
  onNotify,
}) => {
  const [newConfigName, setNewConfigName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle saving new configuration
  const handleSaveCurrent = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newConfigName.trim() || `${currentMode === 'information' ? 'Info Label' : 'Barcode Label'} - ${new Date().toLocaleDateString()}`;

    const saved = saveProfile(name, {
      mode: currentMode,
      serializedConfig: currentSerializedConfig,
      infoConfig: currentInfoConfig,
      customSerialList: currentCustomSerialList,
      exportFormat: currentExportFormat,
    });

    setSavedProfiles((prev) => [saved, ...prev]);
    setNewConfigName('');
    onNotify(`Saved "${saved.name}" to browser storage!`);
  };

  // Handle overwriting an existing configuration
  const handleOverwrite = (profile: SavedProfile) => {
    if (window.confirm(`Overwrite "${profile.name}" with your current settings?`)) {
      const updated = updateProfile(profile.id, {
        mode: currentMode,
        serializedConfig: currentSerializedConfig,
        infoConfig: currentInfoConfig,
        customSerialList: currentCustomSerialList,
        exportFormat: currentExportFormat,
      });
      setSavedProfiles(updated);
      onNotify(`Updated "${profile.name}" with current settings.`);
    }
  };

  // Handle deleting configuration
  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete "${name}" from saved configurations?`)) {
      const updated = deleteProfile(id);
      setSavedProfiles(updated);
      onNotify(`Deleted "${name}".`);
    }
  };

  // Handle JSON export
  const handleExportJson = () => {
    const jsonStr = exportProfilesJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `label_configurations_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify('Configurations backup downloaded!');
  };

  // Handle JSON import
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const merged = importProfilesJson(content);
          setSavedProfiles(merged);
          onNotify(`Successfully imported configurations!`);
        } catch (err) {
          alert('Failed to import file. Please make sure it is a valid backup JSON.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-slate-800" />
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Saved Configurations & Presets
              </h2>
              <p className="text-xs text-slate-500">
                Save your typography, layout, dimensions, and label rules to browser storage
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Section 1: Save Current Configuration */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <BookmarkPlus className="w-4 h-4 text-slate-700" />
              <span>Save Current Configuration</span>
            </h3>

            <form onSubmit={handleSaveCurrent} className="flex items-center gap-2">
              <input
                type="text"
                value={newConfigName}
                onChange={(e) => setNewConfigName(e.target.value)}
                placeholder="e.g. Lab Specimen Standard, Asset Barcode Tag, or Photography Archive"
                className="flex-1 text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap cursor-pointer shadow-xs"
              >
                Save Settings
              </button>
            </form>
            <div className="text-[11px] text-slate-500 flex items-center gap-3">
              <span>Current Mode: <strong className="text-slate-800 capitalize">{currentMode}</strong></span>
              <span>·</span>
              <span>
                Typography:{' '}
                <strong className="text-slate-800">
                  {currentMode === 'serialized' ? `${currentSerializedConfig.serialSize}pt` : `${currentInfoConfig.imageNameSize}pt`}
                </strong>
              </span>
            </div>
          </div>

          {/* Section 2: Saved Configurations List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Saved Configurations ({savedProfiles.length})
              </h3>
              <span className="text-[11px] text-slate-400">Stored locally in your browser</span>
            </div>

            {savedProfiles.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                No saved configurations yet. Save your current settings above!
              </div>
            ) : (
              <div className="space-y-2.5">
                {savedProfiles.map((profile) => (
                  <div
                    key={profile.id}
                    className="p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {profile.name}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 capitalize shrink-0">
                          {profile.mode}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{new Date(profile.updatedAt || profile.createdAt).toLocaleDateString()}</span>
                        <span>·</span>
                        <span>
                          {profile.mode === 'serialized'
                            ? `Serial: ${profile.serializedConfig.serialSize}pt · Title: ${profile.serializedConfig.titleSize}pt`
                            : `Image: ${profile.infoConfig.imageNameSize}pt · Font: ${profile.infoConfig.fontFamily?.split(',')[0] || 'Modern'}`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          onLoadProfile(profile);
                          onClose();
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Load these settings"
                      >
                        <span>Load</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOverwrite(profile)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Overwrite with current settings"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(profile.id, profile.name)}
                        className="p-1.5 text-red-500 hover:text-red-700 rounded-lg border border-slate-200 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete configuration"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer: Backup & Restore */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleImportJson}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import Backup JSON</span>
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={handleExportJson}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Backup JSON</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
