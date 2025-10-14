
import type { NextApiRequest, NextApiResponse } from 'next';

export type Role = 'CHOVATEL' | 'VETERINAR' | 'ADMIN';

export function requireRole(roles: Role[]) {
  return async (req: NextApiRequest, res: NextApiResponse, next: () => Promise<void>|void) => {
    // NOTE: integrate with your session/auth solution
    const user: any = (req as any).user || { role: 'CHOVATEL' };
    if (!roles.includes(user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await next();
  };
}
