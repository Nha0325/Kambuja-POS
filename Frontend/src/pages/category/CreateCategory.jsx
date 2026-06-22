import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useCollection from "../../hooks/useCollection";
import toast from "react-hot-toast";

function CreateCategory() {
  const [name, setName] = useState("");
  const [note, setNote] = useState("");

  const { create, isLoading } = useCollection("categories");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await create({
      name,
      note
    });
    if (res) {
      toast.success("Created successfully!!");
      clearForm();
      navigate('/admin/categories');
    }
  };

  function clearForm() {
    setName("");
    setNote("");
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold text-black">Create New Category</h1>

      <div className="max-w-lg bg-white p-4 rounded-lg mt-4 border border-gray-200">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="category-name" className="block text-sm font-medium mb-1">
              Name*
            </label>
            <input
              id="category-name"
              name="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              className="input input-sm input-bordered w-full rounded"
              placeholder="Enter category name"
            />
          </div>
  
          <div className="mb-3">
            <label htmlFor="category-note" className="block text-sm font-medium mb-1">
              Note
            </label>
            <textarea
              id="category-note"
              name="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="textarea textarea-sm textarea-bordered w-full rounded"
              placeholder="Type category note here..."
            ></textarea>
          </div>

          <div className="flex justify-end items-center space-x-2 mt-4">
            <Link to="/admin/categories" className="btn btn-sm">
              Cancel
            </Link>
            <button type="submit" disabled={isLoading} className="btn btn-sm btn-neutral">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateCategory;
