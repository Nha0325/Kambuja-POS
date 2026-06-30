import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { LuTrash2, LuPencil, LuSearch, LuPlus, LuTags } from "react-icons/lu";
import { FaBarcode, FaQrcode } from "react-icons/fa6";
import { getImageUrl } from "../../../utils/helpers/getImageUrl";
import { useCollection } from "../../../hooks/common/useCollection";
import { useQuery } from "../../../hooks/common/useQuery";
import { adminSurface } from "../adminPageUi";
import AdminPagination from "../../../components/admin/AdminPagination";
import ProductLabelPrintModal from "../../../components/product/ProductLabelPrintModal";
import { useConfirm } from "../../../hooks/ui/useConfirm";
import { useTranslation } from "react-i18next";

function Product() {
  const { t } = useTranslation();
  const { confirm, closeConfirm } = useConfirm();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [refetch, setRefetch] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [printModalType, setPrintModalType] = useState("barcode");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const { data: products, totalPage, isLoading } = useQuery("products", search, page, limit, refetch);
  const { remove, isLoading: isDeleting } = useCollection("products");
  const currency = "$";

  const handleDelete = async (id) => {
    const isConfirmed = await confirm({
      title: t('delete_product'),
      message: t('delete_product_msg'),
      confirmText: t('yes_delete'),
      cancelText: t('cancel'),
      variant: "danger"
    });

    if (isConfirmed) {
      const res = await remove(id);
      if (res && isDeleting === false) {
        setRefetch(!refetch);
        toast.success(t('deleted_success'));
      }
      closeConfirm();
    }
  };

  return (
    <div className={adminSurface.page}>
      <div className={adminSurface.header}>
        <div>
          <p className={adminSurface.eyebrow}>{t('admin_products')}</p>
          <h1 className={adminSurface.title}>{t('products')}</h1>
          <p className={adminSurface.description}>
            {t('products_desc')}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/admin/categories" className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[#2A2E36] bg-[#111318] px-5 text-sm font-semibold text-[#F8FAFC] shadow-sm transition-colors hover:border-[#3A3F49] hover:bg-[#1A1D24]">
            <LuTags className="text-[#A9A6BB]" /> {t('manage_categories')}
          </Link>
          <Link to="/admin/products/create" className={adminSurface.primaryButton}>
            <LuPlus /> {t('new_product')}
          </Link>
        </div>
      </div>
      <div className={adminSurface.tableShell}>
        <div className={adminSurface.toolbar}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <fieldset>
              <select
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                value={limit}
                aria-label="Page size"
                title="Page size"
                className={adminSurface.pageSizeSelect}
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </fieldset>

            <label className={`${adminSurface.input} flex w-full items-center gap-2 lg:max-w-sm`}>
              <LuSearch className="h-4 w-4 opacity-50 text-[#F8FAFC]" />
              <input
                className="w-full text-sm bg-transparent outline-none placeholder-[#6B7280] text-[#F8FAFC]"
                type="search"
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder={t('search_products')}
              />
            </label>
          </div>
        </div>

        <div className={adminSurface.tableWrap}>
          <table className={`${adminSurface.table} min-w-[1180px]`}>
            <thead className={adminSurface.tableHead}>
              <tr>
                <th className={`${adminSurface.th} w-16 text-center`}>{t('no')}</th>
                <th className={adminSurface.th}>{t('code')}</th>
                <th className={adminSurface.th}>{t('product')}</th>
                <th className={adminSurface.th}>{t('category')}</th>
                <th className={`${adminSurface.th} text-right`}>{t('cost_price')}</th>
                <th className={`${adminSurface.th} text-right`}>{t('sale_price')}</th>
                <th className={`${adminSurface.th} text-right`}>Tax (%)</th>
                <th className={`${adminSurface.th} text-center`}>{t('current_stock')}</th>
                <th className={`${adminSurface.th} text-center`}>{t('status')}</th>
                <th className={adminSurface.th}>{t('note')}</th>
                <th className={`${adminSurface.th} w-28 text-center`}>{t('actions')}</th>
              </tr>
            </thead>

            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={9} className="p-8">
                    <div className="flex justify-center text-[#A9A6BB]">
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#2A2E36] border-t-[#06b6d4]" />
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && products?.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-sm text-[#6B7280]">
                    {t('no_products')}
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
                      <td className={`${adminSurface.td} text-center font-medium text-slate-500 dark:text-zinc-400`}>
                        {(page - 1) * limit + idx + 1}
                      </td>
                      <td className={`${adminSurface.td} min-w-28 font-semibold uppercase text-slate-500 dark:text-zinc-400`}>{item?.code || "-"}</td>
                      <td className={`${adminSurface.td} min-w-56`}>
                        <div className="flex items-center gap-3">
                          {item?.imageUrl ? (
                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-[#2A2E36] bg-[#111318]">
                              <img
                                src={getImageUrl(item.imageUrl)}
                                alt={item?.name || "Product"}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-dashed border-[#2A2E36] bg-[#111318] text-[10px] text-slate-500 dark:text-zinc-400">
                              {t('no_image')}
                            </div>
                          )}
                          <span className="font-semibold text-slate-900 dark:text-white">{item?.name || "-"}</span>
                        </div>
                      </td>
                      <td className={`${adminSurface.td} min-w-36 text-slate-500 dark:text-zinc-400`}>{item?.category?.name || "-"}</td>
                      <td className={`${adminSurface.td} min-w-32 text-right font-semibold text-slate-900 dark:text-white`}>
                        {currency}{cost.toFixed(2)}
                      </td>
                      <td className={`${adminSurface.td} min-w-32 text-right font-semibold text-[#06b6d4]`}>
                        {currency}{sale.toFixed(2)}
                      </td>
                      <td className={`${adminSurface.td} min-w-24 text-right text-slate-500 dark:text-zinc-400`}>
                        {item?.tax || 0}%
                      </td>
                      <td className={`${adminSurface.td} min-w-32 text-center text-slate-900 dark:text-white`}>{item?.currentStock ?? 0}</td>
                      <td className={`${adminSurface.td} min-w-28 text-center`}>
                        <span className={`inline-flex px-2 py-1 text-[10px] font-bold uppercase rounded ${
                          item?.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item?.status === 'ACTIVE' ? t('active') : t('inactive')}
                        </span>
                      </td>
                      <td className={`${adminSurface.td} min-w-48 max-w-xs truncate text-slate-500 dark:text-zinc-400`}>{item?.note || "-"}</td>
                      <td className={adminSurface.td}>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            title="Print Barcode"
                            onClick={() => {
                              setSelectedProduct(item);
                              setPrintModalType('barcode');
                              setPrintModalOpen(true);
                            }}
                            className={adminSurface.iconButton}
                          >
                            <FaBarcode />
                          </button>
                          <button
                            type="button"
                            title="Print QR Code"
                            onClick={() => {
                              setSelectedProduct(item);
                              setPrintModalType('qrcode');
                              setPrintModalOpen(true);
                            }}
                            className={adminSurface.iconButton}
                          >
                            <FaQrcode />
                          </button>
                          <Link
                            to={`/admin/products/${item._id}/edit`}
                            title="Edit product"
                            className={adminSurface.iconButton}
                          >
                            <LuPencil />
                          </Link>
                          <button
                            type="button"
                            title="Delete product"
                            onClick={() => handleDelete(item._id)}
                            className={adminSurface.dangerIconButton}
                          >
                            <LuTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        <AdminPagination
          page={page}
          totalPage={totalPage}
          onPrevious={() => setPage(page - 1)}
          onNext={() => setPage(page + 1)}
          previousDisabled={page === 1}
          nextDisabled={page >= (totalPage || 1)}
        />
      </div>

      <ProductLabelPrintModal
        open={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        product={selectedProduct}
        initialPrintType={printModalType}
      />
    </div>
  );
}

export default Product;
