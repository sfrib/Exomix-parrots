# ExoMix — Codex Brief (v1.1 Core Pack)

## 1) Mise & kontext

* **Projekt:** ExoMix – inteligentní výživový konfigurátor pro exotická zvířata.
* **Cíl:** Poskytnout chovatelům a veterinářům nástroj pro formulaci, vyhodnocení a archivaci krmných směsí (fokus na papoušky).
* **Scope verze v1.1 (Core Pack+):** veřejná webová aplikace (bez loginu) se 4 moduly – Atlas papoušků, Atlas surovin, Mixárna a Můj Garáž.
* **Ekosystém:** připraveno na integrace VetExotic Cloud (Můj Exot, RegistrPtaku.cz, Laguna, VetEdu Hub).
* **Technologie:** Next.js 14 (App Router) + TypeScript + TailwindCSS + shadcn/ui, Supabase klient (připravený), Recharts pro grafy, export CSV/PDF.

## 2) Navigace a IA

* Horní menu: **Parrots**, **Ingredients**, **Mixer**, **Garage** (případně Home s rychlou orientací).
* Každý modul má vlastní stránku v `app/` složce (viz struktura níže).
* Detailní zobrazení probíhá přes route segments (např. `/app/parrots/[id]`).
* Lokální data (CSV) jsou dostupná v `public/data`. Čtení probíhá server-side (Node fs) nebo pomocí bundlovaných loaderů.
* Stav aplikace je lean – přednost mají serverové komponenty a jednoduché klientské hooky (např. pro localStorage).

## 3) Modulové požadavky

### 3.1 Atlas papoušků ("Občanka druhu")

* Zdroj: `public/data/parrots.csv` (10+ druhů, včetně nutričních požadavků).
* UI: mřížka karet (`ParrotCard.tsx`), detailová stránka s kompletní kartou (identita, taxonomie, biotop, nutriční cíle, bioptio, reprodukce, QR, obrázek).
* Propojení: možnost rychlého otevření v Mixárně s předvybraným druhem; link na Můj Exot (placeholder).

### 3.2 Atlas surovin ("Občanka suroviny")

* Zdroj: `public/data/ingredients.csv` (nutriční profil, forma, původ, limity).
* UI: mřížka karet (`IngredientCard.tsx`) + detail. Filtr `FilterBar.tsx` (např. vysoký protein, nízký tuk).
* Nutriční data zahrnují makro/mikro živiny, vitaminy, energii, toxicitu. Při zobrazování uvádět jednotky.

### 3.3 Mixárna (Mix Lab)

* UI komponenta `MixCalculator.tsx` (klientská). Obsahuje formulář pro výběr druhu, přidávání ingrediencí a procent.
* Výpočet: využít `lib/nutritionMath.ts` (vážený průměr na 100 g as-fed). Vypočítat i Ca:P poměr.
* Výstup: tabulka s výslednými hodnotami + grafy (Recharts – `NutrientChart.tsx`).
* Integrace: možnost exportu (CSV/PDF) přes `/app/api/export.ts`. Připravený endpoint pro budoucí optimalizátor (`/app/api/optimizer.ts`).

### 3.4 Můj Garáž (My Garage)

* Zobrazení uložených mixů, oblíbených druhů a surovin, poznámek. Zatím bez Supabase Auth – data v localStorage (`exomix.mixes`, `exomix.favorites`, ...).
* UI: `GaragePanel.tsx`. Zajistit CRUD operace nad localStorage pomocí klientských hooků.
* Připravit struktury pro pozdější cloud sync (Supabase).

## 4) Datové modely

Zdrojové CSV transformujeme na následující typy (`types/types.ts`):

```ts
export interface Parrot {
  id: string
  name: string
  latin: string
  ringNumber: string
  family: string
  genus: string
  continent: string
  habitat: string
  activity: string
  dietNotes: string
  protein: number
  fat: number
  fiber: number
  ca: number
  p: number
  vitA: number
  vitD3: number
  vitE: number
  caPRatio: number
  bioptio: string
  reproduction: string
  incubationDays: number
  weightLossPct: number
  humidity: string
  imageUrl: string
  qrUrl: string
}

export interface Ingredient {
  id: string
  name: string
  form: string
  origin: string
  protein: number
  fat: number
  carbs: number
  fiber: number
  ash: number
  energyKj: number
  ca: number
  p: number
  na: number
  k: number
  mg: number
  fe: number
  zn: number
  cu: number
  mn: number
  se: number
  vitA: number
  vitD3: number
  vitE: number
  vitK: number
  vitBComplex: Record<string, number>
  toxicity: string
  imageUrl: string
  qrUrl: string
}

export interface Recipe {
  id: string
  name: string
  speciesId: string
  ingredients: { id: string; percentage: number }[]
  notes?: string
  createdAt: string
}
```

