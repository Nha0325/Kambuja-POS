import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return <main className="grid min-h-screen place-items-center"><div className="text-center"><h1 className="text-3xl font-bold">Page not found</h1><Link className="text-indigo-600" to="/dashboard">Return to dashboard</Link></div></main>;
}
