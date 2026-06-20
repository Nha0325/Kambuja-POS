import { useState, useEffect } from "react";

const BarcodeScanner = () => {
  const [barcode, setBarcode] = useState("");

  useEffect(() => {
    const handleKeydown = (event) => {
      if (event.key === "Enter") {
        console.log("Scanned Barcode:", barcode);
        setBarcode("");
      } else {
        setBarcode((prev) => prev + event.key);
      }
    }
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [barcode]);

  return <input type="text" className="input input-sm" value={barcode} />;
};

export default BarcodeScanner;
