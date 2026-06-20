import { useState } from "react";
import { lookupProduct } from "../services/posService";

export function useBarcodeScanner(onProduct) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const scan = async () => {
    try {
      onProduct(await lookupProduct(code));
      setCode("");
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.message ?? requestError.message);
    }
  };
  return { code, setCode, scan, error };
}
