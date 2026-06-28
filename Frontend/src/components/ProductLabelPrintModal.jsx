import { useRef, useEffect } from 'react';
import Modal from './Modal';
import JsBarcode from 'jsbarcode';
import { QRCodeSVG } from 'qrcode.react';
import useCurrent from '../hooks/auth/useCurrent';

const ProductLabelPrintModal = ({ open, onClose, product, previewData }) => {
  const barcodeRef = useRef(null);
  const { data: user } = useCurrent();
  const shopName = user?.shop?.name || "Kambuja POS";

  // Determine code to use:
  // product.code > product.productCode > product.sku > product.barcode > previewData (for create page)
  const codeValue = product?.code || product?.productCode || product?.sku || product?.barcode || previewData?.sku || previewData?.barcode;
  const nameValue = product?.name || previewData?.name || "Product Name";
  const priceValue = product?.salePrice || previewData?.salePrice || 0;

  useEffect(() => {
    if (barcodeRef.current && codeValue) {
      try {
        JsBarcode(barcodeRef.current, codeValue, {
          format: "CODE128",
          displayValue: true,
          width: 1.5,
          height: 30,
          background: "#ffffff",
          lineColor: "#000000",
          margin: 0,
          fontSize: 12,
        });
      } catch (err) {
        console.error("Barcode generation error", err);
      }
    }
  }, [codeValue, open]);

  const handlePrint = () => {
    window.print();
  };

  const formatUsd = (value) => `$${Number(value || 0).toFixed(2)}`;

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} title="Print Product Label" size="md">
      <div className="mt-4 flex flex-col items-center">
        {/* Printable Area - styled for 40x30mm label */}
        <div className="printable-label-wrapper bg-gray-100 dark:bg-gray-800 p-4 rounded-xl border border-border w-full flex justify-center mb-6 overflow-hidden">
          {codeValue ? (
            <div id="print-label-content" className="bg-white text-black flex flex-col items-center justify-center box-border p-1" style={{ width: '40mm', height: '30mm', overflow: 'hidden' }}>
              <div className="text-[9px] font-bold text-center leading-tight truncate w-full px-1">{shopName}</div>
              <div className="text-[10px] font-extrabold text-center leading-tight truncate w-full px-1">{nameValue}</div>
              <div className="text-[10px] font-black text-center leading-tight">{formatUsd(priceValue)}</div>
              
              <div className="flex w-full items-center justify-between px-1 mt-0.5 gap-1">
                <div className="flex-1 flex justify-center overflow-hidden">
                  <svg ref={barcodeRef} style={{ maxWidth: '100%', height: 'auto', display: 'block' }}></svg>
                </div>
                <div className="shrink-0">
                  <QRCodeSVG value={codeValue} size={28} level="M" bgColor="#ffffff" fgColor="#000000" includeMargin={false} />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm font-semibold text-amber-500 py-6">
              Product code, SKU or barcode is required to generate a label.
            </div>
          )}
        </div>

        <button
          onClick={handlePrint}
          disabled={!codeValue}
          className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-extrabold uppercase tracking-wider text-primary-foreground transition hover:bg-primary/95 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed print:hidden"
        >
          Print Label
        </button>

        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #print-label-content, #print-label-content * {
              visibility: visible;
            }
            #print-label-content {
              position: absolute;
              left: 0;
              top: 0;
              margin: 0;
              padding: 1mm;
              page-break-after: always;
            }
            @page {
              size: 40mm 30mm;
              margin: 0;
            }
          }
        `}</style>
      </div>
    </Modal>
  );
};

export default ProductLabelPrintModal;
