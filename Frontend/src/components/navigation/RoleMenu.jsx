import useCurrent from "../../hooks/auth/useCurrent"
import { normalizeRole } from "../../utils/role"

function RoleMenu() {
  const { data } = useCurrent()
  return <span className="text-xs font-semibold">{normalizeRole(data?.role)}</span>
}

export default RoleMenu
