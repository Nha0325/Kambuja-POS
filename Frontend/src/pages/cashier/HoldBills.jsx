import { useState } from "react";
import useFetchData from "../../hooks/useFetchData";
import formatUsd from "../../utils/formatCurrency";
import Loading from "../../components/Loading";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../../configs/api";
import { FaUser, FaClipboardList } from "react-icons/fa";

function HoldBills() {
  const navigate = useNavigate();
  const [page] = useState(1);
  const { data, isLoading, refetch } = useFetchData("held-bills", page, 20);

  const handleResume = (id) => {
    navigate(`/cashier/pos?heldBill=${id}`);
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this held bill?")) return;
    try {
      const res = await api.patch(`/held-bills/${id}/cancel`);
      const result = res.data;
      if (result.success) {
        toast.success("Held bill cancelled!");
        refetch();
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
    <div className="min-h-[calc(100vh-64px)] bg-[#f8f9ff] p-4 lg:p-6 text-[#0b1c30]">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Hold Bills</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data?.length === 0 ? (
          <div className="col-span-full rounded-xl border border-[#d7dced] bg-white py-16 text-center shadow-sm">
            <span className="text-4xl opacity-50 mb-4 block">📝</span>
            <p className="text-[#45464d] font-medium">No held bills found</p>
          </div>
        ) : (
          data?.map((bill) => (
            <div key={bill._id} className="flex flex-col justify-between overflow-hidden rounded-xl border border-[#d7dced] bg-white shadow-sm transition hover:shadow-md">
              <div className="p-4 border-b border-[#e5e7ef] bg-[#fdfdfd]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-[#0058be]">{bill.holdNumber}</span>
                  <span className="text-xs font-semibold text-[#76777d]">
                    {new Date(bill.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {bill.customerName && (
                  <div className="flex items-center gap-2 text-sm text-[#45464d] mb-1">
                    <FaUser className="text-[#c6c6cd]" />
                    <span className="truncate">{bill.customerName}</span>
                  </div>
                )}
                {bill.note && (
                  <div className="text-xs text-[#76777d] mt-2 italic bg-[#f8f9ff] p-2 rounded border border-[#e5e7ef]">
                    "{bill.note}"
                  </div>
                )}
              </div>
              <div className="p-4 flex-1">
                <div className="flex items-center gap-2 text-sm font-medium text-[#45464d] mb-2">
                  <FaClipboardList className="text-[#c6c6cd]" />
                  <span>{bill.items.length} items</span>
                </div>
                <div className="text-xl font-bold text-[#131b2e]">
                  {formatUsd(bill.totalCost)}
                </div>
              </div>
              <div className="flex border-t border-[#d7dced]">
                <button
                  onClick={() => handleCancel(bill._id)}
                  className="flex-1 border-r border-[#d7dced] py-3 text-sm font-bold text-red-600 transition hover:bg-red-50"
                >
                  CANCEL
                </button>
                <button
                  onClick={() => handleResume(bill._id)}
                  className="flex-1 py-3 text-sm font-bold text-[#0058be] transition hover:bg-[#eff4ff]"
                >
                  RESUME
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default HoldBills;
