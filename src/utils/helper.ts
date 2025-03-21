export function getAppUrl() {
  return import.meta.env.VITE_API_URL || 'https://a-digital.co.il/';
}