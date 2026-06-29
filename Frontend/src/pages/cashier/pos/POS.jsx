import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";

import toast from "react-hot-toast";
import useCollection from "../../../hooks/common/useCollection";
import Modal from "../../../components/ui/Modal";
import ProductScanner from "../../../components/product/ProductScanner";

import { LuScanBarcode } from "react-icons/lu";
import { MdCameraAlt } from "react-icons/md";
import { baseUrl } from "../../../utils/config/env";
import { api } from "../../../utils/config/api";


function POS() {
  const formatUsd = (value) => `$${Number(value || 0).toFixed(2)}`;
  const [scanCode, setScanCode] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const { create, isLoading } = useCollection("sales");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState("");
  const lastScanTimeRef = useRef(0);
  const lastScanCodeRef = useRef("");
  const scanInputRef = useRef(null);
  const [lastScannedProduct, setLastScannedProduct] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [topActionEl, setTopActionEl] = useState(null);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    setTopActionEl(document.getElementById("cashier-top-action"));
  }, []);

  const toBaseQty = (item, quantity, saleUnit) => {
    const unitConfig = item?.productData?.unitConfig || item?.unitConfig || {};
    const unit = saleUnit || unitConfig.baseUnit?.code;

    if (unit && unit === unitConfig.purchaseUnit?.code) {
      return Number(quantity || 0) * Number(unitConfig.unitsPerPurchaseUnit || 1);
    }

    return Number(quantity || 0);
  };

  useEffect(() => {
    const fetchHeldBill = async () => {
      const heldId = searchParams.get('heldBill');
      if (!heldId) return;
      try {
        const res = await api.get(`/held-bills/${heldId}`);
        const data = res.data;
        if (data.success && data.result) {
          setCartItems(data.result.items.map(item => ({
            productId: item.product,
            name: item.name,
            qty: item.quantity,
            price: item.unitPrice,
            lineTotal: item.totalPrice,
            baseUnit: item.saleUnit || ""
          })));
        }
      } catch (err) {
        console.error("Failed to fetch held bill", err);
      }
    };
    fetchHeldBill();
  }, [searchParams]);



  function addToCart(product) {
    if (!product) return;
    
    setCartItems((prev) => {
      const existing = prev.find((item) => item.productId === product._id);

      if (existing) {
        const stockAvailable = Number(product.stock ?? product.stockQtyBase ?? product.currentStock ?? 0);
        if (existing.qty + 1 > stockAvailable) {
          toast.error("Not enough stock");
          return prev;
        }

        return prev.map((item) =>
          item.productId === product._id
            ? {
                ...item,
                qty: item.qty + 1,
                lineTotal: (item.qty + 1) * item.price
              }
            : item
        );
      }

      const stockAvailable = Number(product.stock ?? product.stockQtyBase ?? product.currentStock ?? 0);
      if (stockAvailable <= 0) {
        toast.error("Product is out of stock");
        return prev;
      }

      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          barcode: product.barcode || "",
          sku: product.sku || "",
          code: product.code || "",
          imageUrl: product.imageUrl || product.image || "",
          category: product.category || "",
          price: product.salePrice,
          costPrice: product.costPrice,
          stock: stockAvailable,
          qty: 1,
          baseUnit: product.unitConfig?.baseUnit?.code || product.baseUnit || "",
          productData: product,
          lineTotal: product.salePrice
        }
      ];
    });

    // We do setTimeout to check if it was added because setCartItems is async, 
    // but we can just blindly update lastScannedProduct because the UI uses the state cartItems to calculate qty in cart.
    setLastScannedProduct(product);
    setRecentScans((prev) => {
      const filtered = prev.filter(p => p._id !== product._id);
      return [product, ...filtered].slice(0, 5); // Keep last 5 unique scans
    });

    if (scanInputRef.current) {
        setTimeout(() => scanInputRef.current.focus(), 10);
    }
  }

  const handleCameraScan = useCallback(async (code) => {
    const trimmed = (code || "").trim();
    if (!trimmed) return;

    const now = Date.now();
    if (trimmed === lastScanCodeRef.current && now - lastScanTimeRef.current < 1500) return;
    lastScanCodeRef.current = trimmed;
    lastScanTimeRef.current = now;
    setLastScannedCode(trimmed);

    try {
      const res = await api.get(`/products/lookup/${encodeURIComponent(trimmed)}`);
      if (res.data?.success && res.data?.result) {
        addToCart(res.data.result);
        toast.success(`Added: ${res.data.result.name}`);
        setIsCameraOpen(false);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        toast.error("Product code scanned but product not found. Save product first or check code.");
      } else {
        const msg = err.response?.data?.message || "Scan failed";
        toast.error(msg);
      }
    }
  }, []);

  const handleCartIncrement = (id) => {
    const item = cartItems.find((el) => el.productId === id);
    if (item && item.qty + 1 <= item.stock) {
      setCartItems(prev => prev.map(el => el.productId === id ? { ...el, qty: el.qty + 1, lineTotal: (el.qty + 1) * el.price } : el));
    } else if (item) {
      toast.error("Not enough stock");
    }
  };

  const handleScanKeyDown = async (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();

    const code = scanCode.trim();
    if (!code) return;

    try {
        const res = await api.get(`/products/lookup/${encodeURIComponent(code)}`);
        if (res.data?.success && res.data?.result) {
          addToCart(res.data.result);
        }
    } catch (err) {
        if (err.response?.status === 404) {
          toast.error("Product code scanned but product not found. Save product first or check code.");
        } else {
          toast.error(err.response?.data?.message || "Product not found or out of stock");
        }
    }
    
    setScanCode("");
    
    setTimeout(() => {
        scanInputRef.current?.focus();
    }, 0);
  };

  const handlePayment = async () => {
    if (cartItems.length <= 0) return toast.error("Please add product to cart!");

    const currentTotal = cartItems.reduce((acc, item) => acc + item.lineTotal, 0);

    const payload = {
      items: cartItems.map((item) => ({
        product: item.productId,
        quantity: Number(item.qty),
        saleUnit: item.baseUnit,
        unitPrice: Number(item.price),
        totalPrice: Number(item.lineTotal)
      })),
      totalCost: Number(currentTotal),
      paidAmount: Number(currentTotal)
    };

    try {
      const res = await create(payload);
      if (res) {
        if (searchParams.get('heldBill')) {
          try {
            await api.patch(`/held-bills/${searchParams.get('heldBill')}/complete`, { completedSale: res._id });
          } catch (e) { console.error("Failed to complete held bill", e); }
        }

        toast.success("Sale completed successfully!");
        setTotalCost(0);
        setCartItems([]);
        setLastScannedProduct(null);
        setRecentScans([]);
        window.open(`/cashier/invoice/${res._id}`, '_blank');
        
        if (searchParams.get('heldBill')) {
          navigate("/cashier/pos"); // clear query param
        }
        if (scanInputRef.current) setTimeout(() => scanInputRef.current.focus(), 100);
      }
    } catch (error) {
      const serverMsg = error.response?.data?.details || error.response?.data?.message || error.response?.data?.error || "Sale submission failed";
      let errorMessage = serverMsg;
      if (error.response) {
        if (error.response.status === 404) {
          const htmlData = error.response.data;
          const match = htmlData.match(/<pre>Cannot POST (\/[^<]+)<\/pre>/);
          errorMessage = match && match[1] ? `API endpoint '${match[1]}' not found.` : "API endpoint not found.";
        } else {
          errorMessage = error.response?.data?.details || error.response?.data?.message || error.response?.data?.error || errorMessage;
        }
      }
      toast.error(errorMessage);
    }
  };

  const handleUnitChange = (id, newUnit) => {
    const item = cartItems.find((el) => el.productId === id);
    if (item) {
      const availableStock = Number(item.productData?.stock ?? item.productData?.stockQtyBase ?? item.productData?.currentStock ?? 0);
      const neededStock = toBaseQty(item, item.qty, newUnit);
      if (availableStock < neededStock) {
        toast.error("Insufficient stock for selected unit");
        return;
      }
    }

    setCartItems(prev => prev.map(el => {
      if (el.productId === id) {
        const product = el.productData;
        const isPurchase = newUnit === product?.unitConfig?.purchaseUnit?.code;
        const newPrice = isPurchase ? (product?.pricing?.sellPricePerPurchaseUnit || product?.salePrice) : (product?.pricing?.sellPricePerBaseUnit || product?.salePrice);
        return { ...el, baseUnit: newUnit, price: newPrice, lineTotal: el.qty * newPrice };
      }
      return el;
    }));
  };

  const handleDecrement = (id) => {
    setCartItems(prev => prev.map(el => el.productId === id && el.qty > 1 ? { ...el, qty: el.qty - 1, lineTotal: (el.qty - 1) * el.price } : el));
  };

  const handleRemoveItem = (id) => setCartItems(prev => prev.filter(el => el.productId !== id));
  useEffect(() => {
    setTotalCost(cartItems.reduce((acc, item) => acc + item.lineTotal, 0));
  }, [cartItems]);

  return (
    <section className="min-h-[calc(100vh-64px)] bg-background text-foreground transition-colors duration-200">
      <div className="grid grid-cols-1 gap-4 p-3 lg:grid-cols-[minmax(0,1fr)_380px] xl:gap-6 xl:p-6">

        {/* Left Product Browser / Scanned View */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition-colors duration-200">
          
          {/* Scanner Portaled to TopMenu */}
          {topActionEl && createPortal(
            <div className="flex w-full max-w-lg items-center gap-2">
              <div className="relative flex flex-1 items-center">
                <LuScanBarcode className="absolute left-3 text-muted-foreground dark:text-zinc-400" size={18} />
                <input
                  ref={scanInputRef}
                  autoFocus
                  className="h-10 w-full rounded-xl border border-border bg-white dark:bg-[#111113] pl-10 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/60 dark:placeholder:text-zinc-500 text-foreground dark:text-[#f8fafc]"
                  onChange={(e) => setScanCode(e.target.value)}
                  value={scanCode}
                  onKeyDown={handleScanKeyDown}
                  placeholder="Scan barcode or enter SKU"
                />
              </div>
              <button
                onClick={() => setIsCameraOpen(true)}
                type="button"
                className="inline-flex h-10 w-10 sm:w-auto items-center justify-center sm:justify-start gap-2 rounded-xl bg-primary sm:px-4 text-xs font-extrabold uppercase tracking-wider text-primary-foreground transition hover:bg-primary/90 active:scale-[0.98] shrink-0"
                aria-label="Camera Scanner"
              >
                <MdCameraAlt size={18} />
                <span className="hidden sm:inline">Camera</span>
              </button>
            </div>,
            topActionEl
          )}

          <div className="flex-1 overflow-y-auto p-4 bg-muted/10 space-y-6">
              {/* Last Scanned Product */}
              <div>
                <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">Last Scanned</h2>
                {lastScannedProduct ? (
                  <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:flex-row items-center">
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-border/50 bg-muted/30 p-2 flex items-center justify-center">
                      {lastScannedProduct.imageUrl || lastScannedProduct.image ? (
                        <img
                          src={`${baseUrl}/upload/${lastScannedProduct.imageUrl || lastScannedProduct.image}`}
                          alt={lastScannedProduct.name}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">No Image</span>
                      )}
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-lg font-extrabold text-foreground">{lastScannedProduct.name}</h3>
                        <div className="mt-1 flex flex-wrap justify-center sm:justify-start gap-2 text-xs font-semibold text-muted-foreground">
                            {lastScannedProduct.barcode && <span className="rounded-md bg-muted px-2 py-1">Barcode: {lastScannedProduct.barcode}</span>}
                            {lastScannedProduct.sku && <span className="rounded-md bg-muted px-2 py-1">SKU: {lastScannedProduct.sku}</span>}
                            <span className="rounded-md bg-muted px-2 py-1">Stock: {lastScannedProduct.stock ?? lastScannedProduct.currentStock ?? 0}</span>
                        </div>
                        <div className="mt-3 flex items-center justify-center sm:justify-between gap-4">
                            <span className="text-xl font-black text-primary">{formatUsd(lastScannedProduct.salePrice)}</span>
                            <span className="rounded-xl bg-primary/10 px-3 py-1 text-xs font-extrabold text-primary">
                                Qty in cart: {cartItems.find(c => c.productId === lastScannedProduct._id)?.qty || 0}
                            </span>
                        </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center text-muted-foreground">
                     <LuScanBarcode className="mx-auto mb-2 opacity-50" size={32} />
                     <p className="text-sm font-semibold tracking-wide">Waiting for scan...</p>
                  </div>
                )}
              </div>

              {/* Recent Scans */}
              {recentScans.length > 1 && (
                <div>
                    <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">Recent Scans</h2>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                      {recentScans.filter(p => p._id !== lastScannedProduct?._id).map((item) => (
                        <div key={item._id} className="flex flex-col rounded-xl border border-border bg-card p-3 shadow-xs">
                            <div className="aspect-square w-full overflow-hidden rounded-lg bg-muted/30 p-2 flex items-center justify-center mb-2">
                              {item.imageUrl || item.image ? (
                                <img
                                  src={`${baseUrl}/upload/${item.imageUrl || item.image}`}
                                  alt={item.name}
                                  className="h-full w-full object-contain"
                                />
                              ) : (
                                <span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">No Img</span>
                              )}
                            </div>
                            <h4 className="truncate text-center text-xs font-bold text-foreground/90">{item.name}</h4>
                            <div className="mt-1 flex justify-between items-center">
                                <span className="text-sm font-extrabold text-primary">{formatUsd(item.salePrice)}</span>
                                <span className="text-[10px] font-bold bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                                    x{cartItems.find(c => c.productId === item._id)?.qty || 0}
                                </span>
                            </div>
                        </div>
                      ))}
                    </div>
                </div>
              )}


          </div>
        </div>

        {/* Right Cart Panel */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xs lg:sticky lg:top-4 lg:h-[calc(100vh-80px)] transition-colors duration-200">
          {/* Cart Header */}
          <div className="flex items-center justify-between border-b border-border p-4 shrink-0 bg-muted/30">
            <h4 className="font-bold text-lg tracking-tight">Cart</h4>
            <button onClick={() => { setCartItems([]); setLastScannedProduct(null); setRecentScans([]); }} className="text-[11px] font-bold uppercase tracking-wider text-destructive hover:text-destructive/80 transition">
              CLEAR
            </button>
          </div>

          {/* Cart List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/10">
            {cartItems.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center p-8 text-muted-foreground opacity-60">
                <span className="text-5xl mb-3 grayscale">🛒</span>
                <p className="text-sm font-semibold tracking-wide">Your cart is currently empty</p>
              </div>
            ) : (
              cartItems.map((item, idx) => (
                <div key={item.productId || idx} className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 shadow-xs">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h5 className="truncate text-sm font-bold text-foreground flex items-center">
                        {item.name}
                        <select
                          className="h-6 text-[10px] uppercase font-bold border border-border rounded-md px-1 bg-muted text-muted-foreground outline-none ml-2"
                          value={item.baseUnit}
                          onChange={(e) => handleUnitChange(item.productId, e.target.value)}
                        >
                          <option value={item.productData?.unitConfig?.baseUnit?.code || ""}>
                            {item.productData?.unitConfig?.baseUnit?.nameKh || "Base"}
                          </option>
                          {item.productData?.unitConfig?.purchaseUnit && (
                            <option value={item.productData?.unitConfig?.purchaseUnit?.code}>
                              {item.productData?.unitConfig?.purchaseUnit?.nameKh || "Box"}
                            </option>
                          )}
                        </select>
                      </h5>
                      <p className="mt-0.5 text-xs font-semibold text-muted-foreground">{formatUsd(item.price)}</p>
                    </div>
                    <button onClick={() => handleRemoveItem(item.productId)} className="ml-2 flex h-7 w-7 items-center justify-center rounded-lg text-destructive transition hover:bg-destructive/10">
                      ✕
                    </button>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button onClick={() => handleDecrement(item.productId)} className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-sm font-bold text-foreground transition hover:bg-muted active:scale-95">-</button>
                      <span className="w-5 text-center text-sm font-bold">{item.qty}</span>
                      <button onClick={() => handleCartIncrement(item.productId)} className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-sm font-bold text-foreground transition hover:bg-muted active:scale-95">+</button>
                    </div>
                    <span className="text-sm font-extrabold text-foreground">{formatUsd(item.lineTotal)}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Summary Area */}
          <div className="border-t border-border bg-card p-4 shrink-0 shadow-[0_-4px_15px_-10px_rgba(0,0,0,0.1)]">
            <div className="mb-2 flex justify-between text-sm font-semibold text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatUsd(totalCost)}</span>
            </div>
            <div className="mb-4 flex justify-between text-sm font-semibold text-muted-foreground">
              <span>Tax (0%)</span>
              <span>{formatUsd(0)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-border/60 pt-3">
              <span className="text-[13px] font-black uppercase tracking-widest text-foreground">TOTAL</span>
              <span className="text-3xl font-black text-foreground tracking-tight">{formatUsd(totalCost)}</span>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={handlePayment}
                disabled={cartItems.length === 0 || isLoading}
                className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary px-4 text-xs font-extrabold uppercase tracking-widest text-primary-foreground transition hover:bg-primary/95 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
              >
                {isLoading ? "PROCESSING..." : "COMPLETE SALE & PRINT"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Camera Scanner Modal */}
      <Modal open={isCameraOpen} onClose={() => setIsCameraOpen(false)} title="Camera Scanner" size="lg">
        <div className="mt-3">
          {isCameraOpen && (
            <ProductScanner
              onScanSuccess={handleCameraScan}
              onClose={() => setIsCameraOpen(false)}
            />
          )}
          {lastScannedCode && (
            <p className="mt-3 text-center text-xs font-semibold text-muted-foreground">
              Last scanned: <span className="font-bold text-foreground">{lastScannedCode}</span>
            </p>
          )}
        </div>
      </Modal>
    </section>
  );
}

export default POS;
