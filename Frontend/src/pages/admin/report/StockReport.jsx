import { useState } from "react";
import { useStockReport } from "../../../hooks/useStockReport";
import toast from "react-hot-toast";
import { apiUrl } from "../../../configs/env";
import { adminSurface } from "../adminPageUi";

function StockReport() {
  const [stockQty, setStockQty] = useState(5);
  const [products, setProducts] = useState([]);
  const { fetchStockReport, isLoading } = useStockReport();
  const totalStock = products.reduce((sum, item) => sum + Number(item?.currentStock || 0), 0);

  const handleFilter = async (e) => {
    e.preventDefault();
    const res = await fetchStockReport(stockQty);
    if (res?.success) {
      setProducts(res.result);
      toast.success("Filtered Successfully!");
    }
  };

  return (
    <div className={adminSurface.page}>
        <div className={adminSurface.header}>
          <div>
            <p className={adminSurface.eyebrow}>Reports</p>
            <h1 className={adminSurface.title}>Stock Report</h1>
            <p className={adminSurface.description}>
              Filter products by stock threshold and review current quantity, code, and pricing.
            </p>
          </div>
        </div>

        <div className={adminSurface.statGrid}>
          {[
            ["Products", products.length],
            ["Threshold", stockQty],
            ["Total stock", totalStock],
            ["Loading", isLoading ? "Yes" : "No"],
          ].map(([label, value]) => (
            <div key={label} className={adminSurface.statCard}>
              <div className={adminSurface.statIcon}>{String(label).slice(0, 1)}</div>
              <p className={`mt-4 ${adminSurface.statLabel}`}>{label}</p>
              <p className={adminSurface.statValue}>{value}</p>
            </div>
          ))}
        </div>

        <div className={adminSurface.card}>
          <form onSubmit={handleFilter} className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-end">
            <div className="min-w-0">
              <label htmlFor="stock-report-qty" className="mb-2 block text-sm font-semibold text-[#0b1c30]">
                Stock Quantity
              </label>
              <select
                id="stock-report-qty"
                name="stockQty"
                value={stockQty}
                required
                onChange={(e) => setStockQty(Number(e.target.value))}
                className={`${adminSurface.select} h-12 w-full lg:w-72`}
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

            <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
              <button disabled={isLoading} className={`${adminSurface.primaryButton} flex-1 lg:w-24 lg:flex-none`}>
                {isLoading ? "..." : "Filter"}
              </button>
              <button
                onClick={() => {
                  setStockQty(5);
                  setProducts([]);
                }}
                type="button"
                className="btn min-h-11 flex-1 rounded-lg border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-700 hover:bg-red-100 lg:w-24 lg:flex-none"
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        <div className={adminSurface.tableShell}>
          <div className={adminSurface.toolbar}>
            <p className="text-sm font-semibold text-[#0b1c30]">Stock results</p>
            <p className="mt-1 text-xs text-[#5b6472]">{products.length} product row(s) displayed</p>
          </div>
          <div className={adminSurface.tableWrap}>
            <table className={`${adminSurface.table} min-w-[920px]`}>
            <thead className={adminSurface.tableHead}>
              <tr>
                <th className={adminSurface.th}>Image</th>
                <th className={adminSurface.th}>Name</th>
                <th className={adminSurface.th}>Code</th>
                <th className={adminSurface.th}>Category</th>
                <th className={`${adminSurface.th} text-right`}>Cost Price</th>
                <th className={`${adminSurface.th} text-right`}>Sale Price</th>
                <th className={`${adminSurface.th} text-center`}>Current Stock</th>
              </tr>
            </thead>

            {products?.length > 0 && (
                <tbody>
                {products?.map((item, index) => {
                    return (
                    <tr key={index} className={adminSurface.row}>
                        <th className={adminSurface.td}>
                          <div className="avatar">
                            <div className="h-9 w-9 overflow-hidden rounded-lg border border-[#d7dced] bg-[#f8f9ff]">
                              <img
                                src={`${apiUrl}/upload/${item.imageUrl}`}
                                alt={item.name}
                                className="object-cover"
                              />
                            </div>
                          </div>
                        </th>
                        <td className={`${adminSurface.td} font-semibold text-[#0b1c30]`}>{item.name}</td>
                        <td className={`${adminSurface.td} font-semibold uppercase text-[#213145]`}>{item.code}</td>
                        <td className={`${adminSurface.td} text-[#45464d]`}>{item.category?.name}</td>
                        <td className={`${adminSurface.td} text-right font-semibold text-red-600`}>{Number(item.costPrice).toLocaleString()}៛</td>
                        <td className={`${adminSurface.td} text-right font-semibold text-red-600`}>{Number(item.salePrice).toLocaleString()}៛</td>
                        <td className={`${adminSurface.td} text-center font-bold text-[#0b1c30]`}>{item.currentStock}</td>
                    </tr>
                    );
                })}
                </tbody>
            )}

            {products?.length <= 0 && (
                <tbody>
                    <tr>
                        <td colSpan={7} className="p-8 text-center text-sm text-[#5b6472]">No Data!</td>
                    </tr>
                </tbody>
            )}

          </table>
          </div>
        </div>
      </div>
  );
}

export default StockReport;
