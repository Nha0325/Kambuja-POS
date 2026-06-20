export default function Button({ className = "", type = "button", ...props }) {
  return (
    <button
      type={type}
      className={`rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}
