import React, { useRef, useEffect } from 'react';
import JsBarcode from 'jsbarcode';
import { RenderedLabelItem, SerializedConfig, InfoConfig, ExportFormat, BarcodeFormat } from '../types/label';

interface PrintContainerProps {
  items: RenderedLabelItem[];
  format: ExportFormat;
  serializedConfig: SerializedConfig;
  infoConfig: InfoConfig;
}

// Lightweight, vector SVG barcode component that renders only once per value
const SvgBarcode = React.memo(({
  value,
  format = 'CODE128',
  height = 42,
}: {
  value: string;
  format?: BarcodeFormat;
  height?: number;
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !value || value.trim() === '') return;
    try {
      JsBarcode(svgRef.current, value.trim(), {
        format: format,
        height: height,
        width: 2,
        displayValue: false,
        margin: 2,
      });
    } catch {
      try {
        // Fallback to Code 128 if format failed
        if (svgRef.current) {
          JsBarcode(svgRef.current, value.trim(), {
            format: 'CODE128',
            height: height,
            width: 2,
            displayValue: false,
            margin: 2,
          });
        }
      } catch {
        // Silently handle if value cannot be encoded in barcode
      }
    }
  }, [value, format, height]);

  if (!value) return null;
  return <svg ref={svgRef} style={{ maxHeight: `${height}pt`, maxWidth: '85%' }} />;
});

SvgBarcode.displayName = 'SvgBarcode';

