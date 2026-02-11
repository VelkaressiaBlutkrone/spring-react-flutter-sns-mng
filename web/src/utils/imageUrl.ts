/**
 * 이미지 게시글 이미지 URL 생성.
 * API가 상대 경로(/api/image-posts/{id}/image)를 반환하므로, baseURL이 있으면 붙여서 반환.
 */
const baseURL =
  import.meta.env.VITE_API_BASE_URL != null && String(import.meta.env.VITE_API_BASE_URL).trim() !== ''
    ? String(import.meta.env.VITE_API_BASE_URL).replace(/\/$/, '')
    : '';

export function getImageUrl(imageUrl: string): string {
  if (!imageUrl) return '';
  if (baseURL && imageUrl.startsWith('/')) {
    return baseURL + imageUrl;
  }
  return imageUrl;
}
