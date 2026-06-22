import { FaGear, FaShieldHalved } from "react-icons/fa6"
import { cardClass } from "./adminManagerUi"
import { PageHeader } from "./adminManagerComponents"

function Settings() {
  return (
    <section>
      <PageHeader
        title="Platform Settings"
        description="Environment-controlled platform configuration and operational safeguards."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <article className={`${cardClass} p-6 lg:col-span-2`}>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#edeeef] text-gray-950">
              <FaGear />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-950">Configuration Source</h2>
              <p className="text-sm text-gray-500">Frontend-visible settings are read-only in this panel.</p>
            </div>
          </div>
          <p className="text-sm leading-6 text-gray-600">
            Platform settings remain environment-controlled. No secret values are exposed in the frontend.
          </p>
        </article>

        <article className="rounded-xl border border-gray-950 bg-gray-950 p-6 text-white">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
            <FaShieldHalved />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.05em] text-gray-300">Security</p>
          <h3 className="mt-2 text-xl font-semibold">Secrets stay server-side</h3>
          <p className="mt-2 text-sm leading-6 text-gray-300">
            This screen intentionally avoids rendering credentials or deployment variables.
          </p>
        </article>
      </div>
    </section>
  )
}

export default Settings
