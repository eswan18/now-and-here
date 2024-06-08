// Check the env var to determine the base URL.
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function baseUrl() {
  const baseUrl = BASE_URL || window.location.origin;
  return baseUrl;
}

export function extractErrorDetail(payload: object): string | null {
  // check if payload is an object and has a "detail" key -- if so we can extract more information.
  if (
    "detail" in payload &&
    Array.isArray(payload.detail) &&
    payload.detail.length > 0
  ) {
    const detail = payload.detail[0];
    const loc = detail.loc.join(".");
    const msg = detail.msg;
    return `${msg} at ${loc}`;
  }
  return null;
}
