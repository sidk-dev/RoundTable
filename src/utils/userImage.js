import { s3BucketService } from "../roundtable";

const MAX_IMAGE_CACHE_ENTRIES = 500;
const authorImageUrlCache = new Map();

const evictOldestIfNeeded = () => {
  if (authorImageUrlCache.size < MAX_IMAGE_CACHE_ENTRIES) {
    return;
  }

  const oldestKey = authorImageUrlCache.keys().next().value;
  if (oldestKey) {
    authorImageUrlCache.delete(oldestKey);
  }
};

export async function resolveAuthorImage(imagePath) {
  if (!imagePath) return null;

  if (authorImageUrlCache.has(imagePath)) {
    return authorImageUrlCache.get(imagePath);
  }

  const request = s3BucketService
    .getImageUrl(imagePath)
    .catch(() => null)
    .then((url) => {
      evictOldestIfNeeded();
      authorImageUrlCache.set(imagePath, url);
      return url;
    });

  evictOldestIfNeeded();
  authorImageUrlCache.set(imagePath, request);

  return request;
}
