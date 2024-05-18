export function extractErrorDetail(payload: object): string | null {
  // check if payload is an object and has a "detail" key -- if so we can extract more information.
  if ('detail' in payload && Array.isArray(payload.detail) && payload.detail.length > 0) {
    const detail = payload.detail[0];
    const loc = detail.loc.join('.');
    const msg = detail.msg;
    return `${msg} at ${loc}`
  }
  return null;
}