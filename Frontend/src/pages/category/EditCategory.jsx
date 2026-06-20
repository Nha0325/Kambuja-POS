import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useCollection from "../../hooks/useCollection";
import useFetchOne from "../../hooks/useFetchOne";
import toast from "react-hot-toast";

function EditCategory() {
  const [name, setName] = useState("");
  const [note, setNote] = useState("");

  const route = useParams();
  const navigate = useNavigate();

  const { data } = useFetchOne("categories", route.id);
  const { update, isLoading } = useCollection("categories");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await update(route.id, {
      name,
      note
    });
    if (res) {
      toast.success("Updated successfully!!");
      clearForm();
      navigate('/category');
    }
  };

  function clearForm() {
    setName("");
    setNote("");
  }

  useEffect(() => {
    if (data) {
      setName(data.name || "");
      setNote(data.note || "");
    }
  }, [data]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold text-black">Edit Category</h1>

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
            <Link to={`/category`} className="btn btn-sm">
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

export default EditCategory;