export type LabelMode = 'serialized' | 'information';

export type ExportFormat = 'single_roll' | 'avery_5163';

export type BarcodeFormat = 'CODE128' | 'CODE39' | 'EAN13' | 'UPC';

export type TextSizePreset = 'compact' | 'balanced' | 'large' | 'xlarge' | 'custom';

export type LabelBorderStyle = 'none' | 'subtle_guide' | 'solid_border';

export type PrintOrientation = 'normal' | 'rotate90' | 'rotate180' | 'rotate270';

export interface SerializedConfig {
  companyTitle: string;
  subtitle: string;
  startNumber: number | string;
  endNumber: number | string;
  prefix: string;
  suffix: string;
  step: number | string;
  barcodeFormat: BarcodeFormat;
  showBarcodeHumanReadable: boolean;
  borderStyle: LabelBorderStyle;
  
  // Typography sizing (in pt for exact PDF scale)
  preset: TextSizePreset;
  titleSize: number;       // default 15pt
  serialSize: number;      // default 30pt (big asset #)
  subtitleSize: number;    // default 9pt
  barcodeHeight: number;   // default 42pt
  fontFamily: string;
  textAlign: 'center' | 'left' | 'right';
  letterSpacing: number;   // in pt or px
}

export interface InfoItem {
  id: string;
  imageName: string;
  imageDate: string;
  userName: string;
  notes?: string;
  companyName?: string;
  thumbnailDataUrl?: string;
}

export interface InfoConfig {
  companyName: string;
  imageName: string;
  imageDate: string;
  userName: string;
  notes: string;
  thumbnailDataUrl: string | null;
  copiesCount: number;
  
  // Multi-item batch mode
  isBatchMode: boolean;
  batchItems: InfoItem[];
  
  // Layout and style
  layoutStyle: 'clean_card' | 'ruled_record' | 'with_thumbnail';
  borderStyle: LabelBorderStyle;
  includeBarcode: boolean;
  
  // Typography sizing
  preset: TextSizePreset;
  titleSize: number;       // default 11pt
  imageNameSize: number;   // default 16pt
  fieldLabelSize: number;  // default 9pt
  fieldValueSize: number;  // default 12pt
  fontFamily: string;
  textAlign: 'left' | 'center';
}

export interface RenderedLabelItem {
  id: string;
  index: number;
  mode: LabelMode;
  topTitle: string;
  primaryCode: string;
  barcodeData: string;
  showBarcode: boolean;
  metaFields?: { label: string; value: string }[];
  thumbnailUrl?: string;
  notes?: string;
}
