import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { QRCodeSVG } from 'qrcode.react';

const ProductCodePreview = ({ value, type = "CODE128" }) => {
  const barcodeRef = useRef(null);

  useEffect(() => {
    if (barcodeRef.current && value) {
      try {
        JsBarcode(barcodeRef.current, value, {
          format: type,
          displayValue: true,
          width: 2.2,
          height: 90,
          background: "#ffffff",
          lineColor: "#000000",
          margin: 15,
          fontSize: 16,
        });
      } catch (err) {
        console.error("Barcode generation error", err);
      }
    }
  }, [value, type]);

  if (!value) return null;

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4 rounded-xl border border-border bg-card">
      <div className="flex flex-col items-center gap-2 w-full">
        <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Barcode</h4>
        <div className="bg-white p-4 rounded-xl border border-border shadow-sm flex justify-center items-center w-fit overflow-hidden">
          <svg ref={barcodeRef} style={{ maxWidth: '100%', height: 'auto', display: 'block' }}></svg>
        </div>
      </div>
      <div className="w-full border-t border-border border-dashed my-2"></div>
      <div className="flex flex-col items-center gap-2 w-full">
        <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">QR Code</h4>
        <div className="bg-white p-6 rounded-xl border border-border shadow-sm flex justify-center items-center w-fit">
            <QRCodeSVG value={value} size={220} level="H" bgColor="#ffffff" fgColor="#000000" includeMargin={true} />
        </div>
      </div>
    </div>
  );
};

export default ProductCodePreview;