> **Poznámka:** CSV pole mapujte na uvedené typy; chybějící hodnoty defaultujte na `null` nebo 0 dle smyslu.

## 5) API kontrakty (App Router)

* `GET /api/data/parrots` → vrací seznam papoušků (z `parrots.csv`).
* `GET /api/data/ingredients` → vrací seznam surovin (z `ingredients.csv`).
* `GET /api/data/recipes` → vrací recepty (zatím z `recipes.csv` nebo localStorage stub).
* `POST /api/mix` → vstup `{ speciesId?: string, items: { ingredientId: string, percent: number }[] }`. Výstup `{ per100g: NutrientResultMap, ca_p_ratio: number }`.
* `POST /api/targets/compare` → vstup `{ mixResult, species }`; výstup `{ rows: { code, unit, actual, target, coverage_pct }[] }`.
* `POST /api/export` → generuje CSV/PDF (pro vývoj může vracet pouze CSV string/download link).
* `POST /api/optimizer` → placeholder pro budoucí AI optimalizaci (vracej `501 Not Implemented`).

## 6) Výpočetní pravidla (nutritionMath)

* **Vážený průměr:** `Σ(nutrient_i × percent_i / 100)` na 100 g směsi (as-fed).
* **CA:P poměr:** pokud jsou dostupné hodnoty, spočítat `ca / p`, jinak `null`.
* **Coverage:** `actual / target × 100` (použít pouze pokud target > 0).
* **Validace směsi:** UI hlídá, aby součet procent byl 100 ± tolerance; engine počítá i při odchylce (vypíše varování).

## 7) Struktura projektu

```
exomix/
├── app/
│   ├── parrots/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── ingredients/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── mixer/page.tsx
│   ├── garage/page.tsx
│   ├── api/
│   │   ├── data/
│   │   │   ├── parrots/route.ts
│   │   │   ├── ingredients/route.ts
│   │   │   └── recipes/route.ts
│   │   ├── mix/route.ts
│   │   ├── targets/compare/route.ts
│   │   ├── export/route.ts
│   │   └── optimizer/route.ts
│   └── layout.tsx
├── components/
│   ├── ParrotCard.tsx
│   ├── IngredientCard.tsx
│   ├── MixCalculator.tsx
│   ├── NutrientChart.tsx
│   ├── FilterBar.tsx
│   └── GaragePanel.tsx
├── lib/
│   ├── supabaseClient.ts
│   └── nutritionMath.ts
├── public/data/
│   ├── parrots.csv
│   ├── ingredients.csv
│   ├── nutrients_reference.csv
│   └── recipes.csv
└── types/
    └── types.ts
```

## 8) Integrace s VetExotic Cloud

| Modul | Popis integrace | Status v1.1 |
|-------|-----------------|-------------|
| Můj Exot | QR linky na profil zvířete, synchronizace směsí | Placeholder linky |
| VetExotic Cloud | Sdílení dat napříč klinikami | Design ready |
| RegistrPtaku.cz | QR identifikace druhu a směsi | Připravené QR pole |
| Laguna Rescue Center | Rehabilitační protokoly | Data pipeline (TODO) |
| VetEdu Hub | Edukační obsah a kurzy | Link placeholder |

## 9) Verze produktu

| Verze | Funkce |
|-------|--------|
| **v1.0 – Core Pack** | Atlas papoušků, Atlas surovin, základní Mixárna |
| **v1.1 – Core Pack+** | Přidán modul Můj Garáž, grafy v Mixárně, export |
| **v2.0 – Pro** | Supabase Auth, cloud sync, sdílení receptů |
| **v3.0 – AI** | AI optimalizace mixů, doporučení |
| **v4.0 – Edu** | Propojení s VetEdu Hub, vzdělávací materiály |

## 10) Implementační zásady

**Ano:**

* Dodržuj typy a API kontrakty výše.
* Používej existující nutrient kódy (viz CSV) a jednotky.
* Piš komponenty kompatibilní s App Routerem, využívej Tailwind + shadcn/ui.
* Při exportu používej standardní knihovny (např. `papaparse` pro CSV).
* Připrav kód na pozdější Supabase integraci (oddělené vrstvy).

**Ne:**

* Nezaváděj autentizaci, pokud není explicitně požadována.
* Neměň datové kontrakty bez konzultace.
* Nepřidávej těžké závislosti (zvaž velikost bundlu).
* Nepoužívej experimentální API Next.js, která nejsou stabilní ve verzi 14.

## 11) Motto

> **„ExoMix – Science for feathers.“**

ExoMix spojuje vědecká data a praxi chovatelů do jednoho digitálního nástroje. Každý commit by měl přiblížit platformu k přesné výživě a lepší péči o exotická zvířata.
