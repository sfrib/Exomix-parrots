
export type SupplierItem = {
  sku: string;
  name: string;
  url?: string;
  inStock?: boolean;
  priceCzk?: number;
  currency?: string;
  packSize?: string;
  lastSeenAt?: string;
};

export interface SupplierAdapter {
  name: string;
  fetchItems(query: string): Promise<SupplierItem[]>;
}
