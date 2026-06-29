import { useParams } from "react-router";
import useFetchOne from "../../../hooks/common/useFetchOne";
import formatDate from "../../../utils/formatters/formatDate";

function Invoice() {
  const formatUsd = (value) => `$${Number(value || 0).toFixed(2)}`;
  const { id } = useParams();
  const { data } = useFetchOne("sales", id);

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4 flex justify-center items-start">
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
