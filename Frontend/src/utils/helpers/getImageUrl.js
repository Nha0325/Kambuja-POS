const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL) {
    return (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL).replace(/\/api\/v1\/?$/, "")
  }
  if (typeof window !== "undefined" && window.location.hostname !== "localhost") {
    return "https://kambuja-pos.up.railway.app"
  }
  return "http://localhost:8080"
}
const API_URL = getApiUrl();

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
