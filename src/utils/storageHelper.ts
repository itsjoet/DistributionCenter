import { SavedProfile } from '../types/storage';
import { LabelMode, SerializedConfig, InfoConfig, ExportFormat } from '../types/label';
import { getTodayFormatted } from './dateHelper';

const STORAGE_PROFILES_KEY = 'label_maker_saved_configs_v1';
const STORAGE_LAST_ACTIVE_KEY = 'label_maker_last_active_v1';

const DEFAULT_TEMPLATES: SavedProfile[] = [
  {
    id: 'default-info-standard',
    name: 'Standard Information Label',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    mode: 'information',
    exportFormat: 'single_roll',
    serializedConfig: {
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
      preset: 'balanced',
      titleSize: 15,
      serialSize: 30,
      subtitleSize: 9,
      barcodeHeight: 42,
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      textAlign: 'center',
      letterSpacing: 2,
    },
    infoConfig: {
      companyName: '',
      imageName: 'Field_Capture_001.raw',
      imageDate: getTodayFormatted('ISO'),
      userName: '',
      notes: '',
      thumbnailDataUrl: null,
      copiesCount: 1,
      isBatchMode: false,
      batchItems: [],
      layoutStyle: 'clean_card',
      borderStyle: 'none',
      includeBarcode: false,
      preset: 'balanced',
      titleSize: 11,
      imageNameSize: 16,
      fieldLabelSize: 9,
      fieldValueSize: 12,
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      textAlign: 'left',
    },
  },
  {
    id: 'default-asset-barcode',
    name: 'Asset Tag (Large 30pt Barcode)',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    mode: 'serialized',
    exportFormat: 'single_roll',
    serializedConfig: {
      companyTitle: 'EQUIPMENT ASSET',
      subtitle: 'INTERNAL TRACKING SYSTEM',
      startNumber: 1001,
      endNumber: 1025,
      prefix: 'AST-',
      suffix: '',
      step: 1,
      barcodeFormat: 'CODE128',
      showBarcodeHumanReadable: false,
      borderStyle: 'subtle_guide',
      preset: 'balanced',
      titleSize: 14,
      serialSize: 32,
      subtitleSize: 8,
      barcodeHeight: 45,
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      textAlign: 'center',
      letterSpacing: 2,
    },
    infoConfig: {
      companyName: '',
      imageName: '',
      imageDate: getTodayFormatted('ISO'),
      userName: '',
      notes: '',
      thumbnailDataUrl: null,
      copiesCount: 1,
      isBatchMode: false,
      batchItems: [],
      layoutStyle: 'clean_card',
      borderStyle: 'none',
      includeBarcode: false,
      preset: 'balanced',
      titleSize: 11,
      imageNameSize: 16,
      fieldLabelSize: 9,
      fieldValueSize: 12,
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      textAlign: 'left',
    },
  },
];

/**
 * Loads all saved profiles from localStorage
 */
export function getSavedProfiles(): SavedProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_PROFILES_KEY);
    if (!raw) {
      // Initialize with default templates
      localStorage.setItem(STORAGE_PROFILES_KEY, JSON.stringify(DEFAULT_TEMPLATES));
      return DEFAULT_TEMPLATES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_TEMPLATES;
  } catch (err) {
    console.warn('Failed to load saved profiles from localStorage', err);
    return DEFAULT_TEMPLATES;
  }
}

/**
 * Saves a new profile to localStorage
 */
export function saveProfile(
  name: string,
  data: {
    mode: LabelMode;
    serializedConfig: SerializedConfig;
    infoConfig: InfoConfig;
    customSerialList?: string;
    exportFormat: ExportFormat;
  }
): SavedProfile {
  const profiles = getSavedProfiles();
  const now = new Date().toISOString();
  const newProfile: SavedProfile = {
    id: `config-${Date.now()}`,
    name: name.trim() || `Config ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    createdAt: now,
    updatedAt: now,
    ...data,
  };

  const updated = [newProfile, ...profiles];
  localStorage.setItem(STORAGE_PROFILES_KEY, JSON.stringify(updated));
  return newProfile;
}

/**
 * Overwrites an existing profile
 */
export function updateProfile(
  id: string,
  data: Partial<Omit<SavedProfile, 'id' | 'createdAt'>>
): SavedProfile[] {
  const profiles = getSavedProfiles();
  const updated = profiles.map((p) => {
    if (p.id === id) {
      return {
        ...p,
        ...data,
        updatedAt: new Date().toISOString(),
      };
    }
    return p;
  });

  localStorage.setItem(STORAGE_PROFILES_KEY, JSON.stringify(updated));
  return updated;
}

/**
 * Deletes a profile from localStorage
 */
export function deleteProfile(id: string): SavedProfile[] {
  const profiles = getSavedProfiles();
  const updated = profiles.filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_PROFILES_KEY, JSON.stringify(updated));
  return updated;
}

/**
 * Exports all profiles as a JSON string for backup
 */
export function exportProfilesJson(): string {
  const profiles = getSavedProfiles();
  return JSON.stringify(profiles, null, 2);
}

/**
 * Imports profiles from a JSON string
 */
export function importProfilesJson(jsonStr: string): SavedProfile[] {
  const parsed = JSON.parse(jsonStr);
  if (!Array.isArray(parsed)) {
    throw new Error('Invalid backup file format.');
  }
  const current = getSavedProfiles();
  // Merge by id
  const map = new Map<string, SavedProfile>();
  current.forEach((p) => map.set(p.id, p));
  parsed.forEach((p) => {
    if (p && p.name && p.mode) {
      map.set(p.id || `imported-${Date.now()}-${Math.random()}`, p);
    }
  });

  const merged = Array.from(map.values());
  localStorage.setItem(STORAGE_PROFILES_KEY, JSON.stringify(merged));
  return merged;
}

/**
 * Automatically persists the last active state across browser sessions
 */
export function saveLastActiveConfig(data: {
  mode: LabelMode;
  serializedConfig: SerializedConfig;
  infoConfig: InfoConfig;
  customSerialList?: string;
  exportFormat: ExportFormat;
}): void {
  try {
    localStorage.setItem(STORAGE_LAST_ACTIVE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('Failed to save last active config', err);
  }
}

/**
 * Loads the last active state from localStorage
 */
export function loadLastActiveConfig(): {
  mode: LabelMode;
  serializedConfig: SerializedConfig;
  infoConfig: InfoConfig;
  customSerialList?: string;
  exportFormat: ExportFormat;
} | null {
  try {
    const raw = localStorage.getItem(STORAGE_LAST_ACTIVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to load last active config', err);
    return null;
  }
}
