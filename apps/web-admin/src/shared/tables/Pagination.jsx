import Button from "../ui/Button";

export default function Pagination({ page, totalPages, onPageChange }) {
  return <div className="mt-4 flex justify-end gap-3"><Button disabled={page <= 0} onClick={() => onPageChange(page - 1)}>Previous</Button><span className="self-center text-sm">Page {page + 1} of {Math.max(totalPages, 1)}</span><Button disabled={page + 1 >= totalPages} onClick={() => onPageChange(page + 1)}>Next</Button></div>;
}
