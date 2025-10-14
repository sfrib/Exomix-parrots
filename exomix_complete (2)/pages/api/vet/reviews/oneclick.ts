
import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyLinkToken } from '@/lib/jwt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token = String(req.query.token || '');
    const t = verifyLinkToken(token);
    // Redirect to the safe decision endpoint with prefilled action
    const url = `${process.env.APP_URL}/api/vet/reviews/${t.requestId}/decision?action=${t.action}&token=${encodeURIComponent(token)}`;
    res.status(302).setHeader('Location', url).end();
  } catch (e:any) {
    return res.status(400).send('Invalid or expired token');
  }
}
