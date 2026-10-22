import { LabelMode, SerializedConfig, InfoConfig, ExportFormat, PrintOrientation } from './label';

export interface SavedProfile {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  mode: LabelMode;
  serializedConfig: SerializedConfig;
  infoConfig: InfoConfig;
  customSerialList?: string;
  exportFormat: ExportFormat;
  printOrientation?: PrintOrientation;
}
