import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import useFetchData from "../../../hooks/common/useFetchData";
import toast from "react-hot-toast";
import useCollection from "../../../hooks/common/useCollection";
import Modal from "../../../components/ui/Modal";
import ProductScanner from "../../../components/product/ProductScanner";

import { LuScanBarcode } from "react-icons/lu";
import { MdCameraAlt } from "react-icons/md";
import { baseUrl } from "../../../utils/config/env";
import { api } from "../../../utils/config/api";
import Loading from "../../../components/ui/Loading";

function POS() {
  const formatUsd = (value) => `$${Number(value || 0).toFixed(2)}`;
  const [category, setCategory] = useState(null);
  const [condition, setCondition] = useState("");
  const [scanCode, setScanCode] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [open, setOpen] = useState(false);
  const { data: products, isLoading: productsLoading } = useFetchData("products", 1, 50, "", false, condition);
  const { data: categories, isLoading: categoriesLoading } = useFetchData("categories", 1, 50);
  const [totalCost, setTotalCost] = useState(0);
  const { create, isLoading } = useCollection("sales");
  const { create: holdBill, isLoading: holdLoading } = useCollection("held-bills");
  const [printReceipt, setPrintReceipt] = useState(true);
  const [paidAmount, setPaidAmount] = useState(0);
  const [holdOpen, setHoldOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [note, setNote] = useState("");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState("");
  const lastScanTimeRef = useRef(0);
  const lastScanCodeRef = useRef("");
  const scanInputRef = useRef(null);
  const [lastScannedProduct, setLastScannedProduct] = useState(null);
  const [recentScans, setRecentScans] = useState([]);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

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

  const handleHoldBill = async (e) => {
    e.preventDefault();
    if (cartItems.length <= 0) return toast.error("Cart is empty!");

    const currentTotal = cartItems.reduce((acc, item) => acc + item.lineTotal, 0);
    const payload = {
      customerName,
      note,
      items: cartItems.map((item) => ({
        product: item.productId,
        name: item.name,
        saleUnit: item.baseUnit,
        quantity: Number(item.qty),
        unitPrice: Number(item.price),
        totalPrice: Number(item.lineTotal)
      })),
      totalCost: Number(currentTotal)
    };

    try {
      const res = await holdBill(payload);
      if (res) {
        toast.success("Order held successfully!");
        setHoldOpen(false);
        setCustomerName("");
        setNote("");
        setCartItems([]);
        if (searchParams.get('heldBill')) {
          navigate("/cashier/hold-orders");
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to hold bill");
    }
  };

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

  const handlePayment = async (e) => {
    e.preventDefault();
    if (cartItems.length <= 0) return toast.error("Please add product to cart!");

    const paid = Number(paidAmount || 0);
    const currentTotal = cartItems.reduce((acc, item) => acc + item.lineTotal, 0);
    if (paid < currentTotal) {
      return toast.error("Paid amount must be greater than or equal to total amount");
    }

    const payload = {
      items: cartItems.map((item) => ({
        product: item.productId,
        quantity: Number(item.qty),
        saleUnit: item.baseUnit,
        unitPrice: Number(item.price),
        totalPrice: Number(item.lineTotal)
      })),
      totalCost: Number(currentTotal),
      paidAmount: paid
    };

    try {
      const res = await create(payload);
      if (res) {
        if (searchParams.get('heldBill')) {
          try {
            await api.patch(`/held-bills/${searchParams.get('heldBill')}/complete`, { completedSale: res._id });
          } catch (e) { console.error("Failed to complete held bill", e); }
        }

        toast.success("Sale created successfully!");
        setOpen(false);
        setPaidAmount(0);
        setTotalCost(0);
        setCartItems([]);
        if (printReceipt) {
          window.open(`/cashier/invoice/${res._id}`, '_blank');
        }
        if (searchParams.get('heldBill')) {
          navigate("/cashier/pos"); // clear query param
        }
        if (scanInputRef.current) setTimeout(() => scanInputRef.current.focus(), 100);
      }
    } catch (error) {
      const serverMsg = error.response?.data?.details || error.response?.data?.message || error.response?.data?.error || "Sale submission failed";
      let errorMessage = serverMsg; // Default to generic message
      if (error.response) {
        if (error.response.status === 404) {
          const htmlData = error.response.data;
          const match = htmlData.match(/<pre>Cannot POST (\/[^<]+)<\/pre>/);
          errorMessage = match && match[1] ? `API endpoint '${match[1]}' not found or does not support POST requests. Please check the server status and API route configuration.` : "API endpoint not found. Please check the server status and API route configuration.";
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

  const handleCategoryFilter = (catId) => {
    setCategory(catId);
    setCondition(catId ? `category=${catId}` : "");
  };

  useEffect(() => {
    setTotalCost(cartItems.reduce((acc, item) => acc + item.lineTotal, 0));
  }, [cartItems]);

  if (productsLoading || categoriesLoading) return <Loading />;

  return (
    <section className="min-h-[calc(100vh-64px)] bg-background text-foreground transition-colors duration-200">
      <div className="grid grid-cols-1 gap-4 p-3 lg:grid-cols-[minmax(0,1fr)_380px] xl:gap-6 xl:p-6">

        {/* Left Product Browser / Scanned View */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition-colors duration-200">
          {/* Header with Search */}
          <div className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between bg-muted/30">
            <h1 className="text-lg font-extrabold tracking-tight">Scan Product</h1>
            <div className="flex w-full items-center gap-2 sm:w-auto">
              <div className="relative flex flex-1 items-center sm:w-60">
                <LuScanBarcode className="absolute left-3 text-muted-foreground" size={18} />
                <input
                  ref={scanInputRef}
                  autoFocus
                  className="h-10 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/60"
                  onChange={(e) => setScanCode(e.target.value)}
                  value={scanCode}
                  onKeyDown={handleScanKeyDown}
                  placeholder="Scan barcode or enter SKU"
                />
              </div>
              <button
                onClick={() => setIsCameraOpen(true)}
                type="button"
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-xs font-extrabold uppercase tracking-wider text-primary-foreground transition hover:bg-primary/90 active:scale-[0.98] shrink-0"
              >
                <MdCameraAlt size={18} />
                <span className="hidden sm:inline">Camera</span>
              </button>
            </div>
          </div>

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

              {/* Categories (Fallback) */}
              <div className="mt-8 pt-6 border-t border-border">
                  <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">Manual Browse</h2>
                  <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
                    <button
                      onClick={() => handleCategoryFilter(null)}
                      className={`inline-flex h-9 shrink-0 items-center justify-center rounded-xl border px-4 text-xs font-bold uppercase tracking-wider transition ${!category ? 'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20' : 'border-border bg-transparent text-foreground/80 hover:border-primary/40 hover:bg-primary/5 hover:text-primary'}`}
                    >
                      All
                    </button>
                    {categories?.map((cat) => (
                      <button
                        key={cat._id}
                        onClick={() => handleCategoryFilter(cat._id)}
                        className={`inline-flex h-9 shrink-0 items-center justify-center rounded-xl border px-4 text-xs font-bold uppercase tracking-wider transition ${category === cat._id ? 'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20' : 'border-border bg-transparent text-foreground/80 hover:border-primary/40 hover:bg-primary/5 hover:text-primary'}`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                  
                  {/* Product Grid (Fallback) */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 mt-2">
                    {products?.length === 0 ? (
                      <div className="col-span-full py-12 text-center text-sm font-medium text-muted-foreground">
                        No products found
                      </div>
                    ) : (
                      products?.map((item) => (
                        <div key={item._id} onClick={() => addToCart(item)} className="group flex cursor-pointer flex-col rounded-xl border border-border bg-card p-2 shadow-xs transition hover:border-primary/50 hover:shadow-sm active:scale-[0.98]">
                          <div className="aspect-square w-full overflow-hidden rounded-lg bg-muted/30 p-2 flex items-center justify-center mb-2">
                            {item.imageUrl || item.image ? (
                              <img
                                src={`${baseUrl}/upload/${item.imageUrl || item.image}`}
                                alt={item.name}
                                className="h-full w-full object-contain transition-transform group-hover:scale-105"
                              />
                            ) : (
                              <span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">No Img</span>
                            )}
                          </div>
                          <h4 className="truncate text-center text-[11px] font-bold text-foreground/90">{item.name}</h4>
                          <p className="mt-0.5 text-center text-xs font-extrabold text-primary">{formatUsd(item.salePrice)}</p>
                        </div>
                      ))
                    )}
                  </div>
              </div>
          </div>
        </div>

        {/* Right Cart Panel */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xs lg:sticky lg:top-4 lg:h-[calc(100vh-80px)] transition-colors duration-200">
          {/* Cart Header */}
          <div className="flex items-center justify-between border-b border-border p-4 shrink-0 bg-muted/30">
            <h4 className="font-bold text-lg tracking-tight">Cart</h4>
            <button onClick={() => setCartItems([])} className="text-[11px] font-bold uppercase tracking-wider text-destructive hover:text-destructive/80 transition">
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
                onClick={() => setHoldOpen(true)}
                disabled={cartItems.length === 0 || isLoading || holdLoading}
                className="inline-flex h-12 flex-1 items-center justify-center rounded-xl border-2 border-primary/20 bg-background px-4 text-xs font-extrabold uppercase tracking-widest text-primary transition hover:border-primary/40 hover:bg-primary/5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                HOLD
              </button>
              <button
                onClick={() => setOpen(true)}
                disabled={cartItems.length === 0 || isLoading || holdLoading}
                className="inline-flex h-12 flex-[2] items-center justify-center rounded-xl bg-primary px-4 text-xs font-extrabold uppercase tracking-widest text-primary-foreground transition hover:bg-primary/95 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
              >
                COMPLETE SALE
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <Modal open={open} onClose={() => setOpen(false)} title="Payment">
        <form onSubmit={handlePayment} className="mt-2 text-foreground">
          <input
            type="number"
            value={paidAmount || ""}
            onChange={(e) => setPaidAmount(Number(e.target.value) || 0)}
            className="mb-4 h-12 w-full rounded-xl border border-border bg-background px-4 text-sm font-semibold outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/60"
            placeholder="Paid Amount ($)"
            autoFocus
          />

          <div className="mb-5 space-y-3 rounded-xl bg-muted/40 p-5 border border-border/50">
            <div className="flex justify-between text-sm font-bold text-emerald-500">
              <span className="uppercase tracking-wider text-[11px]">Change:</span>
              <span className="text-lg">{formatUsd(Math.max(0, Number(paidAmount || 0) - totalCost))}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-destructive">
              <span className="uppercase tracking-wider text-[11px]">Due:</span>
              <span className="text-lg">{formatUsd(Math.max(0, totalCost - Number(paidAmount || 0)))}</span>
            </div>
          </div>

          <div className="mb-5 flex items-center gap-3 px-1">
            <input
              type="checkbox"
              id="print-receipt"
              checked={printReceipt}
              onChange={(e) => setPrintReceipt(e.target.checked)}
              className="h-5 w-5 cursor-pointer rounded border-border text-primary transition focus:ring-primary/50"
            />
            <label htmlFor="print-receipt" className="cursor-pointer select-none text-sm font-bold text-foreground">Print Receipt</label>
          </div>

          <button
            type="submit"
            disabled={isLoading || cartItems.length === 0}
            className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-extrabold uppercase tracking-wider text-primary-foreground transition hover:bg-primary/95 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Processing..." : "PAY NOW"}
          </button>
        </form>
      </Modal>

      {/* Hold Order Modal */}
      <Modal open={holdOpen} onClose={() => setHoldOpen(false)} title="Hold Order">
        <form onSubmit={handleHoldBill} className="mt-2 text-foreground">
          <div className="mb-4">
            <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">Customer Name (Optional)</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/60"
              placeholder="Enter customer name..."
              autoFocus
            />
          </div>
          <div className="mb-5">
            <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">Note (Optional)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="h-24 w-full resize-none rounded-xl border border-border bg-background p-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/60"
              placeholder="Add any notes for this held order..."
            />
          </div>
          <button
            type="submit"
            disabled={holdLoading || cartItems.length === 0}
            className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-extrabold uppercase tracking-wider text-primary-foreground transition hover:bg-primary/95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {holdLoading ? "Saving..." : "CONFIRM HOLD"}
          </button>
        </form>
      </Modal>

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
