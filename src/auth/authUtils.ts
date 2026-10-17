const destinations = new Set([
  "/", "/fresh-produce", "/farmers", "/farmers-markets", "/deals",
  "/profile", "/previous-orders", "/cart", "/checkout",
  "/seller", "/seller/register", "/seller/products",
  "/business",
  "/checkout/success", "/checkout/cancel",
]);

export function safeDestination(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\") || Array.from(value).some(char => char.charCodeAt(0) <= 32)) return "/profile";
  try {
    const url = new URL(value, "https://hatti.invalid");
    if (url.origin !== "https://hatti.invalid" || !destinations.has(url.pathname)) return "/profile";
    return url.pathname + url.search + url.hash;
  } catch { return "/profile"; }
}

export function authErrorMessage(error: unknown): string {
  const code = error && typeof error === "object" && "code" in error ? error.code : undefined;
  if (code === "invalid_credentials") return "The email or password is incorrect.";
  if (code === "email_not_confirmed") return "Confirm your email using the link in your inbox before logging in.";
  if (code === "provider_disabled" || code === "unsupported_provider") return "Google sign-in is unavailable. Please use email and password.";
  if (code === "over_email_send_rate_limit" || code === "over_request_rate_limit") return "Too many attempts. Please wait a few minutes and try again.";
  if (code === "signup_disabled") return "Registration is currently unavailable. Please try again later.";
  if (error instanceof Error && /fetch|network|load failed/i.test(error.message)) return "Could not connect. Check your internet connection and try again.";
  if (error instanceof Error) return error.message;
  return "We could not complete that request. Please try again.";
}
