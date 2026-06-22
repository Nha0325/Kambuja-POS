import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import toast from "react-hot-toast"
import ShopAddressPicker from "../../components/address/ShopAddressPicker"
import {
  cleanAddressItem,
  emptyShopAddress,
  getAddressSummary,
} from "../../data/cambodiaAddress"
import { adminManagerService } from "../../services/adminManager.service"
import { formatApiError } from "../../utils/formatApiError"

const createInitialForm = () => ({
  name: "",
  code: "",
  phone: "",
  ownerAdminId: "",
  address: emptyShopAddress(),
  status: "ACTIVE",
})

const getShopId = (shopId) => {
  if (!shopId) return ""
  return typeof shopId === "string" ? shopId : shopId._id
}

const normalizeShopAddress = (shop) => {
  const rawAddress = typeof shop.address === "object" && shop.address !== null
    ? shop.address
    : {}

  return {
    province: cleanAddressItem(rawAddress.province) || (
      shop.provinceCode || shop.provinceName || shop.province
        ? {
          code: shop.provinceCode || "",
          nameEn: shop.provinceName || shop.province || "",
          nameKm: "",
        }
        : null
    ),
    district: cleanAddressItem(rawAddress.district) || (
      shop.districtCode || shop.districtName || shop.city
        ? {
          code: shop.districtCode || "",
          nameEn: shop.districtName || shop.city || "",
          nameKm: "",
        }
        : null
    ),
    commune: cleanAddressItem(rawAddress.commune),
    village: cleanAddressItem(rawAddress.village),
    detail: rawAddress.detail || (typeof shop.address === "string" ? shop.address : ""),
  }
}

const sectionTitleClass = "mb-6 flex items-center gap-2 text-base font-semibold text-slate-900"
const labelClass = "block text-xs font-bold uppercase tracking-[0.05em] text-slate-500"
const inputClass = "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
const readOnlyInputClass = "h-12 w-full cursor-not-allowed rounded-xl border border-violet-100 bg-violet-50/70 px-4 text-sm text-slate-500 outline-none"
const selectClass = inputClass

const SectionTitle = ({ children }) => (
  <h3 className={sectionTitleClass}>
    <span className="h-5 w-1 rounded-full bg-violet-600" />
    {children}
  </h3>
)

function ShopForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(createInitialForm)
  const [admins, setAdmins] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isAddressPickerOpen, setIsAddressPickerOpen] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    let isMounted = true
    const load = async () => {
      try {
        setIsLoading(true)
        const [adminsResponse, shopResponse] = await Promise.all([
          id ? adminManagerService.admins() : adminManagerService.availableAdmins(),
          id ? adminManagerService.shop(id) : Promise.resolve(null),
        ])

        if (!isMounted) return

        const adminDocs = adminsResponse.data.result || []
        if (shopResponse) {
          const shop = shopResponse.data.result || {}
          const ownerAdminId = shop.ownerAdminId?._id || shop.ownerAdminId || ""
          setForm({
            ...createInitialForm(),
            name: shop.name || "",
            code: shop.code || "",
            phone: shop.phone || "",
            ownerAdminId,
            address: normalizeShopAddress(shop),
            status: shop.status || "ACTIVE",
          })
          setAdmins(adminDocs.filter((admin) => {
            const assignedShopId = getShopId(admin.shopId)
            return admin.status === "ACTIVE"
              && (!assignedShopId || assignedShopId === id || admin._id === ownerAdminId)
          }))
        } else {
          setAdmins(adminDocs)
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.response?.data?.error || "Unable to load shop form")
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    load()
    return () => {
      isMounted = false
    }
  }, [id])

  const submit = async (event) => {
    event.preventDefault()
    setError("")

    if (!form.name.trim()
      || !form.ownerAdminId
      || !form.address.province
      || !form.address.district
      || !form.address.commune
      || !form.address.village) {
      setError("Please fill all required fields.")
      return
    }

    try {
      setIsSaving(true)
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        ownerAdminId: form.ownerAdminId,
        status: form.status,
        address: {
          province: cleanAddressItem(form.address.province),
          district: cleanAddressItem(form.address.district),
          commune: cleanAddressItem(form.address.commune),
          village: cleanAddressItem(form.address.village),
          detail: (form.address.detail || "").trim(),
        },
      }

      if (id) await adminManagerService.updateShop(id, payload)
      else await adminManagerService.createShop(payload)
      toast.success(id ? "Shop updated" : "Shop created")
      navigate("/admin-manager/shops")
    } catch (submitError) {
      if (submitError?.response?.status === 401) {
        return
      }

      const message = formatApiError(submitError) || "Unable to save shop"
      setError(message)
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <section className="min-h-[calc(100vh-112px)] rounded-3xl bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 p-4 md:p-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-2xl font-semibold text-slate-900">{id ? "Edit Shop" : "Create Shop"}</h1>
          <div className="mt-6 rounded-2xl border border-violet-100 bg-white p-10 text-sm text-slate-500 shadow-sm">Loading shop form...</div>
        </div>
      </section>
    )
  }

  const noOwnerAdmin = admins.length === 0
  const addressSummary = getAddressSummary(form.address)

  return (
    <section className="min-h-[calc(100vh-112px)] rounded-3xl bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 p-4 md:p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-violet-700">Kambuja POS</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">{id ? "Edit Shop" : "Create Shop"}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Configure shop ownership, status, and Cambodia address details.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-10 rounded-2xl border border-violet-100 bg-white p-5 shadow-sm md:p-8 lg:p-10">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <section>
            <SectionTitle>General Information</SectionTitle>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <label className="space-y-2">
                <span className={labelClass}>Shop Name</span>
                <input
                  required
                  className={inputClass}
                  placeholder="Enter shop name"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                />
              </label>

              <label className="space-y-2">
                <span className={labelClass}>Shop Code</span>
                <input
                  readOnly
                  className={readOnlyInputClass}
                  value={form.code}
                  placeholder="Auto generated by backend"
                />
              </label>

              <label className="space-y-2">
                <span className={labelClass}>Phone Number</span>
                <input
                  className={inputClass}
                  placeholder="+855 000 000 000"
                  value={form.phone}
                  onChange={(event) => setForm({ ...form, phone: event.target.value })}
                />
              </label>

              <label className="space-y-2">
                <span className={labelClass}>Status</span>
                <select
                  className={selectClass}
                  value={form.status}
                  onChange={(event) => setForm({ ...form, status: event.target.value })}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </label>
            </div>
          </section>

          <section>
            <SectionTitle>Owner Configuration</SectionTitle>
            <label className="space-y-2">
              <span className={labelClass}>Select Owner Admin</span>
              <select
                required
                disabled={noOwnerAdmin}
                className={`${selectClass} disabled:cursor-not-allowed disabled:bg-violet-50 disabled:text-slate-400`}
                value={form.ownerAdminId}
                onChange={(event) => setForm({ ...form, ownerAdminId: event.target.value })}
              >
                <option value="">Select owner admin</option>
                {admins.map((admin) => (
                  <option key={admin._id} value={admin._id}>
                    {admin.username} ({admin.email})
                  </option>
                ))}
              </select>
              {noOwnerAdmin && (
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-slate-500">Create an ADMIN account before creating a shop.</span>
                  <Link className="font-bold text-violet-700 underline underline-offset-2 transition-opacity hover:opacity-80" to="/admin-manager/admins/create">Create Admin</Link>
                </div>
              )}
            </label>
          </section>

          <section>
            <SectionTitle>Location Details</SectionTitle>
            <div className="space-y-6">
              <div className="space-y-2">
                <span className={labelClass}>Shop Address</span>
                <button
                  type="button"
                  className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-900 outline-none transition-all hover:border-violet-300 hover:bg-violet-50/60 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                  onClick={() => setIsAddressPickerOpen(true)}
                >
                  {addressSummary ? (
                    <span className="text-slate-700">{addressSummary}</span>
                  ) : (
                    <span className="text-slate-500">Select shop address</span>
                  )}
                </button>
              </div>

              <label className="space-y-2">
                <span className={labelClass}>Address Detail</span>
                <input
                  className={inputClass}
                  placeholder="Enter house number, street name, market name, or notable landmarks..."
                  value={form.address.detail}
                  onChange={(event) => setForm({
                    ...form,
                    address: {
                      ...form.address,
                      detail: event.target.value,
                    },
                  })}
                />
              </label>
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 border-t border-violet-100 pt-8 sm:flex-row sm:items-center sm:justify-end">
            <Link className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-violet-200 bg-white px-5 text-sm font-medium text-violet-700 transition-colors hover:bg-violet-50 sm:w-auto" to="/admin-manager/shops">Cancel</Link>
            <button
              className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-violet-600 px-6 text-sm font-medium text-white shadow-sm transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              type="submit"
              disabled={isSaving || noOwnerAdmin}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>

      <ShopAddressPicker
        open={isAddressPickerOpen}
        value={form.address}
        onClose={() => setIsAddressPickerOpen(false)}
        onChange={(address) => setForm((current) => ({
          ...current,
          address: {
            province: cleanAddressItem(address.province),
            district: cleanAddressItem(address.district),
            commune: cleanAddressItem(address.commune),
            village: cleanAddressItem(address.village),
            detail: current.address.detail,
          },
          code: id ? current.code : "",
        }))}
      />
    </section>
  )
}

export default ShopForm
