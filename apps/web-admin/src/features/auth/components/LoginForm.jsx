import { useState } from "react";
import Button from "../../../shared/ui/Button";
import Input from "../../../shared/ui/Input";
import { useLogin } from "../hooks/useLogin";

export default function LoginForm() {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const { submit, error, loading } = useLogin();
  return <form className="grid gap-4" onSubmit={(event) => { event.preventDefault(); submit(credentials); }}><Input label="Email" type="email" required value={credentials.email} onChange={(event) => setCredentials({ ...credentials, email: event.target.value })} /><Input label="Password" type="password" required value={credentials.password} onChange={(event) => setCredentials({ ...credentials, password: event.target.value })} />{error && <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}<Button type="submit" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</Button></form>;
}
