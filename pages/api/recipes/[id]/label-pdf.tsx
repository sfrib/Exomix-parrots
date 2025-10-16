import type { NextApiRequest, NextApiResponse } from 'next';
import { Document, Image, Page, StyleSheet, Text, View, pdf } from '@react-pdf/renderer';
import QRCode from 'qrcode';
import bwipjs from 'bwip-js';

const brandColors = {
  brand: '#082C53',
  ink: '#1b2838',
  muted: '#6b7a90',
  border: '#e6ecf2'
};

const styles = StyleSheet.create({
  page: {
    padding: 18,
    backgroundColor: '#ffffff',
    color: brandColors.ink,
    fontSize: 10,
    fontFamily: 'Helvetica'
  },
  brandLine: {
    height: 4,
    backgroundColor: brandColors.brand,
    marginBottom: 12
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  brand: {
    backgroundColor: brandColors.brand,
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    maxWidth: 220
  },
  badge: {
    borderWidth: 1,
    borderColor: brandColors.brand,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 9,
    color: brandColors.brand,
    marginRight: 6,
    marginBottom: 4
  },
  recipeName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: brandColors.brand,
    marginBottom: 2
  },
  subline: {
    fontSize: 9,
    color: brandColors.muted,
    marginBottom: 10
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  card: {
    borderWidth: 1,
    borderColor: brandColors.border,
    borderRadius: 6,
    padding: 10,
    flex: 1
  },
  cardSpacer: {
    marginRight: 10
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: brandColors.brand,
    marginBottom: 6
  },
  small: {
    fontSize: 9,
    color: brandColors.muted,
    marginBottom: 4
  },
  highlight: {
    backgroundColor: '#fffbe6',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#f1e6a6',
    padding: 6,
    marginBottom: 4,
    color: brandColors.ink
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: brandColors.border,
    paddingVertical: 4
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end'
  },
  footerText: {
    fontSize: 8,
    color: brandColors.muted,
    marginBottom: 2
  },
  qr: {
    width: 90,
    height: 90,
    borderWidth: 1,
    borderColor: '#eeeeee',
    borderRadius: 6
  },
  barcode: {
    height: 50,
    width: 120,
    borderWidth: 1,
    borderColor: '#eeeeee',
    borderRadius: 6
  },
  italic: {
    fontStyle: 'italic'
  }
});

type LabelData = {
  recipe_name: string;
  species_common: string;
  species_latin: string;
  batch_code: string;
  net_weight: string;
  fat_pct: string;
  protein_pct: string;
  fiber_pct: string;
  carb_pct: string;
  cap_ratio: string;
  energy_kj_per_100g: string;
  ingredients_list: string;
  allergens: string;
  storage: string;
  vet_status: string;
  approved_by: string;
  approved_until: string;
  made_by: string;
  contact: string;
  qr_url: string;
  barcode: string;
  notes: string;
};

interface LabelDocumentProps {
  data: LabelData;
  qrPng: string;
  barcodePng: string;
}

function LabelDocument({ data, qrPng, barcodePng }: LabelDocumentProps): JSX.Element {
  const nutrientRows = [
    { label: 'Tuk', value: `${data.fat_pct} %` },
    { label: 'Bílkoviny', value: `${data.protein_pct} %` },
    { label: 'Vláknina', value: `${data.fiber_pct} %` },
    { label: 'Sacharidy', value: `${data.carb_pct} %` }
  ];

  const badges = [
    data.net_weight,
    `Ca:P ${data.cap_ratio}`,
    `${data.energy_kj_per_100g} kJ / 100 g`
  ];

  return (
    <Document>
      <Page size="A6" style={styles.page}>
        <View style={styles.brandLine} />
        <View style={styles.header}>
          <Text style={styles.brand}>ExoMix</Text>
          <View style={styles.badges}>
            {badges.map((badge, index) => (
              <Text key={`${badge}-${index}`} style={styles.badge}>
                {badge}
              </Text>
            ))}
          </View>
        </View>
        <Text style={styles.recipeName}>{data.recipe_name}</Text>
        <Text style={styles.subline}>
          {data.species_common} (<Text style={styles.italic}>{data.species_latin}</Text>) • Šarže: {data.batch_code}
        </Text>
        <View style={styles.grid}>
          <View style={[styles.card, styles.cardSpacer]}>
            <Text style={styles.cardTitle}>Složení</Text>
            <Text style={styles.small}>{data.ingredients_list}</Text>
            {nutrientRows.map((row) => (
              <View key={row.label} style={styles.tableRow}>
                <Text>{row.label}</Text>
                <Text>{row.value}</Text>
              </View>
            ))}
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Pokyny &amp; bezpečnost</Text>
            <Text style={styles.highlight}>{data.vet_status}</Text>
            <Text style={styles.small}>Alergeny: {data.allergens}</Text>
            <Text style={styles.small}>Skladování: {data.storage}</Text>
            <Text style={styles.small}>
              Schválil: {data.approved_by} • Platnost do: {data.approved_until}
            </Text>
          </View>
        </View>
        <View style={styles.footer}>
          <View>
            <Text style={styles.footerText}>{data.made_by}</Text>
            <Text style={styles.footerText}>{data.contact}</Text>
            <Text style={styles.footerText}>Poznámka: {data.notes}</Text>
          </View>
          <Image style={styles.qr} src={qrPng} />
          <Image style={styles.barcode} src={barcodePng} />
        </View>
      </Page>
    </Document>
  );
}

async function generateBarcodeDataUrl(barcode: string): Promise<string> {
  return new Promise((resolve, reject) => {
    bwipjs.toBuffer(
      {
        bcid: 'ean13',
        text: barcode,
        scale: 3,
        height: 10,
        includetext: true,
        textxalign: 'center'
      },
      (err: unknown, png: Buffer) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(`data:image/png;base64,${png.toString('base64')}`);
      }
    );
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = String(req.query.id ?? 'r1');

  const data: LabelData = {
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

  try {
    const [qrPng, barcodePng] = await Promise.all([
      QRCode.toDataURL(data.qr_url, { margin: 0, width: 300 }),
      generateBarcodeDataUrl(data.barcode)
    ]);

    const pdfBuffer = await pdf(<LabelDocument data={data} qrPng={qrPng} barcodePng={barcodePng} />).toBuffer();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="etiketa-${id}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate label PDF';
    res.status(500).json({ error: message });
  }
}