export const PrintContainer: React.FC<PrintContainerProps> = ({
  items,
  format,
  serializedConfig,
  infoConfig,
}) => {
  if (items.length === 0) return null;

  return (
    <div id="printable-label-area" className="hidden print:block">
      {format === 'single_roll' ? (
        // Single roll format: one 4" x 2" label per page
        items.map((item, idx) => (
          <div
            key={item.id || idx}
            style={{
              width: '4in',
              height: '2in',
              padding: '0.2in',
              boxSizing: 'border-box',
              pageBreakAfter: 'always',
              breakAfter: 'page',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              fontFamily: item.mode === 'serialized' ? serializedConfig.fontFamily : infoConfig.fontFamily,
              backgroundColor: '#ffffff',
              border: serializedConfig.borderStyle === 'solid_border' ? '1px solid black' : undefined,
            }}
          >
            {item.mode === 'serialized' ? (
              // Serialized Layout
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', textAlign: 'center' }}>
                <div style={{ fontSize: `${serializedConfig.titleSize}pt`, fontWeight: 'bold', textTransform: 'uppercase' }}>
                  {item.topTitle || 'COMPANY TITLE'}
                </div>
                <div style={{ fontSize: `${serializedConfig.serialSize}pt`, fontWeight: 'bold', fontFamily: 'monospace', letterSpacing: '2px' }}>
                  {item.primaryCode}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  {item.showBarcode && item.barcodeData && (
                    <SvgBarcode
                      value={item.barcodeData}
                      format={serializedConfig.barcodeFormat}
                      height={serializedConfig.barcodeHeight}
                    />
                  )}
                </div>
              </div>
            ) : (
              // Information Layout
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', textAlign: 'left' }}>
                <div>
                  {item.topTitle && (
                    <div style={{ fontSize: `${infoConfig.titleSize}pt`, fontWeight: 'bold', color: '#000000', textTransform: 'uppercase', marginBottom: '2px' }}>
                      {item.topTitle}
                    </div>
                  )}
                  <div style={{ fontSize: `${Math.max(9, infoConfig.fieldLabelSize)}pt`, fontWeight: 'bold', color: '#000000', textTransform: 'uppercase' }}>
                    Image Name
                  </div>
                  <div style={{ fontSize: `${infoConfig.imageNameSize}pt`, fontWeight: 'bold', color: '#000000', marginTop: '1px' }}>
                    {item.primaryCode}
                  </div>
                </div>
                <div style={{ borderTop: '1px solid #000000', margin: '4px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: `${Math.max(9, infoConfig.fieldLabelSize)}pt`, fontWeight: 'bold', color: '#000000', textTransform: 'uppercase' }}>
                      Image Date
                    </div>
                    <div style={{ fontSize: `${infoConfig.fieldValueSize}pt`, fontWeight: 'bold', color: '#000000', marginTop: '1px' }}>
                      {item.metaFields?.find((f) => f.label.toLowerCase().includes('date'))?.value || infoConfig.imageDate}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: `${Math.max(9, infoConfig.fieldLabelSize)}pt`, fontWeight: 'bold', color: '#000000', textTransform: 'uppercase' }}>
                      User's Name
                    </div>
                    <div style={{ fontSize: `${infoConfig.fieldValueSize}pt`, fontWeight: 'bold', color: '#000000', marginTop: '1px' }}>
                      {item.metaFields?.find((f) => f.label.toLowerCase().includes('user'))?.value || infoConfig.userName}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))
      ) : (
        // Avery 5163 10-up letter sheet
        <div style={{ width: '8.5in', padding: '0.5in 0.156in', boxSizing: 'border-box' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '4in 4in',
              columnGap: '0.1875in',
              rowGap: '0in',
            }}
          >
            {items.map((item, idx) => (
              <div
                key={item.id || idx}
                style={{
                  width: '4in',
                  height: '2in',
                  padding: '0.2in',
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  fontFamily: item.mode === 'serialized' ? serializedConfig.fontFamily : infoConfig.fontFamily,
                }}
              >
                {item.mode === 'serialized' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', textAlign: 'center' }}>
                    <div style={{ fontSize: `${serializedConfig.titleSize}pt`, fontWeight: 'bold', textTransform: 'uppercase' }}>
                      {item.topTitle || 'COMPANY TITLE'}
                    </div>
                    <div style={{ fontSize: `${serializedConfig.serialSize}pt`, fontWeight: 'bold', fontFamily: 'monospace', letterSpacing: '2px' }}>
                      {item.primaryCode}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      {item.showBarcode && item.barcodeData && (
                        <SvgBarcode
                          value={item.barcodeData}
                          format={serializedConfig.barcodeFormat}
                          height={serializedConfig.barcodeHeight}
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', textAlign: 'left' }}>
                    <div>
                      {item.topTitle && (
                        <div style={{ fontSize: `${infoConfig.titleSize}pt`, fontWeight: 'bold', color: '#000000', textTransform: 'uppercase', marginBottom: '2px' }}>
                          {item.topTitle}
                        </div>
                      )}
                      <div style={{ fontSize: `${Math.max(9, infoConfig.fieldLabelSize)}pt`, fontWeight: 'bold', color: '#000000', textTransform: 'uppercase' }}>
                        Image Name
                      </div>
                      <div style={{ fontSize: `${infoConfig.imageNameSize}pt`, fontWeight: 'bold', color: '#000000', marginTop: '1px' }}>
                        {item.primaryCode}
                      </div>
                    </div>
                    <div style={{ borderTop: '1px solid #000000', margin: '4px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: `${Math.max(9, infoConfig.fieldLabelSize)}pt`, fontWeight: 'bold', color: '#000000', textTransform: 'uppercase' }}>
                          Image Date
                        </div>
                        <div style={{ fontSize: `${infoConfig.fieldValueSize}pt`, fontWeight: 'bold', color: '#000000', marginTop: '1px' }}>
                          {item.metaFields?.find((f) => f.label.toLowerCase().includes('date'))?.value || infoConfig.imageDate}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: `${Math.max(9, infoConfig.fieldLabelSize)}pt`, fontWeight: 'bold', color: '#000000', textTransform: 'uppercase' }}>
                          User's Name
                        </div>
                        <div style={{ fontSize: `${infoConfig.fieldValueSize}pt`, fontWeight: 'bold', color: '#000000', marginTop: '1px' }}>
                          {item.metaFields?.find((f) => f.label.toLowerCase().includes('user'))?.value || infoConfig.userName}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
