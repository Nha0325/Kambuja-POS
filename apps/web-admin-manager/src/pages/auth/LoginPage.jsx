import LoginForm from "../../features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <>
      <h1 className="text-2xl font-bold">Platform manager login</h1>
      <p className="mb-6 mt-2 text-sm text-slate-500">ADMIN_MANAGER access only.</p>
      <LoginForm />
    </>
  );
}
