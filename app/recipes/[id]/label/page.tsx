
export const metadata = { title: 'Etiketa – ExoMix' };

const css = `
:root{
  --brand:#082C53; --accent:#9ACD30; --ink:#1b2838; --muted:#6b7a90; --border:#e6ecf2;
}
*{box-sizing:border-box}
.label{border:1px solid var(--border); padding:8mm; position:relative; background:#fff; border-radius:8px;}
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
.qr{width:28mm; height:28mm; border:1px dashed var(--border); display:flex; align-items:center; justify-content:center; font-size:3mm; color:var(--muted);}
.bar{height:12mm; border:1px dashed var(--border); display:flex; align-items:center; justify-content:center; font-size:3mm; color:var(--muted);}
.brandline{height:2mm; background:linear-gradient(90deg,var(--brand), var(--accent)); margin-bottom:4mm;}
`;

function Label() {
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
  return (
    <div className="bg-gray-50 p-6">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="card p-4 flex-1">
          <div className="text-sm text-muted mb-3">Náhled etikety (A6)</div>
          <div className="label" style={{ width: '105mm', height: '148mm' }}>
            <div className="brandline"></div>
            <div className="header">
              <div className="brand">ExoMix</div>
              <div className="badges">
                <div className="badge">{data.net_weight}</div>
                <div className="badge">Ca:P {data.cap_ratio}</div>
                <div className="badge">{data.energy_kj_per_100g} kJ / 100 g</div>
              </div>
            </div>
            <div className="recipe">{data.recipe_name}</div>
            <div className="small">{data.species_common} (<i>{data.species_latin}</i>) • Šarže: {data.batch_code}</div>
            <div className="grid">
              <div className="card">
                <h4>Složení</h4>
                <div className="small">{data.ingredients_list}</div>
                <table className="table"><thead><tr><th>Živina</th><th>Hodnota</th></tr></thead>
                <tbody>
                  <tr><td>Tuk</td><td>{data.fat_pct} %</td></tr>
                  <tr><td>Bílkoviny</td><td>{data.protein_pct} %</td></tr>
                  <tr><td>Vláknina</td><td>{data.fiber_pct} %</td></tr>
                  <tr><td>Sacharidy</td><td>{data.carb_pct} %</td></tr>
                </tbody></table>
              </div>
              <div className="card">
                <h4>Pokyny & bezpečnost</h4>
                <div
                  className="small"
                  style={{
                    background: '#fffbe6',
                    border: '1px solid #f1e6a6',
                    padding: '4px 8px',
                    borderRadius: '6px',
                  }}
                >
                  {data.vet_status}
                </div>
                <div className="small mt-2">Alergeny: {data.allergens}</div>
                <div className="small">Skladování: {data.storage}</div>
                <div className="small mt-2">Schválil: {data.approved_by} • Platnost do: {data.approved_until}</div>
              </div>
            </div>
            <div className="flex items-end justify-between gap-3">
              <div>
                <div className="small">{data.made_by}</div>
                <div className="small">{data.contact}</div>
                <div className="small">Poznámka: {data.notes}</div>
              </div>
              <div className="qr">QR: {data.qr_url}</div>
              <div className="bar">EAN: {data.barcode}</div>
            </div>
          </div>
        </div>
        <div className="card p-4 w-full lg:w-80">
          <div className="text-sm text-muted">Export</div>
          <div className="mt-2 flex flex-col gap-2">
            <a className="btn btn-primary" href="/api/recipes/r1/label-pdf" target="_blank">Uložit jako PDF</a>
            <a className="btn btn-secondary" href="/recipes/r1/label" target="_blank">Stáhnout HTML</a>
            <a className="btn btn-ghost" href="#">Sdílet odkaz</a>
          </div>
          <div className="mt-4 text-sm text-muted">Tip: vytiskni na A6 štítek. QR/EAN se generují na serveru.</div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return <Label />;
}
