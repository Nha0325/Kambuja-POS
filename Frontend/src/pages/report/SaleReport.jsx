import dayjs from "dayjs";
import { useSaleReport } from "../../hooks/useSaleReport";
import { useState } from "react";
import toast from "react-hot-toast";

function SaleReport() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState([]); 
  const [totalAmount, setTotalAmount] = useState(0);

  const { fetchSaleReport, isLoading } = useSaleReport();

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return dayjs(dateString).format("YYYY-MM-DD HH:mm");
  };

  const handleFilter = async (e) => {
    e.preventDefault();
    const res = await fetchSaleReport(startDate, endDate);
 
    if (res) {
      const newItems = res.result || [];
      setData(newItems); // Replace existing data with new filtered data
      // Also append to the total amount
      setTotalAmount(res.totalAmount || 0); // Set total amount to the new filtered total
      toast.success("Filtered Successfully!");
    } else {
      // Error is already handled by toast in useSaleReport hook
    }
  };

  return (
    <>
      <div className="p-4">
        <div className="flex justify-between items-center p-4">
          <h1 className="text-xl font-semibold">Sale Report</h1>
        </div>

        <div className="p-4 bg-white rounded-lg flex justify-center items-center">
          {/* Changed: Added flex-wrap and gap properties to prevent items from being squeezed out */}
          <form onSubmit={handleFilter} className="flex flex-wrap gap-4 items-end justify-center">
            <div>
              <label htmlFor="sale-report-startDate" className="block text-sm font-medium mb-1">
                Start Date
              </label>
              <input
                id="sale-report-startDate"
                name="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input border border-gray-300 rounded p-2"
                required
              />
            </div>
            <div>
              <label htmlFor="sale-report-endDate" className="block text-sm font-medium mb-1">
                End Date
              </label>
              <input
                id="sale-report-endDate"
                name="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input border border-gray-300 rounded p-2"
                required
              />
            </div>
            {/* Changed: Ensured button container alignment stays consistent */}
            <div className="flex space-x-2 min-w-[170px]">
              <button disabled={isLoading} className="btn w-20 btn-neutral text-white px-4 py-2 bg-slate-800 rounded">
                {isLoading ? "..." : "Filter"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setData([]);
                  setTotalAmount(0);
                  setEndDate("");
                  setStartDate("");
                }}
                className="btn w-20 btn-error text-white px-4 py-2 bg-red-500 rounded"
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white p-5 rounded-lg mt-3">
          <div className="overflow-x-auto grid grid-cols-12">
            <table className="table border col-span-12 border-gray-200">
              <thead className="md:text-sm text-slate-600 bg-black/5">
                <tr><th>N.o</th><th>Invoice</th><th>Sale By</th><th>Customer</th><th>Total Cost</th><th>Paid Amount</th><th>Due Amount</th><th>Change Amount</th><th>Payment Status</th><th>Created Date</th></tr>
              </thead>

              {data?.length > 0 && (
                <tbody>
                  {data?.map((item, index) => (
                    <tr key={index} className="hover">
                      <td>{index + 1}</td>
                      <td>{item?.invoiceNumber}</td>
                      <td className="capitalize">{item?.user?.username}</td>
                      <td>{item.customer?.name}</td>
                      <td className="text-red-600 font-semibold">
                        {item?.totalCost?.toLocaleString()}៛
                      </td>
                      <td className="text-red-600 font-semibold">
                        {item?.paidAmount?.toLocaleString()}៛
                      </td>
                      <td className="text-red-600 font-semibold">
                        {item?.dueAmount?.toLocaleString()}៛
                      </td>
                      <td className="text-red-600 font-semibold">
                        {item?.changeAmount?.toLocaleString()}៛
                      </td>
                      <td>
                        <span
                          className={`
                                    text-xs font-medium me-2 px-2.5 py-0.5 rounded uppercase
                                    ${
                                      item?.paymentStatus == "paid" &&
                                      "bg-green-100 text-green-800"
                                    }
                                    ${
                                      item?.paymentStatus == "due" &&
                                      "bg-red-100 text-red-800"
                                    }
                                    ${
                                      item?.paymentStatus == "partial" &&
                                      "bg-yellow-100 text-yellow-800"
                                    }
                                    ${
                                      item?.paymentStatus == "overpaid" &&
                                      "bg-blue-100 text-blue-800"
                                    }
                                `}
                        >
                          {item.paymentStatus}
                        </span>
                      </td>
                      <td>{formatDate(item.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              )}

              {data?.length <= 0 && (
                <tbody>
                  <tr>
                    <td colSpan={10} className="text-center">
                      No Data!
                    </td>
                  </tr>
                </tbody>
              )}
            </table>
          </div>
          <div className="flex justify-end items-center mt-3">
            <h1>
              Total Amount:{" "}
              <span className="text-red-500 font-semibold">{totalAmount?.toLocaleString()}៛
              </span>
            </h1>
          </div>
        </div>
      </div>
    </>
  );
}

export default SaleReport;