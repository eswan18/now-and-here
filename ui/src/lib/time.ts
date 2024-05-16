export function yesterday() {
  const now = new Date();
  return new Date(now.setDate(now.getDate() - 1));
}