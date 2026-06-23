import { IoChevronBack, IoChevronForward } from "react-icons/io5"
import { adminSurface } from "../../pages/admin/adminPageUi"

function AdminPagination({ page, totalPage, onPrevious, onNext, previousDisabled, nextDisabled }) {
  const lastPage = Math.max(Number(totalPage) || 1, 1)

  return (
    <div className={adminSurface.footer}>
      <p className={adminSurface.paginationMeta}>
        {page} / {lastPage}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrevious}
          disabled={previousDisabled}
          aria-label="Previous page"
          title="Previous page"
          className={adminSurface.paginationButton}
        >
          <IoChevronBack />
        </button>

        <span className={adminSurface.paginationCurrent}>{page}</span>

        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          aria-label="Next page"
          title="Next page"
          className={adminSurface.paginationButton}
        >
          <IoChevronForward />
        </button>
      </div>
    </div>
  )
}

export default AdminPagination
