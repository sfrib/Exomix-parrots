
import type { SupplierAdapter, SupplierItem } from './types';

export const RajPapouskuAdapter: SupplierAdapter = {
  name: 'RájPapoušků',
  async fetchItems(query: string): Promise<SupplierItem[]> {
    // TODO: implement real fetch
    return [
      { sku: 'RAJ-555', name: `Saflor (${query})`, inStock: true, priceCzk: 69, currency: 'CZK', packSize: '1 kg', url: 'https://rajpapousku.cz/p/raj-555' }
    ];
  }
};
