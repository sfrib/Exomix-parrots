
import type { NextApiRequest, NextApiResponse } from 'next';
import { NovikoAdapter } from '@/lib/suppliers/noviko';
import { SamohylAdapter } from '@/lib/suppliers/samohyl';
import { RajPapouskuAdapter } from '@/lib/suppliers/rajpapousku';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const q = String(req.query.q || '');
  const adapters = [NovikoAdapter, SamohylAdapter, RajPapouskuAdapter];
  const results = (await Promise.all(adapters.map(a => a.fetchItems(q)))).flat();
  // sort by price (available first)
  results.sort((a,b)=> (Number(b.inStock) - Number(a.inStock)) || (a.priceCzk ?? 1e9) - (b.priceCzk ?? 1e9));
  res.status(200).json({ items: results });
}
