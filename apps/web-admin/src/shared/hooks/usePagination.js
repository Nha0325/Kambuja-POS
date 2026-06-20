import { useState } from "react";
import { DEFAULT_PAGE_SIZE } from "../utils/constants";

export function usePagination(initialSize = DEFAULT_PAGE_SIZE) {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(initialSize);
  return { page, size, setPage, setSize };
}
