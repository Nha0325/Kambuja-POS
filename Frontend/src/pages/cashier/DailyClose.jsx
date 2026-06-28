import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { api } from "../../utils/config/api";
import { FaMoneyBillWave, FaReceipt, FaCoins, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { cashierService } from "../../services/users/cashier.service";

const formatUsd = (value) => {
  const num = Number(value || 0);
  return num < 0 ? `-$${Math.abs(num).toFixed(2)}` : `$${num.toFixed(2)}`;
};

function DailyClose() {
  const [sales, setSales] = useState([]);
  const [countedCash, setCountedCash] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isClosed, setIsClosed] = useState(false);
  const [closedData, setClosedData] = useState(null);

  const fetchSales = useCallback(async () => {
    if (isClosed) return;
    try {
      const response = await cashierService.todaySales();
      setSales(response.data?.result || []);
    } catch (err) {
      console.error("Failed to fetch today sales", err);
    } finally {
      setIsLoading(false);
    }
  }, [isClosed]);

  useEffect(() => {
    fetchSales();
    const timer = setInterval(fetchSales, 10000);
    return () => clearInterval(timer);
  }, [fetchSales]);

  const salesCount = sales.length;
  const totalSales = sales.reduce((sum, sale) => sum + Number(sale.totalCost || 0), 0);
  const paidAmount = sales.reduce((sum, sale) => sum + Number(sale.paidAmount || 0), 0);
  const dueAmount = sales.reduce((sum, sale) => sum + Number(sale.dueAmount || 0), 0);
  const expectedCash = paidAmount;
  const countedCashNumber = Number(countedCash || 0);
  const difference = countedCashNumber - expectedCash;

  const handleClose = async () => {
    if (!window.confirm("Are you sure you want to close this shift?")) return;
    
    const payload = {
      salesCount,
      totalSales,
      paidAmount,
      dueAmount,
      expectedCash,
      countedCash: countedCashNumber,
      difference,
      note
    };

    try {
      setIsSubmitting(true);
      const res = await api.post("/daily-close/close", payload);
      
      if (res.data?.success || res.status === 200 || res.status === 201) {
        toast.success("Shift closed successfully!");
        setIsClosed(true);
        setClosedData({
          closedAt: new Date().toISOString(),
          note,
          ...payload
        });
      } else {
        toast.error(res.data?.message || "Failed to close shift. Endpoint may not be ready.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Daily close save endpoint is not ready yet.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayStats = isClosed && closedData ? closedData : {
    salesCount,
    totalSales,
    paidAmount,
    dueAmount,
    expectedCash,
    countedCash: countedCashNumber,
    difference
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f8f9ff] p-4 lg:p-8 text-[#0b1c30]">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Shift</h1>
          <p className="text-sm text-[#45464d] mt-1">Review your shift sales and balance your cash drawer.</p>
        </div>
        {isClosed && (
          <div className="flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-700">
            <FaCheckCircle />
            <span>Shift Closed</span>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">

        {/* Left: Summary */}
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-[#d7dced] bg-white p-5 shadow-sm">
              <div className="mb-2 flex items-center gap-2 text-[#76777d]">
                <FaReceipt />
                <span className="text-sm font-semibold uppercase tracking-wider">Sales Count</span>
              </div>
              <p className="text-2xl font-bold text-[#131b2e]">{displayStats.salesCount}</p>
            </div>

            <div className="rounded-xl border border-[#d7dced] bg-white p-5 shadow-sm">
              <div className="mb-2 flex items-center gap-2 text-[#76777d]">
                <FaMoneyBillWave />
                <span className="text-sm font-semibold uppercase tracking-wider">Total Sales</span>
              </div>
              <p className="text-2xl font-bold text-[#0058be]">{formatUsd(displayStats.totalSales)}</p>
            </div>

            <div className="rounded-xl border border-[#d7dced] bg-white p-5 shadow-sm">
              <div className="mb-2 flex items-center gap-2 text-[#76777d]">
                <FaCoins />
                <span className="text-sm font-semibold uppercase tracking-wider">Paid Amount</span>
              </div>
              <p className="text-2xl font-bold text-[#009668]">{formatUsd(displayStats.paidAmount)}</p>
            </div>

            <div className="rounded-xl border border-[#d7dced] bg-white p-5 shadow-sm">
              <div className="mb-2 flex items-center gap-2 text-[#76777d]">
                <FaExclamationTriangle />
                <span className="text-sm font-semibold uppercase tracking-wider">Due Amount</span>
              </div>
              <p className="text-2xl font-bold text-[#ba1a1a]">{formatUsd(displayStats.dueAmount)}</p>
            </div>
          </div>
        </div>

        {/* Right: Close Form */}
        <div className="rounded-xl border border-[#d7dced] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-4 border-b border-[#e5e7ef] pb-3">Drawer Balance</h2>

          <div className="mb-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-[#45464d]">Expected Cash</span>
              <span className="font-bold">{formatUsd(displayStats.expectedCash)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-[#45464d]">Counted Cash</span>
              <span className="font-bold">{formatUsd(displayStats.countedCash)}</span>
            </div>
            <div className={`flex justify-between border-t border-[#e5e7ef] pt-3 text-base font-bold ${displayStats.difference < 0 ? 'text-[#ba1a1a]' : displayStats.difference > 0 ? 'text-[#0058be]' : 'text-[#009668]'}`}>
              <span>Difference</span>
              <span>{displayStats.difference > 0 ? '+' : ''}{formatUsd(displayStats.difference)}</span>
            </div>
          </div>

          {!isClosed ? (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-bold text-[#0b1c30]">Actual Counted Cash ($)</label>
                <input
                  type="number"
                  value={countedCash}
                  onChange={(e) => setCountedCash(e.target.value)}
                  className="h-11 w-full rounded-lg border border-[#c6c6cd] bg-white px-3 text-sm outline-none transition focus:border-[#0058be] focus:ring-4 focus:ring-[#0058be]/10"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold text-[#0b1c30]">Note (Optional)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="h-20 w-full resize-none rounded-lg border border-[#c6c6cd] bg-white p-3 text-sm outline-none transition focus:border-[#0058be] focus:ring-4 focus:ring-[#0058be]/10"
                  placeholder="Explain any differences..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setIsLoading(true);
                    fetchSales();
                  }}
                  disabled={isLoading}
                  className="h-12 flex-1 rounded-xl border border-[#c6c6cd] bg-white text-sm font-bold uppercase tracking-wider text-[#45464d] transition hover:bg-[#f8f9ff] disabled:opacity-50"
                >
                  {isLoading ? "..." : "Refresh"}
                </button>
                <button
                  onClick={handleClose}
                  disabled={isSubmitting || countedCash === "" || salesCount === 0}
                  className="h-12 flex-[2] rounded-xl bg-[#131b2e] text-sm font-bold uppercase tracking-wider text-white transition hover:bg-[#213145] disabled:opacity-50"
                >
                  Close Day
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-lg bg-[#f8f9ff] p-4 text-center border border-[#e5e7ef]">
              <p className="text-sm font-medium text-[#45464d]">
                Closed at {new Date(closedData.closedAt).toLocaleString()}
              </p>
              {closedData.note && (
                <p className="mt-2 text-xs italic text-[#76777d]">"{closedData.note}"</p>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default DailyClose;
