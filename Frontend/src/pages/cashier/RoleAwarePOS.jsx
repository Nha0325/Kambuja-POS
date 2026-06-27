import Loading from "../../components/Loading"
import useCurrent from "../../hooks/auth/useCurrent"
import POS from "./POS"

function RoleAwarePOS() {
  const { isLoading } = useCurrent()
  if (isLoading) return <Loading />
  return <POS />
}

export default RoleAwarePOS
