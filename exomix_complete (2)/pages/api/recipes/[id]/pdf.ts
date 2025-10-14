
// Skeleton API that would render a PDF (you can implement with Puppeteer/Playwright server-side)
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id as string;
  // TODO: load recipe + render HTML template, then convert to PDF using Puppeteer
  res.setHeader('Content-Type', 'application/pdf');
  // For now, return a simple PDF-like placeholder
  const placeholder = Buffer.from('%PDF-1.4\n%… placeholder – generate via Puppeteer …');
  res.send(placeholder);
}
