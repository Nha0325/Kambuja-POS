import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { api } from "../../utils/config/api";
import { FaMoneyBillWave, FaReceipt, FaCheckCircle } from "react-icons/fa";
import { cashierService } from "../../services/users/cashier.service";
import useSignout from "../../hooks/auth/useSignout";
import { useConfirm } from "../../hooks/ui/useConfirm";
import { useTranslation } from "react-i18next";

const formatUsd = (value) => {
  const num = Number(value || 0);
  return num < 0 ? `-$${Math.abs(num).toFixed(2)}` : `$${num.toFixed(2)}`;
};

function DailyClose() {
  const { t } = useTranslation();
  const { signout } = useSignout();
  const { confirm, closeConfirm } = useConfirm();
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
    const isConfirmed = await confirm({
      title: t('close_shift_title'),
      message: t('close_shift_msg'),
      confirmText: t('yes_close_shift'),
      cancelText: t('cancel'),
      variant: "primary"
    });
    
    if (!isConfirmed) return;
    
    const payload = {
      salesCount,
      totalSales,
      paidAmount,
      dueAmount,
      expectedCash,
      cashCounted: countedCashNumber,
      difference,
      note
    };

    try {
      setIsSubmitting(true);
      const res = await api.post("/daily-close/close", payload);
      
      if (res.data?.success || res.status === 200 || res.status === 201) {
        setIsClosed(true);
        setClosedData({
          closedAt: new Date().toISOString(),
          note,
          ...payload
        });

        // Trigger print and then logout
        setTimeout(() => {
          window.print();
          setTimeout(async () => {
            await signout();
            window.location.href = '/login';
          }, 1000); // Logout shortly after print dialog returns
        }, 500);
      } else {
        toast.error(res.data?.message || "Failed to close shift. Endpoint may not be ready.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Daily close save endpoint is not ready yet.");
    } finally {
      setIsSubmitting(false);
      closeConfirm();
    }
  };

  const displayStats = isClosed && closedData ? closedData : {
    salesCount,
    totalSales,
    paidAmount,
    dueAmount,
    expectedCash,
    cashCounted: countedCashNumber,
    difference
  };

  const printStats = displayStats;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background p-4 lg:p-8 text-foreground">

      {/* ===== PRINT ONLY RECEIPT ===== */}
      <div className="hidden print:block font-mono text-[12px] text-black bg-white w-[300px] mx-auto p-4">
        <div className="text-center mb-3">
          <p className="text-[15px] font-bold tracking-wide">Kambuja POS</p>
          <p className="text-[11px] text-gray-500 uppercase tracking-widest">{t('shift_close_report')}</p>
          <p className="text-[11px] mt-1">
            {isClosed && closedData ? new Date(closedData.closedAt).toLocaleString() : new Date().toLocaleString()}
          </p>
        </div>
        <div className="border-t border-dashed border-gray-400 my-2" />
        <div className="flex justify-between py-0.5"><span>{t('sales_count')}</span><span className="font-bold">{printStats.salesCount}</span></div>
        <div className="flex justify-between py-0.5"><span>{t('total_sales')}</span><span className="font-bold">{formatUsd(printStats.totalSales)}</span></div>
        <div className="border-t border-dashed border-gray-400 my-2" />
        <div className="flex justify-between py-0.5"><span>{t('expected_cash')}</span><span className="font-bold">{formatUsd(printStats.expectedCash)}</span></div>
        <div className="flex justify-between py-0.5"><span>{t('counted_cash')}</span><span className="font-bold">{formatUsd(printStats.cashCounted)}</span></div>
        <div className="border-t border-gray-400 my-1" />
        <div className="flex justify-between py-1 font-bold">
          <span>{t('difference')}</span>
          <span>
            {printStats.difference > 0 ? '+' : ''}{formatUsd(printStats.difference)}
            {printStats.difference < 0 ? ` ⚠ ${t('shortage')}` : printStats.difference > 0 ? ` ${t('surplus')}` : ' ✓ OK'}
          </span>
        </div>
        {printStats.note && (
          <>
            <div className="border-t border-dashed border-gray-400 my-2" />
            <p className="text-[11px] italic text-gray-600">Note: "{printStats.note}"</p>
          </>
        )}
        <div className="border-t border-dashed border-gray-400 my-2" />
        <p className="text-center text-[10px] text-gray-400">— {t('shift_closed')} —</p>
      </div>
      {/* ===== END PRINT ONLY ===== */}

      {/* ===== SCREEN ONLY ===== */}
      <div className="print:hidden">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('my_shift')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('my_shift_desc')}</p>
        </div>
        {isClosed && (
          <div className="flex items-center gap-2 rounded-full bg-green-100 dark:bg-emerald-500/10 px-4 py-2 text-sm font-bold text-green-700 dark:text-emerald-400">
            <FaCheckCircle />
            <span>{t('shift_closed')}</span>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">

        {/* Left: Summary */}
        <div className="space-y-6">
          <div className="grid gap-4 grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                <FaReceipt />
                <span className="text-sm font-semibold uppercase tracking-wider">{t('sales_count')}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{displayStats.salesCount}</p>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                <FaMoneyBillWave />
                <span className="text-sm font-semibold uppercase tracking-wider">{t('total_sales')}</span>
              </div>
              <p className="text-2xl font-bold text-primary">{formatUsd(displayStats.totalSales)}</p>
            </div>
          </div>
        </div>

        {/* Right: Close Form */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-4 border-b border-border pb-3">{t('drawer_balance')}</h2>

          <div className="mb-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-muted-foreground">{t('expected_cash')}</span>
              <span className="font-bold">{formatUsd(displayStats.expectedCash)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-muted-foreground">{t('counted_cash')}</span>
              <span className="font-bold">{formatUsd(displayStats.cashCounted)}</span>
            </div>
            <div className={`flex justify-between border-t border-border pt-3 text-base font-bold ${displayStats.difference < 0 ? 'text-destructive' : displayStats.difference > 0 ? 'text-primary' : 'text-emerald-600 dark:text-emerald-500'}`}>
              <span>{t('difference')}</span>
              <span>{displayStats.difference > 0 ? '+' : ''}{formatUsd(displayStats.difference)}</span>
            </div>
          </div>

          {!isClosed ? (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-bold text-foreground">{t('actual_counted_cash')}</label>
                <input
                  type="number"
                  value={countedCash}
                  onChange={(e) => setCountedCash(e.target.value)}
                  className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/20 placeholder:text-muted-foreground"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold text-foreground">{t('note_optional')}</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="h-20 w-full resize-none rounded-lg border border-border bg-background p-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/20 placeholder:text-muted-foreground"
                  placeholder={t('explain_differences')}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setIsLoading(true);
                    fetchSales();
                  }}
                  disabled={isLoading}
                  className="h-12 flex-1 rounded-xl border border-[#c6c6cd] dark:border-[#27272a] bg-white dark:bg-[#111113] text-sm font-bold uppercase tracking-wider text-[#45464d] dark:text-[#a1a1aa] transition hover:bg-[#f8f9ff] dark:hover:bg-[#18181b] disabled:opacity-50"
                >
                  {isLoading ? "..." : t('refresh')}
                </button>
                <button
                  onClick={handleClose}
                  disabled={isSubmitting || countedCash === "" || salesCount === 0}
                  className="h-12 flex-[2] rounded-xl bg-[#131b2e] dark:bg-[#06b6d4] text-sm font-bold uppercase tracking-wider text-white transition hover:bg-[#213145] dark:hover:bg-[#8B5CF6] disabled:opacity-50"
                >
                  {t('close_day')}
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-lg bg-[#f8f9ff] dark:bg-[#09090b] p-4 text-center border border-[#e5e7ef] dark:border-[#27272a]">
              <p className="text-sm font-medium text-[#45464d] dark:text-[#a1a1aa]">
                {t('closed_at')} {new Date(closedData.closedAt).toLocaleString()}
              </p>
              {closedData.note && (
                <p className="mt-2 text-xs italic text-[#76777d] dark:text-[#71717a]">"{closedData.note}"</p>
              )}
            </div>
          )}
        </div>

      </div>
      </div>{/* end screen only */}
    </div>
  );
}

export default DailyClose;
