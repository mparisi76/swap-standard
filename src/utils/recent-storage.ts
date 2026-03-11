// utils/recent-storage.ts
export const getRecentIds = (): string[] => {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem('recently_viewed') || '[]');
};

export const addRecentId = (id: string) => {
  const history = getRecentIds();
  const updated = [id, ...history.filter((h) => h !== id)].slice(0, 5);
  localStorage.setItem('recently_viewed', JSON.stringify(updated));
};