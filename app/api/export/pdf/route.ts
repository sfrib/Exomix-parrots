import { NextRequest, NextResponse } from 'next/server';
import { pdf, Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import React from 'react';
import { z } from 'zod';

import { RecipeSchema, recipeSchema } from '@/src/lib/exportSchema';

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 12,
    fontFamily: 'Helvetica',
    color: '#111827',
  },
  heading: {
    fontSize: 18,
    marginBottom: 8,
    fontWeight: 700,
  },
  section: {
    marginTop: 12,
  },
  sectionHeading: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: 600,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#6b7280',
    paddingBottom: 4,
  },
  tableHeaderCell: {
    flex: 1,
    fontWeight: 600,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: '#d1d5db',
  },
  cell: {
    flex: 1,
  },
});

const RecipeDocument: React.FC<{ data: RecipeSchema }> = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.heading}>ExoMix konfigurátor – report</Text>
      <View style={styles.section}>
        <View style={styles.row}>
          <Text>Druh:</Text>
          <Text>{data.species.czechName}</Text>
        </View>
        <View style={styles.row}>
          <Text>Latinsky:</Text>
          <Text>{data.species.latinName}</Text>
        </View>
        <View style={styles.row}>
          <Text>Kategorie:</Text>
          <Text>{data.species.category}</Text>
        </View>
        <View style={styles.row}>
          <Text>Cíl:</Text>
          <Text>{data.goal}</Text>
        </View>
        <View style={styles.row}>
          <Text>Hmotnost (g):</Text>
          <Text>{data.species.averageWeight_g.toFixed(0)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeading}>Složení směsi</Text>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderCell}>Ingredience</Text>
          <Text style={styles.tableHeaderCell}>Kategorie</Text>
          <Text style={styles.tableHeaderCell}>Množství (g)</Text>
        </View>
        {data.items.map((item) => (
          <View key={item.ingredientId} style={styles.tableRow}>
            <Text style={styles.cell}>{item.ingredient.name}</Text>
            <Text style={styles.cell}>{item.ingredient.category}</Text>
            <Text style={styles.cell}>{item.amount_g.toFixed(1)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeading}>Analytika</Text>
        <View style={styles.row}>
          <Text>Protein %:</Text>
          <Text>{data.composition.protein_pct.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text>Tuk %:</Text>
          <Text>{data.composition.fat_pct.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text>Vláknina %:</Text>
          <Text>{data.composition.fiber_pct.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text>Vlhkost %:</Text>
          <Text>{data.composition.moisture_pct.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text>Vápník %:</Text>
          <Text>{data.composition.calcium_pct.toFixed(3)}</Text>
        </View>
        <View style={styles.row}>
          <Text>Fosfor %:</Text>
          <Text>{data.composition.phosphorus_pct.toFixed(3)}</Text>
        </View>
        <View style={styles.row}>
          <Text>Ca:P:</Text>
          <Text>{data.composition.ca_to_p?.toFixed(2) ?? 'N/A'}</Text>
        </View>
        <View style={styles.row}>
          <Text>DMI (g):</Text>
          <Text>{data.composition.dry_matter_intake_g.toFixed(1)}</Text>
        </View>
        <View style={styles.row}>
          <Text>Cena/den:</Text>
          <Text>{data.composition.cost_per_day.toFixed(2)} Kč</Text>
        </View>
      </View>
    </Page>
  </Document>
);

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = recipeSchema.parse(json);
    const instance = pdf(<RecipeDocument data={parsed} />);
    const buffer = await instance.toBuffer();
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="exomix-report.pdf"',
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : 'Neznámá chyba';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
