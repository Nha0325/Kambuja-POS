import { useMemo, useState } from "react";
import useFetchData from "../../hooks/useFetchData";
import formatUsd from "../../utils/formatCurrency";
import Loading from "../../components/Loading";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../../configs/api";
import {
  FaCalendarDay,
  FaCashRegister,
  FaClipboardList,
  FaPlay,
  FaSearch,
  FaTrashAlt,
  FaUser,
} from "react-icons/fa";

const getBills = (data) => (Array.isArray(data) ? data : []);

const getCustomerName = (bill) => bill?.customerName?.trim() || "Walk-in Customer";

const getCashierName = (bill) => {
  if (bill?.cashier && typeof bill.cashier === "object") {
    return bill.cashier.username || bill.cashier.name || "-";
  }

  return "-";
};

const getItemCount = (bill) => {
  const items = Array.isArray(bill?.items) ? bill.items : [];
  const quantityCount = items.reduce((total, item) => total + Number(item.quantity || 0), 0);

  return quantityCount || items.length;
};

const formatHeldTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const isHeldToday = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  return date.toDateString() === new Date().toDateString();
};

function HoldBills() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [cashierFilter, setCashierFilter] = useState("");
  const [todayOnly, setTodayOnly] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { data, isLoading } = useFetchData("held-bills", 1, 100, "", refreshKey);

  const bills = getBills(data);
  const cashierOptions = useMemo(() => {
    return [...new Set(bills.map(getCashierName).filter((name) => name !== "-"))];
  }, [bills]);

  const filteredBills = useMemo(() => {
    const query = search.trim().toLowerCase();

    return bills.filter((bill) => {
      const cashierName = getCashierName(bill);
      const matchesSearch = !query
        || bill.holdNumber?.toLowerCase().includes(query)
        || getCustomerName(bill).toLowerCase().includes(query);
      const matchesCashier = !cashierFilter || cashierName === cashierFilter;
      const matchesToday = !todayOnly || isHeldToday(bill.createdAt);

      return matchesSearch && matchesCashier && matchesToday;
    });
  }, [bills, cashierFilter, search, todayOnly]);

  const hasFilters = Boolean(search.trim() || cashierFilter || todayOnly);

  const clearFilters = () => {
    setSearch("");
    setCashierFilter("");
    setTodayOnly(false);
  };

  const handleResume = (id) => {
    navigate(`/cashier/pos?heldBill=${id}`);
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this held order?")) return;

    try {
      const res = await api.patch(`/held-bills/${id}/cancel`);
      const result = res.data;

      if (result.success) {
        toast.success("Held order cancelled!");
        setRefreshKey((current) => current + 1);
      } else {
        toast.error(result.message || "Failed to cancel");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f8f9ff] text-[#0b1c30]">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hold Orders</h1>
          <p className="text-sm text-[#76777d]">Resume or cancel orders that were held from POS.</p>
        </div>
        <Link
          to="/cashier/pos"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#0b1c30] px-4 text-sm font-bold text-white transition hover:bg-[#132a47]"
        >
          <FaCashRegister />
          Go to POS
        </Link>
      </div>

      <div className="mb-6 rounded-xl border border-[#d7dced] bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto_auto] lg:items-center">
          <label className="relative block">
            <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#76777d]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by bill number or customer..."
              className="h-10 w-full rounded-lg border border-[#d7dced] bg-white pl-10 pr-3 text-sm outline-none transition focus:border-[#0058be] focus:ring-4 focus:ring-[#0058be]/10"
            />
          </label>

          <select
            value={cashierFilter}
            onChange={(e) => setCashierFilter(e.target.value)}
            className="h-10 w-full rounded-lg border border-[#d7dced] bg-white px-3 text-sm outline-none transition focus:border-[#0058be] focus:ring-4 focus:ring-[#0058be]/10"
          >
            <option value="">All cashiers</option>
            {cashierOptions.map((cashier) => (
              <option key={cashier} value={cashier}>
                {cashier}
              </option>
            ))}
          </select>

          <label className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#d7dced] bg-white px-3 text-sm font-semibold text-[#45464d]">
            <input
              type="checkbox"
              checked={todayOnly}
              onChange={(e) => setTodayOnly(e.target.checked)}
              className="h-4 w-4 accent-[#0058be]"
            />
            Today
          </label>

          <button
            type="button"
            onClick={clearFilters}
            disabled={!hasFilters}
            className="h-10 rounded-lg border border-[#d7dced] bg-white px-4 text-sm font-bold text-[#45464d] transition hover:bg-[#f8f9ff] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Clear
          </button>
        </div>
      </div>

      {bills.length === 0 ? (
        <div className="rounded-xl border border-[#d7dced] bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#eff4ff] text-2xl text-[#0058be]">
            <FaClipboardList />
          </div>
          <h2 className="text-lg font-bold text-[#131b2e]">No held orders yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#76777d]">
            Held orders will appear here when you hold a sale from POS.
            Go to POS and click "Hold Order" to save the current cart temporarily.
          </p>
          <Link
            to="/cashier/pos"
            className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#0b1c30] px-4 text-sm font-bold text-white transition hover:bg-[#132a47]"
          >
            <FaCashRegister />
            Go to POS
          </Link>
        </div>
      ) : filteredBills.length === 0 ? (
        <div className="rounded-xl border border-[#d7dced] bg-white px-6 py-12 text-center shadow-sm">
          <h2 className="text-lg font-bold text-[#131b2e]">No held orders match your filters</h2>
          <p className="mt-2 text-sm text-[#76777d]">Clear the search or filters to view all held orders.</p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-6 h-10 rounded-lg border border-[#d7dced] bg-white px-4 text-sm font-bold text-[#45464d] transition hover:bg-[#f8f9ff]"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-[#d7dced] bg-white shadow-sm lg:block">
            <div className="overflow-x-auto">
              <table className="w-full whitespace-nowrap text-left text-sm">
                <thead className="border-b border-[#d7dced] bg-[#eff4ff]">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-[#45464d]">Bill No</th>
                    <th className="px-4 py-3 font-semibold text-[#45464d]">Customer</th>
                    <th className="px-4 py-3 text-center font-semibold text-[#45464d]">Items</th>
                    <th className="px-4 py-3 text-right font-semibold text-[#45464d]">Total</th>
                    <th className="px-4 py-3 font-semibold text-[#45464d]">Cashier</th>
                    <th className="px-4 py-3 font-semibold text-[#45464d]">Held Time</th>
                    <th className="px-4 py-3 text-center font-semibold text-[#45464d]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d7dced]">
                  {filteredBills.map((bill) => (
                    <tr key={bill._id} className="transition hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-[#0058be]">{bill.holdNumber || "-"}</td>
                      <td className="px-4 py-3 text-[#45464d]">{getCustomerName(bill)}</td>
                      <td className="px-4 py-3 text-center font-semibold text-[#45464d]">{getItemCount(bill)}</td>
                      <td className="px-4 py-3 text-right font-bold text-[#131b2e]">{formatUsd(bill.totalCost)}</td>
                      <td className="px-4 py-3 text-[#45464d]">{getCashierName(bill)}</td>
                      <td className="px-4 py-3 text-[#45464d]">{formatHeldTime(bill.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleResume(bill._id)}
                            className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#0058be] px-3 text-xs font-bold text-white transition hover:bg-[#00499d]"
                          >
                            <FaPlay />
                            Resume
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCancel(bill._id)}
                            className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-200 bg-white px-3 text-xs font-bold text-red-600 transition hover:bg-red-50"
                          >
                            <FaTrashAlt />
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-4 lg:hidden">
            {filteredBills.map((bill) => (
              <div key={bill._id} className="overflow-hidden rounded-xl border border-[#d7dced] bg-white shadow-sm">
                <div className="border-b border-[#e5e7ef] bg-[#fdfdfd] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase text-[#76777d]">Held Order</p>
                      <h2 className="mt-1 text-lg font-bold text-[#0058be]">{bill.holdNumber || "-"}</h2>
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#eff4ff] px-3 py-1 text-xs font-bold text-[#0058be]">
                      <FaCalendarDay />
                      {formatHeldTime(bill.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 p-4">
                  <div className="flex items-center gap-2 text-sm text-[#45464d]">
                    <FaUser className="text-[#c6c6cd]" />
                    <span>Customer: {getCustomerName(bill)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#45464d]">
                    <FaClipboardList className="text-[#c6c6cd]" />
                    <span>Items: {getItemCount(bill)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#45464d]">
                    <FaUser className="text-[#c6c6cd]" />
                    <span>Cashier: {getCashierName(bill)}</span>
                  </div>
                  {bill.note && (
                    <div className="rounded-lg border border-[#e5e7ef] bg-[#f8f9ff] p-3 text-xs italic text-[#76777d]">
                      "{bill.note}"
                    </div>
                  )}
                  <div className="text-2xl font-bold text-[#131b2e]">
                    {formatUsd(bill.totalCost)}
                  </div>
                </div>

                <div className="grid grid-cols-2 border-t border-[#d7dced]">
                  <button
                    type="button"
                    onClick={() => handleCancel(bill._id)}
                    className="inline-flex h-12 items-center justify-center gap-2 border-r border-[#d7dced] text-sm font-bold text-red-600 transition hover:bg-red-50"
                  >
                    <FaTrashAlt />
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleResume(bill._id)}
                    className="inline-flex h-12 items-center justify-center gap-2 text-sm font-bold text-[#0058be] transition hover:bg-[#eff4ff]"
                  >
                    <FaPlay />
                    Resume
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default HoldBills;
