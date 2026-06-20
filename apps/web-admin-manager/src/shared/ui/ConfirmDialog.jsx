import Button from "./Button";
import Modal from "./Modal";

export default function ConfirmDialog({ open, message, onConfirm, onClose }) {
  return (
    <Modal open={open} title="Confirm action" onClose={onClose}>
      <p className="mb-5 text-sm text-slate-600">{message}</p>
      <div className="flex justify-end gap-2">
        <Button className="bg-slate-500 hover:bg-slate-600" onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm}>Confirm</Button>
      </div>
    </Modal>
  );
}
