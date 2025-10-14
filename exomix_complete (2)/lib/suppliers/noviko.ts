
import type { SupplierAdapter, SupplierItem } from './types';

export const NovikoAdapter: SupplierAdapter = {
  name: 'Noviko',
  async fetchItems(query: string): Promise<SupplierItem[]> {
    // TODO: implement real fetch + HTML parsing/API if dostupné.
    // Mock:
    return [
      { sku: 'NOV-123', name: `Proso žluté (${query})`, inStock: true, priceCzk: 42, currency: 'CZK', packSize: '1 kg', url: 'https://noviko.cz/p/nov-123' }
    ];
  }
};
