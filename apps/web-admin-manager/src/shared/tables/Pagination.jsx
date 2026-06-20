import Button from "../ui/Button";

export default function Pagination({ page, totalPages, onPageChange }) {
  return (
    <div className="mt-4 flex items-center justify-end gap-3">
      <Button disabled={page <= 0} onClick={() => onPageChange(page - 1)}>Previous</Button>
      <span className="text-sm text-slate-600">Page {page + 1} of {Math.max(totalPages, 1)}</span>
      <Button disabled={page + 1 >= totalPages} onClick={() => onPageChange(page + 1)}>Next</Button>
    </div>
  );
}
