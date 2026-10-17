import { useState } from "react";
import { productAccent, productImageUrl } from "../catalog/catalog";
import ProduceArt from "./ProduceArt";

export default function ProductImage({ name, path }: { name: string; path: string | null }) {
  const url = productImageUrl(path, import.meta.env.VITE_SUPABASE_URL);
  const [failed, setFailed] = useState<string | null>(null);
  return <div className={`product-image ${productAccent(name)}`} aria-hidden="true">
    {url && failed !== url ? <img src={url} alt="" loading="lazy" referrerPolicy="no-referrer"
      width="400" height="300" onError={() => setFailed(url)} /> : <ProduceArt kind={productAccent(name)} />}
  </div>;
}
