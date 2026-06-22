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

  const handleBack = () => {
    setSearch("")

    if (level === "village") {
      setLevel("commune")
      return
    }

    if (level === "commune") {
      setLevel("district")
      return
    }

    if (level === "district") {
      setLevel("province")
    }
  }

  const getBreadcrumbItems = () => {
    const items = [
      {
        key: "country",
        label: "Cambodia",
        targetLevel: "province",
        disabled: level === "province",
      },
    ]

    if (selected.province && ["district", "commune", "village"].includes(level)) {
      items.push({
        key: "province",
        label: selected.province.nameEn,
        targetLevel: "district",
        disabled: level === "district",
      })
    }

    if (selected.district && ["commune", "village"].includes(level)) {
      items.push({
        key: "district",
        label: selected.district.nameEn,
        targetLevel: "commune",
        disabled: level === "commune",
      })
    }

    if (selected.commune && level === "village") {
      items.push({
        key: "commune",
        label: selected.commune.nameEn,
        targetLevel: "village",
        disabled: level === "village",
      })
    }

    return items
  }

  const handleBreadcrumbClick = (targetLevel) => {
    setSearch("")

    if (targetLevel === "province") {
      setLevel("province")
      return
    }

    if (targetLevel === "district" && selected.province) {
      setLevel("district")
      return
    }

    if (targetLevel === "commune" && selected.district) {
      setLevel("commune")
      return
    }

    if (targetLevel === "village" && selected.commune) {
      setLevel("village")
    }
  }

  if (!open) return null

  const selectedAtLevel = selected[level]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-violet-100 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Select shop address</h2>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              {getBreadcrumbItems().map((item, index) => (
                <div key={item.key} className="flex items-center gap-2">
                  {index > 0 && <span className="text-slate-300">›</span>}

                  <button
                    type="button"
                    onClick={() => handleBreadcrumbClick(item.targetLevel)}
                    disabled={item.disabled}
                    className={[
                      "rounded-full px-3 py-1 text-xs font-medium transition",
                      item.disabled
                        ? "cursor-default bg-violet-600 text-white shadow-sm"
                        : "bg-violet-50 text-violet-700 hover:bg-violet-100 hover:text-violet-900",
                    ].join(" ")}
                  >
                    {item.label}
                  </button>
                </div>
              ))}
            </div>
          </div>
          <button
            className="rounded-xl border border-violet-200 bg-white px-3 py-1.5 text-xs font-medium text-violet-700 shadow-sm transition-colors hover:bg-violet-50"
            type="button"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div className="space-y-2">
            <label className="block space-y-2">
              <span className="block text-xs font-bold uppercase tracking-[0.05em] text-slate-500">{levelLabels[level]}</span>
              <input
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search"
              />
            </label>
          </div>

          <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
            {items.map((item) => {
              const isSelected = selectedAtLevel?.code === item.code
              return (
                <button
                  key={item.code}
                  type="button"
                  className={`w-full rounded-xl border px-4 py-3 text-left text-sm shadow-sm transition-all ${
                    isSelected
                      ? "border-violet-400 bg-violet-50 text-violet-900 ring-2 ring-violet-500/10"
                      : "border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-900"
                  }`}
                  onClick={() => handleSelect(item)}
                >
                  {getDisplayName(item, search)}
                </button>
              )
            })}
            {items.length === 0 && (
              <div className="rounded-xl border border-dashed border-violet-200 bg-violet-50/40 px-4 py-10 text-center text-sm text-slate-500">
                No address found
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-violet-100 pt-4">
            {level !== "province" ? (
              <button
                type="button"
                onClick={handleBack}
                className="rounded-xl border border-violet-200 bg-white px-4 py-2 text-sm font-medium text-violet-700 shadow-sm transition hover:border-violet-300 hover:bg-violet-50"
              >
                Back
              </button>
            ) : <span />}
            <button
              className="h-10 rounded-xl border border-violet-200 bg-white px-4 text-sm font-medium text-violet-700 transition-colors hover:bg-violet-50"
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShopAddressPicker
