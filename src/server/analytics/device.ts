/** Грубая, приватность-совместимая классификация устройства по User-Agent. */
export type DeviceCategory = "desktop" | "mobile" | "tablet" | "unknown";

export function classifyDevice(userAgent: string | null): DeviceCategory {
  if (!userAgent) return "unknown";
  const ua = userAgent.toLowerCase();

  if (/ipad|tablet(?!.*mobile)|playbook|silk(?!.*mobile)/.test(ua)) {
    return "tablet";
  }
  if (/mobile|iphone|ipod|android.*mobile|windows phone|blackberry/.test(ua)) {
    return "mobile";
  }
  if (/mozilla|chrome|safari|firefox|edg|opr/.test(ua)) {
    return "desktop";
  }
  return "unknown";
}
