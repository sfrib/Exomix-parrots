
import jwt from 'jsonwebtoken';

const SECRET = process.env.LINK_SIGNING_SECRET || 'dev-secret-change-me';

export type LinkTokenPayload = {
  kind: 'vet-decide';
  requestId: string;
  action: 'approve'|'changes'|'reject';
  sub?: string; // vetId
};

export function signLinkToken(payload: LinkTokenPayload, expiresIn: string = '24h') {
  return jwt.sign(payload, SECRET, { expiresIn });
}

export function verifyLinkToken(token: string): LinkTokenPayload {
  return jwt.verify(token, SECRET) as LinkTokenPayload;
}
