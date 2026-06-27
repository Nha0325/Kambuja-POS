import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import useFetchData from "../../hooks/useFetchData";
import { useCheckStock } from "../../hooks/useCheckStock";
import toast from "react-hot-toast";
import useCollection from "../../hooks/useCollection";
import Modal from "../../components/Modal";
import useFetchOneByCode from "../../hooks/useFetchOneByCode";
import { LuScanBarcode } from "react-icons/lu";
import { baseUrl } from "../../configs/env";
import { api } from "../../configs/api";
import Loading from "../../components/Loading";

function POS() {
  const formatUsd = (value) => `$${Number(value || 0).toFixed(2)}`;
  const [category, setCategory] = useState(null);
  const [condition, setCondition] = useState("");
  const [search, setSearch] = useState("");
  const [carts, setCarts] = useState([]);
  const [open, setOpen] = useState(false);
  const { data: products, isLoading: productsLoading } = useFetchData("products", 1, 50, "", condition, false);
  const { data: categories, isLoading: categoriesLoading } = useFetchData("categories", 1, 50);
  const { checkStock } = useCheckStock();
  const [totalCost, setTotalCost] = useState(0);
  const { create, isLoading } = useCollection("sales");
  const { create: holdBill, isLoading: holdLoading } = useCollection("held-bills");
  const [printReceipt, setPrintReceipt] = useState(true);
  const [paidAmount, setPaidAmount] = useState(0);
  const [holdOpen, setHoldOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [note, setNote] = useState("");

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { fetchData } = useFetchOneByCode();
  useEffect(() => {
    const fetchHeldBill = async () => {
      const heldId = searchParams.get('heldBill');
      if (!heldId) return;
      try {
        const res = await api.get(`/held-bills/${heldId}`);
        const data = res.data;
        if (data.success && data.result) {
          setCarts(data.result.items.map(item => ({
            product: item.product,
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice
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
    if (carts.length <= 0) return toast.error("Cart is empty!");

    const currentTotal = carts.reduce((acc, item) => acc + item.totalPrice, 0);
    const payload = {
      customerName,
      note,
      items: carts.map(({ product, name, quantity, unitPrice, totalPrice }) => ({
        product,
        name,
        quantity: Number(quantity),
        unitPrice: Number(unitPrice),
        totalPrice: Number(totalPrice)
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
        setCarts([]);
        if (searchParams.get('heldBill')) {
          navigate("/cashier/hold-orders");
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to hold bill");
    }
  };

  const handleAddToCart = async (item) => {
    if (!item) return;

    // Determine current quantity in cart to check stock accurately
    const exist = carts.find((el) => el.product === item._id);
    const currentQty = exist ? exist.quantity : 0;

    const res = await checkStock(item._id, currentQty + 1);

    if (res?.success) {
      setCarts((prevCarts) => {
        // Re-check existence inside the state setter to handle rapid consecutive clicks/scans
        const alreadyInCart = prevCarts.find((el) => el.product === item._id);
        if (alreadyInCart) {
          return prevCarts.map((el) =>
            el.product === item._id
              ? { ...el, quantity: el.quantity + 1, totalPrice: (el.quantity + 1) * el.unitPrice }
              : el
          );
        }
        return [
          ...prevCarts,
          {
            product: item._id,
            name: item.name,
            quantity: 1,
            unitPrice: item.salePrice,
            totalPrice: item.salePrice,
          },
        ];
      });
    }
  };

  const handleCartIncrement = async (id) => {
    const item = carts.find((el) => el.product === id);
    if (item) {
      const res = await checkStock(id, item.quantity + 1);
      if (res?.success) handleIncrement(id);
    }
  };

  const handleAddToCartKeyDown = async (e) => {
    if (e.key === "Enter") {
      if (!search.trim()) return;
      const res = await fetchData("/products/code", search.toLocaleLowerCase());
      if (res) handleAddToCart(res);
      else toast.error("រកមិនឃើញកូដទំនិញនេះទេ!");
      setSearch("");
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (carts.length <= 0) return toast.error("Please add product to cart!");

    const paid = Number(paidAmount || 0);
    // Recalculate total cost to ensure accuracy during submission
    const currentTotal = carts.reduce((acc, item) => acc + item.totalPrice, 0);
    if (paid < currentTotal) {
      return toast.error("Paid amount must be greater than or equal to total amount");
    }

    const payload = {
      items: carts.map(({ product, quantity, unitPrice, totalPrice }) => ({
        product,
        quantity: Number(quantity),
        unitPrice: Number(unitPrice),
        totalPrice: Number(totalPrice)
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
        setCarts([]);
        if (printReceipt) {
          window.open(`/cashier/invoice/${res._id}`, '_blank');
        }
        if (searchParams.get('heldBill')) {
          navigate("/cashier/pos"); // clear query param
        }
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

  const handleIncrement = (id) => {
    setCarts(prev => prev.map(el => el.product === id ? { ...el, quantity: el.quantity + 1, totalPrice: (el.quantity + 1) * el.unitPrice } : el));
  };

  const handleDecrement = (id) => {
    setCarts(prev => prev.map(el => el.product === id && el.quantity > 1 ? { ...el, quantity: el.quantity - 1, totalPrice: (el.quantity - 1) * el.unitPrice } : el));
  };

  const handleRemoveItem = (id) => setCarts(prev => prev.filter(el => el.product !== id));

  const handleCategoryFilter = (catId) => {
    setCategory(catId);
    setCondition(catId ? `category=${catId}` : "");
  };

  useEffect(() => {
    setTotalCost(carts.reduce((acc, item) => acc + item.totalPrice, 0));
  }, [carts]);

  if (productsLoading || categoriesLoading) return <Loading />;

  return (
    <section className="min-h-[calc(100vh-64px)] bg-background text-foreground transition-colors duration-200">
      <div className="grid grid-cols-1 gap-4 p-3 lg:grid-cols-[minmax(0,1fr)_380px] xl:gap-6 xl:p-6">

        {/* Left Product Browser */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition-colors duration-200">
          {/* Header */}
          <div className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between bg-muted/30">
            <h1 className="text-lg font-extrabold tracking-tight">Categories</h1>
            <div className="relative flex w-full items-center sm:w-72">
              <LuScanBarcode className="absolute left-3 text-muted-foreground" size={18} />
              <input
                className="h-10 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/60"
                onChange={(e) => setSearch(e.target.value)}
                value={search}
                onKeyDown={handleAddToCartKeyDown}
                placeholder="Scan code..."
              />
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex gap-2 overflow-x-auto border-b border-border p-4 scrollbar-hide bg-card">
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

          {/* Product Grid */}
          <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 bg-muted/10">
            {products?.length === 0 ? (
              <div className="col-span-full py-12 text-center text-sm font-medium text-muted-foreground">
                No products found
              </div>
            ) : (
              products?.map((item) => (
                <div key={item._id} onClick={() => handleAddToCart(item)} className="group flex cursor-pointer flex-col rounded-2xl border border-border bg-card p-3 shadow-xs transition hover:border-primary/50 hover:shadow-sm active:scale-[0.98]">
                  <div className="aspect-square overflow-hidden rounded-xl border border-border/50 bg-muted/30 p-3 flex items-center justify-center">
                    {item.imageUrl ? (
                      <img
                        src={`${baseUrl}/upload/${item.imageUrl}`}
                        alt={item.name}
                        className="h-full w-full object-contain transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">No Image</span>
                    )}
                  </div>
                  <h4 className="mt-3 truncate text-center text-sm font-bold text-foreground/90">{item.name}</h4>
                  <p className="mt-1 text-center text-base font-extrabold text-primary">{formatUsd(item.salePrice)}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Cart Panel */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xs lg:sticky lg:top-4 lg:h-[calc(100vh-80px)] transition-colors duration-200">
          {/* Cart Header */}
          <div className="flex items-center justify-between border-b border-border p-4 shrink-0 bg-muted/30">
            <h4 className="font-bold text-lg tracking-tight">Cart</h4>
            <button onClick={() => setCarts([])} className="text-[11px] font-bold uppercase tracking-wider text-destructive hover:text-destructive/80 transition">
              CLEAR
            </button>
          </div>

          {/* Cart List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/10">
            {carts.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center p-8 text-muted-foreground opacity-60">
                <span className="text-5xl mb-3 grayscale">🛒</span>
                <p className="text-sm font-semibold tracking-wide">Your cart is currently empty</p>
              </div>
            ) : (
              carts.map((item, idx) => (
                <div key={item.product || idx} className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 shadow-xs">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h5 className="truncate text-sm font-bold text-foreground">{item.name}</h5>
                      <p className="mt-0.5 text-xs font-semibold text-muted-foreground">{formatUsd(item.unitPrice)}</p>
                    </div>
                    <button onClick={() => handleRemoveItem(item.product)} className="ml-2 flex h-7 w-7 items-center justify-center rounded-lg text-destructive transition hover:bg-destructive/10">
                      ✕
                    </button>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button onClick={() => handleDecrement(item.product)} className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-sm font-bold text-foreground transition hover:bg-muted active:scale-95">-</button>
                      <span className="w-5 text-center text-sm font-bold">{item.quantity}</span>
                      <button onClick={() => handleCartIncrement(item.product)} className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-sm font-bold text-foreground transition hover:bg-muted active:scale-95">+</button>
                    </div>
                    <span className="text-sm font-extrabold text-foreground">{formatUsd(item.totalPrice)}</span>
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
                disabled={carts.length === 0 || isLoading || holdLoading}
                className="inline-flex h-12 flex-1 items-center justify-center rounded-xl border-2 border-primary/20 bg-background px-4 text-xs font-extrabold uppercase tracking-widest text-primary transition hover:border-primary/40 hover:bg-primary/5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                HOLD
              </button>
              <button
                onClick={() => setOpen(true)}
                disabled={carts.length === 0 || isLoading || holdLoading}
                className="inline-flex h-12 flex-[2] items-center justify-center rounded-xl bg-primary px-4 text-xs font-extrabold uppercase tracking-widest text-primary-foreground transition hover:bg-primary/95 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
              >
                PURCHASE
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
            disabled={isLoading || carts.length === 0}
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
            disabled={holdLoading || carts.length === 0}
            className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-extrabold uppercase tracking-wider text-primary-foreground transition hover:bg-primary/95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {holdLoading ? "Saving..." : "CONFIRM HOLD"}
          </button>
        </form>
      </Modal>
    </section>
  );
}

export default POS;
