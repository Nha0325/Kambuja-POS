import Loading from "../../components/Loading"
import useCurrent from "../../hooks/auth/useCurrent"
import { normalizeRole, ROLES } from "../../utils/role"
import PosAccess from "../admin-manager/access"
import POS from "./POS"

function RoleAwarePOS() {
  const { data, isLoading } = useCurrent()
  if (isLoading) return <Loading />
  return normalizeRole(data?.role) === ROLES.ADMIN_MANAGER ? <PosAccess /> : <POS />
}

export default RoleAwarePOS
