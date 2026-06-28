import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

const SCANNER_REGION_ID = "product-scanner-region";

const ProductScanner = ({ onScanSuccess, onClose }) => {
  const scannerRef = useRef(null);
  const isRunningRef = useRef(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState("");
  const [error, setError] = useState("");

  const [manualCode, setManualCode] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    // Always focus the manual input when modal opens
    if (inputRef.current) {
      inputRef.current.focus();
    }

    const isSecureContext = window.location.protocol === "https:" || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    if (!isSecureContext) {
      setError("Camera blocked: HTTP LAN IP is insecure. Use HTTPS or enable insecure origin flag for local testing.");
      return;
    }

    Html5Qrcode.getCameras().then(devices => {
      if (devices && devices.length > 0) {
        setCameras(devices);
        const pixelCam = devices.find(d => d.label.includes("Pixel") || d.label.includes("Android Webcam"));
        const backCam = devices.find(d => d.label.toLowerCase().includes("back") || d.label.toLowerCase().includes("environment"));
        setSelectedCamera(pixelCam ? pixelCam.id : (backCam ? backCam.id : devices[0].id));
      } else {
        setError("No camera found.");
      }
    }).catch(err => {
      if (err?.name === 'NotAllowedError') {
        setError("Camera permission denied. Allow camera access in browser settings.");
      } else {
        setError("Camera scanner is not supported in this browser.");
      }
    });
  }, []);

  const handleManualSubmit = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const code = manualCode.trim();
      if (code && onScanSuccess) {
        onScanSuccess(code);
      }
      setManualCode("");
    }
  };

  useEffect(() => {
    if (!selectedCamera) return;
    
    const scanner = new Html5Qrcode(SCANNER_REGION_ID);
    scannerRef.current = scanner;

    const startScanner = async () => {
      try {
        await scanner.start(
          selectedCamera,
          {
            fps: 10,
            qrbox: (viewfinderWidth, viewfinderHeight) => {
              const size = Math.min(viewfinderWidth, viewfinderHeight) * 0.7;
              return { width: Math.max(size, 200), height: Math.max(size, 200) };
            },
            aspectRatio: 1,
            formatsToSupport: [
                Html5QrcodeSupportedFormats.QR_CODE,
                Html5QrcodeSupportedFormats.CODE_128,
                Html5QrcodeSupportedFormats.EAN_13,
                Html5QrcodeSupportedFormats.EAN_8
            ],
          },
          (decodedText) => {
            if (onScanSuccess) onScanSuccess(decodedText);
          },
          () => {
            // ignore continuous scanning errors
          }
        );
        isRunningRef.current = true;
      } catch (err) {
        console.error("Scanner error", err);
        setError("Failed to start scanner. Scanner might be unavailable.");
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current && isRunningRef.current) {
        scannerRef.current.stop().then(() => {
          isRunningRef.current = false;
          scannerRef.current.clear();
        }).catch(() => {});
      }
    };
  }, [selectedCamera, onScanSuccess]);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Manual Input Fallback */}
      <div className="w-full relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          qr_code_scanner
        </span>
        <input
          ref={inputRef}
          type="text"
          placeholder="Scan or enter product code"
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value)}
          onKeyDown={handleManualSubmit}
          className="h-12 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm font-semibold text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {error ? (
        <div className="rounded-xl w-full border border-destructive/20 bg-destructive/10 p-4 text-center text-sm font-bold text-destructive">
          {error}
        </div>
      ) : (
        <div className="w-full flex flex-col gap-3">
          <select 
            value={selectedCamera} 
            onChange={(e) => setSelectedCamera(e.target.value)}
            className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            {cameras.map(cam => (
              <option key={cam.id} value={cam.id}>{cam.label || `Camera ${cam.id}`}</option>
            ))}
          </select>
          <div
            id={SCANNER_REGION_ID}
            className="w-full overflow-hidden rounded-xl border border-border bg-black"
          />
        </div>
      )}
      
      <button
        onClick={onClose}
        type="button"
        className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-destructive px-4 text-sm font-extrabold uppercase tracking-wider text-white transition hover:bg-destructive/90 active:scale-[0.98]"
      >
        Close Scanner
      </button>
    </div>
  );
};

export default ProductScanner;
