// Read projections of the public schema. Ownership identifiers are never requested.
export interface Business {
  id: string;
  name: string | null;
  description: string | null;
  location: string | null;
}

export interface Product {
  id: string;
  created_at: string;
  business_id: string;
  name: string;
  description: string | null;
  is_available: boolean | null;
  price: number;
  unit: string;
  category: string | null;
  stock_quantity: number | null;
  image_path: string | null;
}

export interface CatalogProduct extends Product {
  farmName: string;
}

export interface ProductDetails extends CatalogProduct {
  further_description: string | null;
  detailsUnavailable?: boolean;
}
