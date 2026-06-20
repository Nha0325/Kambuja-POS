import { Link } from "react-router-dom";

export default function UnauthorizedPage() {
  return <main className="grid min-h-screen place-items-center"><div className="text-center"><h1 className="text-3xl font-bold">Unauthorized</h1><Link className="text-indigo-600" to="/login">Return to login</Link></div></main>;
}
