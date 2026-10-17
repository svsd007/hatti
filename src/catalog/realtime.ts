import { supabase } from "../lib/supabase";

// Debounce event bursts; resync after reconnect/focus to recover missed changes.
export function subscribeCatalog(onChange: () => void, includeBusinesses = false, client = supabase) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let active = true;
  const refresh = () => { if (active) { clearTimeout(timer); timer = setTimeout(onChange, 200); } };
  let channel = client.channel(`catalog-${crypto.randomUUID()}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "products" }, refresh);
  if (includeBusinesses) channel = channel.on("postgres_changes", { event: "*", schema: "public", table: "Businesses" }, refresh);
  channel.subscribe(status => { if (status === "SUBSCRIBED") refresh(); });
  window.addEventListener("focus", refresh);
  window.addEventListener("online", refresh);
  return () => {
    active = false;
    clearTimeout(timer);
    window.removeEventListener("focus", refresh);
    window.removeEventListener("online", refresh);
    void client.removeChannel(channel);
  };
}
