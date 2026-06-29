import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPrint } from "react-icons/fa6";
import useFetchOne from "../../../hooks/common/useFetchOne";
import formatDate from "../../../utils/formatters/formatDate";

function Invoice() {
  const formatUsd = (value) => `$${Number(value || 0).toFixed(2)}`;
  const { id } = useParams();
  const navigate = useNavigate();
  const { data } = useFetchOne("sales", id);

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4 flex justify-center items-start relative">
      
      {/* Floating Action Buttons (Hidden when printing) */}
      <div className="fixed top-4 left-4 print:hidden flex flex-col sm:flex-row gap-3 z-50">
        <button 
          onClick={() => navigate('/cashier/pos')} 
          className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-slate-700 shadow-md transition-colors"
        >
          <FaArrowLeft /> Back to POS
        </button>
        <button 
          onClick={() => window.print()} 
          className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-cyan-700 shadow-md transition-colors"
        >
          <FaPrint /> Print Receipt
        </button>
      </div>

      <div className="w-[80mm] bg-white font-bold p-4 text-black shadow-lg rounded-sm print:shadow-none print:m-0 print:p-0">
      <h1 className="text-center text-2xl tracking-wide font-extrabold">MASTER POS</h1>
      <div className="text-center text-xs mt-1">Receipt</div>
      <div className="border-b border-dashed border-black my-2"></div>

      <div className="text-left text-xs mb-1 space-y-0.5">
        <div className="flex justify-between"><span>Sale by:</span><span>{data?.user?.username || "-"}</span></div>
        <div className="flex justify-between"><span>Date:</span><span>{data?.createdAt ? formatDate(data.createdAt) : "-"}</span></div>
        <div className="flex justify-between"><span>Invoice:</span><span className="uppercase">{data?.invoiceNumber || "-"}</span></div>
      </div>

      <div className="border-b border-dashed border-black my-2"></div>

      <table className="w-full text-xs">
        <thead>
          <tr className="bg-black text-white">
            <th className="text-left p-1">Item</th>
            <th className="text-center p-1">Qty</th>
            <th className="text-right p-1">Price</th>
          </tr>
        </thead>
        <tbody>
          {data?.items?.map((item, idx) => (
            <tr key={item.productId || idx} className="border-b border-gray-100">
              <td className="text-left py-1">{item?.product?.name || item?.name}</td>
              <td className="text-center py-1">{item?.quantity}</td>
              <td className="text-right py-1">{formatUsd(item?.totalPrice)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="border-b border-dashed border-black my-2"></div>

      <div className="flex justify-between font-bold text-sm bg-black text-white p-1 rounded">
        <span>Total</span>
        <span>{formatUsd(data?.totalCost)}</span>
      </div>

      <div className="border-b border-dashed border-black my-2"></div>

      <div className="text-center text-xs mt-4 italic font-normal">Thank you! Please come again.</div>
      </div>
    </div>
  );
}

export default Invoice;
