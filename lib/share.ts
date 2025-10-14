
import crypto from 'crypto';

export function makeShareToken(recipeId: string) {
  return crypto.createHash('sha256').update(`${recipeId}:${process.env.SHARE_SALT ?? 'salt'}`).digest('hex').slice(0,24);
}
