
import type { NextApiRequest, NextApiResponse } from 'next';
import chromium from 'chrome-aws-lambda';
import QRCode from 'qrcode';
import bwipjs from 'bwip-js';

const baseCSS = `
:root{--brand:#082C53;--accent:#9ACD30;--ink:#1b2838;--muted:#6b7a90;--border:#e6ecf2;}
*{box-sizing:border-box} html,body{margin:0;padding:0;color:var(--ink);}
.label{border:1px solid var(--border); padding:8mm; background:#fff; border-radius:8px; width: 105mm; height: 148mm;}
.header{display:flex; align-items:center; justify-content:space-between; margin-bottom:3mm;}
.brand{font-weight:700; font-size:7mm; color:#fff; background:var(--brand); padding:2mm 3mm; border-radius:2mm;}
.recipe{font-size:5.2mm; font-weight:700; color:var(--brand);}
.badges{display:flex; gap:2mm; flex-wrap:wrap}
.badge{border:1px solid var(--brand); color:var(--brand); border-radius:999px; padding:1mm 2.5mm; font-size:3.2mm;}
.grid{display:grid; grid-template-columns:1fr 1fr; gap:3mm; margin:3mm 0;}
.card{border:1px solid var(--border); border-radius:2mm; padding:2.5mm;}
.card h4{margin:0 0 1.5mm 0; font-size:3.6mm; color:var(--brand);}
.table{width:100%; border-collapse:collapse; font-size:3.2mm;}
.table th,.table td{padding:1.5mm; border-top:1px solid var(--border); text-align:left;}
.table th{color:var(--muted); font-weight:600;}
.small{font-size:3mm; color:var(--muted);}
.footer{display:flex; justify-content:space-between; align-items:flex-end; gap:3mm; margin-top:3mm;}
.brandline{height:2mm; background:linear-gradient(90deg,var(--brand), var(--accent)); margin-bottom:4mm;}
`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // In real app fetch recipe by id
  const id = String(req.query.id || 'r1');
  const data = {
    recipe_name: 'Hepatic v1.3',
    species_common: 'Žako šedý',
    species_latin: 'Psittacus erithacus',
    batch_code: 'EMX-2025-10-13-001',
    net_weight: '1 kg',
    fat_pct: '8.5',
    protein_pct: '11.8',
    fiber_pct: '12',
    carb_pct: '45',
    cap_ratio: '2.1:1',
    energy_kj_per_100g: '1500',
    ingredients_list: 'Proso žluté, proso červené, ostropestřec (limit), lněné semeno mleté, dýňová semínka',
    allergens: 'Může obsahovat stopy ořechů a sezamu',
    storage: 'Skladujte v chladu a suchu, do 18 °C. Po otevření spotřebujte do 30 dní.',
    vet_status: 'Speciální dieta vyžaduje schválení veterinářem.',
    approved_by: 'MVDr. Sebastian Franco',
    approved_until: '2026-04-13',
    made_by: 'VetExotic Group s.r.o., Jažlovice',
    contact: 'www.vetexoticgroup.com • info@vetexotic.eu',
    qr_url: 'https://app.exomix.cz/r/abcd1234',
    barcode: '8591234567890',
    notes: 'Bez arašídů. Nízká prašnost.'
  };

  const qrPng = await QRCode.toDataURL(data.qr_url, { margin: 0, width: 300 });
  const barcodePng = await new Promise<string>((resolve, reject) => {
    bwipjs.toBuffer({
      bcid: 'ean13',
      text: data.barcode,
      scale: 3,
      height: 10,
      includetext: true,
      textxalign: 'center'
    }, function (err: any, png: Buffer) {
      if (err) reject(err);
      else resolve('data:image/png;base64,' + png.toString('base64'));
    });
  });

  const html = `<!doctype html><html><head>
    <meta charset="utf-8">
    <style>@page{size:105mm 148mm;margin:0} body{{margin:0;padding:0;display:flex;align-items:center;justify-content:center;background:#f7f9fc;}} ${baseCSS}</style>
  </head>
  <body>
    <div class="label">
      <div class="brandline"></div>
      <div class="header">
        <div class="brand">ExoMix</div>
        <div class="badges">
          <div class="badge">${data.net_weight}</div>
          <div class="badge">Ca:P ${data.cap_ratio}</div>
          <div class="badge">${data.energy_kj_per_100g} kJ / 100 g</div>
        </div>
      </div>
      <div class="recipe">${data.recipe_name}</div>
      <div class="small">${data.species_common} (<i>${data.species_latin}</i>) • Šarže: ${data.batch_code}</div>
      <div class="grid">
        <div class="card">
          <h4>Složení</h4>
          <div class="small">${data.ingredients_list}</div>
          <table class="table"><thead><tr><th>Živina</th><th>Hodnota</th></tr></thead>
          <tbody>
            <tr><td>Tuk</td><td>${data.fat_pct} %</td></tr>
            <tr><td>Bílkoviny</td><td>${data.protein_pct} %</td></tr>
            <tr><td>Vláknina</td><td>${data.fiber_pct} %</td></tr>
            <tr><td>Sacharidy</td><td>${data.carb_pct} %</td></tr>
          </tbody></table>
        </div>
        <div class="card">
          <h4>Pokyny & bezpečnost</h4>
          <div class="small" style="background:#fffbe6;border:1px solid #f1e6a6;padding:4px 8px;border-radius:6px">${data.vet_status}</div>
          <div class="small" style="margin-top:2mm;">Alergeny: ${data.allergens}</div>
          <div class="small">Skladování: ${data.storage}</div>
          <div class="small" style="margin-top:2mm;">Schválil: ${data.approved_by} • Platnost do: ${data.approved_until}</div>
        </div>
      </div>
      <div class="footer">
        <div>
          <div class="small">${data.made_by}</div>
          <div class="small">${data.contact}</div>
          <div class="small">Poznámka: ${data.notes}</div>
        </div>
        <img alt="QR" src="${qrPng}" style="width:28mm;height:28mm;object-fit:contain;border:1px solid #eee;border-radius:3px"/>
        <img alt="EAN" src="${barcodePng}" style="height:14mm;object-fit:contain;border:1px solid #eee;border-radius:3px"/>
      </div>
    </div>
  </body></html>`;

  // Launch headless Chrome (works on Vercel/Node with chrome-aws-lambda, or regular puppeteer locally)
  let browser = null;
  try {
    const executablePath = await chromium.executablePath;
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: true,
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({ width: '105mm', height: '148mm', printBackground: true, preferCSSPageSize: true });
    await browser.close();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="etiketa-${id}.pdf"`);
    res.send(pdf);
  } catch (e: any) {
    if (browser) await browser.close();
    res.status(500).json({ error: e.message });
  }
}
