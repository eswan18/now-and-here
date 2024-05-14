
export function extractErrorDetail(payload: any): string | null {
  let errorMsg = payload;
  try {
    const detail = payload.detail[0];
    const loc = detail.loc.join('.');
    const msg = detail.msg;
    errorMsg += `${msg} at ${loc}`
    return errorMsg;
  } catch (e) {
    // Do nothing.
  }
  return null;
}