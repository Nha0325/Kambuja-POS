import { useRef, useEffect, useState } from 'react';
import Modal from '../ui/Modal';
import JsBarcode from 'jsbarcode';
import { QRCodeSVG } from 'qrcode.react';
import useCurrent from '../../hooks/auth/useCurrent';

const ProductLabelPrintModal = ({ open, onClose, product, previewData, initialPrintType = 'barcode' }) => {
  const barcodeRef = useRef(null);
  const { data: user } = useCurrent();
  const shopName = user?.shop?.name || "Kambuja POS";
  const [printType, setPrintType] = useState(initialPrintType);

  useEffect(() => {
    if (open) {
      setPrintType(initialPrintType);
    }
  }, [open, initialPrintType]);

  // Determine code to use:
  // product.code > product.productCode > product.sku > product.barcode > previewData (for create page)
  const codeValue = product?.code || product?.productCode || product?.sku || product?.barcode || previewData?.sku || previewData?.barcode;
  const nameValue = product?.name || previewData?.name || "Product Name";
  const priceValue = product?.salePrice || previewData?.salePrice || 0;

  useEffect(() => {
    if (printType === 'barcode' && barcodeRef.current && codeValue) {
      try {
        JsBarcode(barcodeRef.current, codeValue, {
          format: "CODE128",
          displayValue: true,
          width: 1.5,
          height: 35,
          background: "#ffffff",
          lineColor: "#000000",
          margin: 0,
          fontSize: 12,
        });
      } catch (err) {
        console.error("Barcode generation error", err);
      }
    }
  }, [codeValue, open, printType]);

  const handlePrint = (type) => {
    setPrintType(type);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const formatUsd = (value) => `$${Number(value || 0).toFixed(2)}`;

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} title="Print Product Label" size="md">
      <div className="mt-4 flex flex-col items-center">
        {/* Printable Area - styled for 40x30mm label */}
        <div className="printable-label-wrapper bg-gray-100 dark:bg-gray-800 p-4 rounded-xl border border-border w-full flex justify-center mb-6 overflow-hidden">
          {codeValue ? (
            <div id="print-label-content" className="bg-white text-black flex flex-col items-center justify-center box-border" style={{ width: '40mm', height: '30mm', padding: '1.5mm', overflow: 'hidden' }}>
              <div className="w-full flex flex-col items-center justify-center shrink-0">
                <div className="text-[10px] font-bold text-center leading-tight truncate w-full">{shopName}</div>
                <div className="text-[11px] font-extrabold text-center leading-tight truncate w-full mt-[1px]">{nameValue}</div>
                <div className="text-[11px] font-black text-center leading-tight mt-[1px]">{formatUsd(priceValue)}</div>
              </div>
              
              <div className="w-full flex flex-col items-center justify-center mt-1 flex-1 overflow-hidden">
                {printType === 'barcode' ? (
                  <svg ref={barcodeRef} style={{ maxWidth: '100%', maxHeight: '100%', display: 'block', margin: '0 auto' }}></svg>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <QRCodeSVG value={codeValue} size={40} level="M" bgColor="#ffffff" fgColor="#000000" includeMargin={false} />
                    <div className="text-[8px] font-bold mt-[2px] tracking-wider text-center">{codeValue}</div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-sm font-semibold text-amber-500 py-6">
              Product code, SKU or barcode is required to generate a label.
            </div>
          )}
        </div>

        <div className="flex gap-3 w-full print:hidden">
          <button
            onClick={() => handlePrint('barcode')}
            disabled={!codeValue}
            className="inline-flex flex-1 h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-extrabold uppercase tracking-wider text-primary-foreground transition hover:bg-primary/95 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Print Barcode
          </button>
          <button
            onClick={() => handlePrint('qrcode')}
            disabled={!codeValue}
            className="inline-flex flex-1 h-11 items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-extrabold uppercase tracking-wider text-white transition hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            Print QR Code
          </button>
        </div>

        <style>{`
          @media print {
            @page {
              size: 40mm 30mm;
              margin: 0;
            }
            html, body {
              height: 100vh;
              overflow: hidden;
              margin: 0;
              padding: 0;
              background-color: white;
            }
            body * {
              visibility: hidden;
            }
            #print-label-content, #print-label-content * {
              visibility: visible;
            }
            #print-label-content {
              position: fixed;
              left: 50%;
              top: 50%;
              transform: translate(-50%, -50%);
              margin: 0;
              padding: 1.5mm !important;
              width: 40mm !important;
              height: 30mm !important;
              z-index: 9999;
              background-color: white;
            }
          }
        `}</style>
      </div>
    </Modal>
  );
};

export default ProductLabelPrintModal;
