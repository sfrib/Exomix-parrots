
import type { SupplierAdapter, SupplierItem } from './types';

export const SamohylAdapter: SupplierAdapter = {
  name: 'Samohyl',
  async fetchItems(query: string): Promise<SupplierItem[]> {
    // TODO: implement real fetch
    return [
      { sku: 'SAM-777', name: `Sáček slunečnice (${query})`, inStock: false, priceCzk: 59, currency: 'CZK', packSize: '1 kg', url: 'https://samohyl.cz/p/sam-777' }
    ];
  }
};
