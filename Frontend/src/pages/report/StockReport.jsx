import { useState } from "react";
import { useStockReport } from "../../hooks/useStockReport";
import toast from "react-hot-toast";
import { apiUrl } from "../../configs/env";

function StockReport() {
  const [stockQty, setStockQty] = useState(5);
  const [products, setProducts] = useState([]);
  const { fetchStockReport, isLoading } = useStockReport();

  const handleFilter = async (e) => {
    e.preventDefault();
    const res = await fetchStockReport(stockQty);
    if (res?.success) {
      setProducts(res.result);
      toast.success("Filtered Successfully!");
    }
  };

  return (
    <>
      <div className="p-4">
        <div className="flex justify-between items-center p-4">
          <h1 className="text-xl font-semibold">Stock Report</h1>
        </div>

        <div className="p-4 bg-white rounded-lg flex justify-center items-center">
          <form onSubmit={handleFilter} className="flex flex-wrap gap-4 items-end justify-center">
            <div>
              <label htmlFor="stock-report-qty" className="block text-sm font-medium mb-1">
                Stock Quantity
              </label>
              <select
                id="stock-report-qty"
                name="stockQty"
                value={stockQty}
                required
                onChange={(e) => setStockQty(Number(e.target.value))}
                className="select select-bordered"
              >
                <option value="">Select Stock Quantity</option>
                <option value="5">Quantity less than 5</option>
                <option value="10">Quantity less than 10</option>
                <option value="20">Quantity less than 20</option>
                <option value="40">Quantity less than 40</option>
                <option value="60">Quantity less than 60</option>
                <option value="80">Quantity less than 80</option>
                <option value="100">Quantity less than 100</option>
                <option value="500">Quantity less than 500</option>
                <option value="1000">Quantity less than 1000</option>
              </select>
            </div>

            <div className="flex space-x-2 min-w-[170px]">
              <button disabled={isLoading} className="btn w-20 btn-neutral text-white px-4 py-2 bg-slate-800 rounded">
                {isLoading ? "..." : "Filter"}
              </button>
              <button
                onClick={() => {
                  setStockQty(5);
                  setProducts([]);
                }}
                type="button"
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
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Code</th>
                <th>Category</th>
                <th>Cost Price</th>
                <th>Sale Price</th>
                <th>Current Stock</th>
              </tr>
            </thead>

            {products?.length > 0 && (
                <tbody>
                {products?.map((item, index) => {
                    return (
                    <tr key={index} className="hover">
                        <th>
                          <div className="avatar">
                            <div className="w-8 h-8 rounded-md border">
                              <img
                                src={`${apiUrl}/upload/${item.imageUrl}`}
                                alt={item.name}
                                className="object-cover"
                              />
                            </div>
                          </div>
                        </th>
                        <td className="font-semibold">{item.name}</td>
                        <td className="uppercase">{item.code}</td>
                        <td>{item.category?.name}</td>
                        <td className="text-red-600 font-semibold">{Number(item.costPrice).toLocaleString()}៛</td>
                        <td className="text-red-600 font-semibold">{Number(item.salePrice).toLocaleString()}៛</td>
                        <td className="font-bold">{item.currentStock}</td>
                    </tr>
                    );
                })}
                </tbody>
            )}

            {products?.length <= 0 && (
                <tbody>
                    <tr>
                        <td colSpan={7} className="text-center">No Data!</td>
                    </tr>
                </tbody>
            )}

          </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default StockReport;
