import { useEffect, useState } from "react"
import {
  cambodiaAddress,
  filterAddressOptions,
  getDisplayName,
} from "../../data/cambodiaAddress"

const levelLabels = {
  province: "Select province/state/area",
  district: "Select district/municipality/khan",
  commune: "Select commune/sangkat",
  village: "Select village",
}

const createEmptySelected = () => ({
  province: null,
  district: null,
  commune: null,
  village: null,
})

const isSameAddressItem = (item, value) => {
  if (!item || !value) return false
  if (item.code && value.code && String(item.code) === String(value.code)) return true
  return Boolean(
    (item.nameEn && value.nameEn && item.nameEn === value.nameEn)
    || (item.nameKm && value.nameKm && item.nameKm === value.nameKm)
  )
}

const hydrateSelectedAddress = (value) => {
  const nextSelected = createEmptySelected()

  nextSelected.province = cambodiaAddress.find((item) => (
    isSameAddressItem(item, value?.province)
  )) || value?.province || null

  nextSelected.district = nextSelected.province?.districts?.find((item) => (
    isSameAddressItem(item, value?.district)
  )) || value?.district || null

  nextSelected.commune = nextSelected.district?.communes?.find((item) => (
    isSameAddressItem(item, value?.commune)
  )) || value?.commune || null

  nextSelected.village = nextSelected.commune?.villages?.find((item) => (
    isSameAddressItem(item, value?.village)
  )) || value?.village || null

  return nextSelected
}

function ShopAddressPicker({ open, value, onClose, onChange }) {
  const [level, setLevel] = useState("province")
  const [selected, setSelected] = useState(createEmptySelected)
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (!open) return
    setLevel("province")
    setSelected(hydrateSelectedAddress(value))
    setSearch("")
  }, [open, value])

  const getCurrentItems = () => {
    if (level === "province") return cambodiaAddress
    if (level === "district") return selected.province?.districts || []
    if (level === "commune") return selected.district?.communes || []
    if (level === "village") return selected.commune?.villages || []
    return []
  }

  const items = filterAddressOptions(getCurrentItems(), search)

  const handleSelect = (item) => {
    if (level === "province") {
      setSelected({
        province: item,
        district: null,
        commune: null,
        village: null,
      })
      setLevel("district")
      setSearch("")
      return
    }

    if (level === "district") {
      setSelected((prev) => ({
        ...prev,
        district: item,
        commune: null,
        village: null,
      }))
      setLevel("commune")
      setSearch("")
      return
    }

    if (level === "commune") {
      setSelected((prev) => ({
        ...prev,
        commune: item,
        village: null,
      }))
      setLevel("village")
      setSearch("")
      return
    }

    if (level === "village") {
      const nextSelected = {
        ...selected,
        village: item,
      }

      setSelected(nextSelected)
      onChange(nextSelected)
      onClose()
    }
  }

  if (!open) return null

  const breadcrumbs = [
    "Cambodia",
    level !== "province" && selected.province?.nameEn,
    (level === "commune" || level === "village") && selected.district?.nameEn,
    level === "village" && selected.commune?.nameEn,
  ].filter(Boolean)

  const selectedAtLevel = selected[level]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-xl overflow-hidden rounded-xl border border-gray-300 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 bg-[#f8f9fa] px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-950">Select shop address</h2>
          <button className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-950 transition-colors hover:bg-gray-100" type="button" onClick={onClose}>Close</button>
        </div>

        <div className="space-y-4 p-5">
          <div className="text-sm font-semibold text-gray-700">
            {breadcrumbs.join(" > ")}
          </div>

          <div>
            <label className="block space-y-2">
              <span className="block text-xs font-bold uppercase tracking-[0.05em] text-gray-500">{levelLabels[level]}</span>
              <input
                className="h-12 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-950 outline-none transition-all focus:border-gray-950 focus:ring-1 focus:ring-gray-950"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search"
              />
            </label>
          </div>

          <div className="max-h-80 overflow-y-auto rounded-lg border border-gray-300">
            {items.map((item) => {
              const isSelected = selectedAtLevel?.code === item.code
              return (
                <button
                  key={item.code}
                  type="button"
                  className={`block w-full border-b border-gray-100 px-4 py-3 text-left text-sm last:border-b-0 hover:bg-[#f3f4f5] ${
                    isSelected ? "bg-gray-950 text-white" : "bg-white text-gray-800"
                  }`}
                  onClick={() => handleSelect(item)}
                >
                  {getDisplayName(item, search)}
                </button>
              )
            })}
            {items.length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-gray-500">No address found</div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <button className="h-10 rounded-lg border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-950 transition-colors hover:bg-gray-100" type="button" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShopAddressPicker
