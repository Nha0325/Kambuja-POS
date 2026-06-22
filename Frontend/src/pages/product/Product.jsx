import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { IoMdTrash } from "react-icons/io";
import { IoPencilSharp } from "react-icons/io5";
import { apiUrl } from "../../configs/env";
import { useCollection } from "../../hooks/useCollection";
import { useQuery } from "../../hooks/useQuery";
import { adminSurface } from "../admin/adminPageUi";

function Product() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [refetch, setRefetch] = useState(false);

  const { data: products, totalPage, isLoading } = useQuery("products", search, page, limit, refetch);
  const { remove, isLoading: isDeleting } = useCollection("products");
  const currency = "៛";
  const productCount = products?.length || 0;
  const stockTotal = products?.reduce((sum, item) => sum + Number(item?.currentStock || 0), 0) || 0;
  const zeroStockCount = products?.filter((item) => Number(item?.currentStock || 0) <= 0).length || 0;

  const handleDelete = async (id) => {
    if (confirm("Are you sure! you want to delete?")) {
      const res = await remove(id);
      if (res && isDeleting === false) {
        setRefetch(!refetch);
        toast.success("Deleted successfully!");
      }
    }
  };

  return (
    <div className={adminSurface.page}>
      <div className={adminSurface.header}>
        <div>
          <p className={adminSurface.eyebrow}>Catalog</p>
          <h1 className={adminSurface.title}>Products</h1>
          <p className={adminSurface.description}>
            Maintain product codes, pricing, category assignment, stock count, and labels.
          </p>
        </div>
        <Link to="/admin/products/create" className={adminSurface.primaryButton}>
          + New Product
        </Link>
      </div>

      <div className={adminSurface.statGrid}>
        {[
          ["Products", productCount],
          ["Total stock", stockTotal],
          ["Out of stock", zeroStockCount],
          ["Rows per page", limit],
        ].map(([label, value]) => (
          <div key={label} className={adminSurface.statCard}>
            <div className={adminSurface.statIcon}>{String(label).slice(0, 1)}</div>
            <p className={`mt-4 ${adminSurface.statLabel}`}>{label}</p>
            <p className={adminSurface.statValue}>{value}</p>
          </div>
        ))}
      </div>

      <div className={adminSurface.tableShell}>
        <div className={adminSurface.toolbar}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <fieldset className="flex items-center gap-2">
            <span className="text-sm text-[#45464d]">Show</span>
            <select
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              value={limit}
              className={`${adminSurface.select} w-20`}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span className="text-sm text-[#45464d]">entries</span>
          </fieldset>

          <label className={`${adminSurface.input} flex w-full items-center gap-2 lg:max-w-sm`}>
            <svg className="h-4 w-4 opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </g>
            </svg>
            <input
              className="w-full text-sm"
              type="search"
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search products..."
            />
          </label>
        </div>
        </div>

        <div className={adminSurface.tableWrap}>
          <table className={`${adminSurface.table} min-w-[1180px]`}>
            <thead className={adminSurface.tableHead}>
              <tr>
                <th className={`${adminSurface.th} w-16 text-center`}>N.o</th>
                <th className={adminSurface.th}>Code</th>
                <th className={adminSurface.th}>Product</th>
                <th className={adminSurface.th}>Category</th>
                <th className={`${adminSurface.th} text-right`}>Cost Price</th>
                <th className={`${adminSurface.th} text-right`}>Sale Price</th>
                <th className={`${adminSurface.th} text-center`}>Current Stock</th>
                <th className={adminSurface.th}>Note</th>
                <th className={`${adminSurface.th} w-28 text-center`}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={9} className="p-8">
                    <div className="flex justify-center text-[#45464d]">
                      <span className="loading loading-spinner" />
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && products?.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-sm text-[#5b6472]">
                    No products found.
                  </td>
                </tr>
              )}

              {!isLoading &&
                products?.map((item, idx) => {
                  const cost = Number(item?.costPrice || 0);
                  const sale = Number(item?.salePrice || 0);

                  return (
                    <tr
                      key={item?._id || idx}
                      className={adminSurface.row}
                    >
                      <td className={`${adminSurface.td} text-center font-medium text-[#5b6472]`}>
                        {(page - 1) * limit + idx + 1}
                      </td>
                      <td className={`${adminSurface.td} min-w-28 font-semibold uppercase text-[#213145]`}>{item?.code || "-"}</td>
                      <td className={`${adminSurface.td} min-w-56`}>
                        <div className="flex items-center gap-3">
                          {item?.imageUrl ? (
                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-[#d7dced] bg-[#f8f9ff]">
                              <img
                                src={`${apiUrl}/upload/${item.imageUrl}`}
                                alt={item?.name || "Product"}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-dashed border-[#c6c6cd] bg-[#f8f9ff] text-[10px] text-[#5b6472]">
                              No Img
                            </div>
                          )}
                          <span className="font-semibold text-[#0b1c30]">{item?.name || "-"}</span>
                        </div>
                      </td>
                      <td className={`${adminSurface.td} min-w-36 text-[#45464d]`}>{item?.category?.name || "-"}</td>
                      <td className={`${adminSurface.td} min-w-32 text-right font-semibold text-red-600`}>
                        {cost.toLocaleString()} {currency}
                      </td>
                      <td className={`${adminSurface.td} min-w-32 text-right font-semibold text-red-600`}>
                        {sale.toLocaleString()} {currency}
                      </td>
                      <td className={`${adminSurface.td} min-w-32 text-center text-[#45464d]`}>{item?.currentStock ?? 0}</td>
                      <td className={`${adminSurface.td} min-w-48 max-w-xs truncate text-[#45464d]`}>{item?.note || "-"}</td>
                      <td className={adminSurface.td}>
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            to={`/admin/products/${item._id}/edit`}
                            title="Edit product"
                            className={adminSurface.iconButton}
                          >
                            <IoPencilSharp />
                          </Link>
                          <button
                            type="button"
                            title="Delete product"
                            onClick={() => handleDelete(item._id)}
                            className={adminSurface.dangerIconButton}
                          >
                            <IoMdTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        <div className={adminSurface.footer}>
          <p className="text-sm text-[#45464d]">
            Page {page}/{totalPage || 1}
          </p>
          <div className="join">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="join-item btn btn-sm border-[#c6c6cd] bg-white text-[#0b1c30] hover:bg-[#eff4ff]"
            >
              {"<<"}
            </button>
            <button className="join-item btn btn-sm pointer-events-none border-[#0058be] bg-[#d8e2ff] text-[#0058be]">
              Page {page}
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPage}
              className="join-item btn btn-sm border-[#c6c6cd] bg-white text-[#0b1c30] hover:bg-[#eff4ff]"
            >
              {">>"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Product;
