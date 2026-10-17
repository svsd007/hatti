export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export function priceInCents(value: string): number {
  if (!/^\d+(?:\.\d{1,2})?$/.test(value.trim())) throw new Error("Enter a price with up to two decimal places.");
  const [whole, fraction = ""] = value.trim().split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(cents) || cents > 100000000) throw new Error("Price is too large.");
  return cents;
}

export function imageExtension(file: Pick<File, "type" | "size">): string {
  const extension = ({ "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" } as Record<string, string>)[file.type];
  if (!extension) throw new Error("Choose a JPEG, PNG, or WebP image.");
  if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) throw new Error("Choose an image smaller than 5 MB.");
  return extension;
}
