const API_URL = import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/v1\/?$/, "") : "http://localhost:8080";

export function getImageUrl(image) {
  if (!image) return "/placeholder-product.svg";

  let imagePath = image.replace(/\\/g, "/");

  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // Handle just a filename
  if (!imagePath.includes("/")) {
    return `${API_URL}/upload/${imagePath}`;
  }

  if (imagePath.startsWith("/uploads")) {
    return `${API_URL}${imagePath}`;
  }

  if (imagePath.startsWith("uploads")) {
    return `${API_URL}/${imagePath}`;
  }

  if (imagePath.startsWith("/upload")) {
    return `${API_URL}${imagePath}`;
  }

  if (imagePath.startsWith("upload")) {
    return `${API_URL}/${imagePath}`;
  }

  return imagePath;
}
