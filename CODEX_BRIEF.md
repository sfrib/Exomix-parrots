# ExoMix — Codex Brief (v0.1)

## 1) Mise & rozsah

* **Cíl:** Webová appka pro návrh krmných směsí pro papoušky. MVP bez loginu.
* **Moduly v MVP:**

  1. Atlas papoušků (10 druhů)
  2. Suroviny (10 položek)
  3. Mixárna (výpočet směsi + porovnání s cíli druhu)
  4. Moje mixy (uložení do localStorage)
* **Technologie:** Next.js (App Router), TS, Tailwind; data zatím **in-memory JSON**. Připravené schéma pro Supabase.

## 2) Navigace (bez loginu)

* Horní menu: **Atlas papoušků**, **Suroviny**, **Mixárna**, **Moje mixy**.
* Atlas/Suroviny se zobrazují jako **grid karty**, detail jako **občanka** (parametry + cíle/nutrienty).
* Mixárna: výběr druhu → procenta surovin → výpočet per 100 g (as-fed) → porovnání s cíli → uložit do „Moje mixy“.
* Moje mixy: čte/maže položky z `localStorage` klíč `exomix.mixes`.

## 3) Datové kontrakty (JSON)

### 3.1 Species (řádek v `data/species.json`)

```
{
  "id": "UUID/string",
  "scientific_name": "Ara ararauna",
  "common_name": "Ara ararauna (Blue-and-yellow macaw)",
  "category": "parrot",
  "adult_mass_g": 900,
  "ring_size_mm": 20,
  "biotope": "text",
  "diet_nature": "text",
  "target": {
    "PROTEIN": 14,
    "FAT": 10,
    "FIBER": 6,
    "CA": 0.6,
    "P": 0.4,
    "CA_P_RATIO": 1.5,
    "VIT_A_IU": 5000,
    "VIT_D3_IU": 600,
    "VIT_E": 20
  },
  "targetUnits": {
    "PROTEIN": "g/100g",
    "FAT": "g/100g",
    "FIBER": "g/100g",
    "CA": "g/100g",
    "P": "g/100g",
    "CA_P_RATIO": "ratio",
    "VIT_A_IU": "IU/100g",
    "VIT_D3_IU": "IU/100g",
    "VIT_E": "mg/100g"
  }
}
```

### 3.2 Ingredient (řádek v `data/ingredients.json`)

```
{
  "id": "ing-sunflower",
  "name": "Sunflower seed (Slunečnice černá)",
  "form": "seed",
  "moisture_pct": 6,
  "price_czk_per_kg": 55,
  "supplier": "string?",
  "notes": "string?",
  "nutrients": {
    "ENERGY_KCAL": 585,
    "PROTEIN": 20.5,
    "FAT": 51.0,
    "FIBER": 9.0,
    "ASH": 3.0,
    "CA": 0.23,
    "P": 0.57,
    "NA": 0.002,
    "K": 0.75,
    "MG": 0.37,
    "FE": 5.0,
    "ZN": 5.0,
    "VIT_A_IU": 20,
    "VIT_E": 37,
    "MOISTURE": 6
  }
}
```

### 3.3 Nutrient kódy (používané klíče)

```
ENERGY_KCAL, PROTEIN, FAT, FIBER, ASH, CARBS,
CA, P, NA, K, MG, FE, ZN, CU, MN, SE,
VIT_A_IU, VIT_D3_IU, VIT_E, VIT_K, VIT_C,
B1, B2, B3, B5, B6, B7, B9, B12,
MOISTURE, OMEGA3, OMEGA6, CA_P_RATIO
```

## 4) API kontrakty (App Router)

* `GET /api/data/species` → `Species[]`
* `GET /api/data/ingredients` → `Ingredient[]`
* `POST /api/mix` → vstup:

```
{
  "items": [ { "ingredient": { "id": "ing-sunflower", "name": "..." }, "percent": 30 } ],
  "nutrientsByIngredient": { "ing-sunflower": { "PROTEIN": 20.5, "...": 0 } }
}
```

→ výstup:

```
{
  "per100g": { "PROTEIN": { "code": "PROTEIN", "unit": "", "weighted_value": 12.3 }, "...": {} },
  "ca_p_ratio": 1.55
}
```

* `POST /api/targets/compare` → vstup:

```
{ "mixResult": { ...z /api/mix }, "species": { ...Species } }
```

→ výstup:

```
{ "species": {...}, "rows": [ { "code": "PROTEIN", "unit": "g/100g", "actual": 12.3, "target": 14, "coverage_pct": 87.9 } ] }
```

## 5) Výpočetní pravidla (engine)

* **Vážený průměr**: nutrient na 100 g směsi = `Σ( nutrient_i × percent_i/100 )`.
* **CA:P ratio**: pokud existují `CA` i `P`, `CA/P`.
* **Porovnání**: `coverage_pct = actual / target * 100` (pokud má druh definovaný cíl).
* **Validace směsi**: součet `%` přísad by měl = 100 (UI zvýrazní, ale engine počítá i při ≠100).

## 6) UI logika

* **Atlas/Suroviny (grid)**: karty → klik na detail „občanka“ (základní parametry + cíle/nutrienty).
* **Mixárna**:

  * Select **cílový druh** (volitelný).
  * Vstup **% podílů** pro každou surovinu (0–100).
  * Tlačítko **Spočítat** → volá `/api/mix`, pak volitelně `/api/targets/compare`.
  * **Uložit mix** → `localStorage["exomix.mixes"]`.
* **Moje mixy**: list uložených mixů, možnost smazat.

## 7) Souborová kostra (minimum)

```
app/
  api/
    mix/route.ts
    targets/compare/route.ts
    data/
      species/route.ts
      ingredients/route.ts
  layout.tsx
  page.tsx
  species/page.tsx
  species/[id]/page.tsx
  ingredients/page.tsx
  ingredients/[id]/page.tsx
  mixarna/page.tsx
  my-mixes/page.tsx
components/
  Nav.tsx
  SpeciesCard.tsx
  IngredientCard.tsx
  QuickMix.tsx (volitelně)
lib/
  nutrition.ts
  data.ts
data/
  species.json
  ingredients.json
styles/
  globals.css
```

## 8) Akceptační kritéria (MVP)

* [ ] Build projde, `pnpm dev` → domovská stránka s úvodem + odkaz na Mixárnu.
* [ ] `/species` a `/ingredients` zobrazí **10 karet**; detail funguje.
* [ ] `/mixarna` spočítá směs z libovolných podílů, ukáže CA:P, porovná s cíli vybraného druhu.
* [ ] `/my-mixes` ukládá/maže mixy v `localStorage`.
* [ ] Žádný login/autorizace.

## 9) Ne/ano checklist (pro Codex)

**Dělej:**

* Dodržuj I/O kontrakty výše.
* Používej stávající nutrient kódy.
* Piš TS/Next kód kompatibilní s App Router.
* Minimalizuj závislosti (Tailwind OK).

**Nedělej:**

* Nezaváděj login/uživatele.
* Nepřidávej DB vrstvy, pokud není výslovně požadováno (zatím JSON).
* Neměň kódy nutrientů ani struktury bez důvodu.

## 10) Jedno-záběrové příklady (one-shot)

### 10.1 Vytvořit nový druh

* Přidej objekt do `data/species.json` dle kontraktu; dbej na `target` mapu a `ring_size_mm`.

### 10.2 Přidat novou surovinu

* Přidej objekt do `data/ingredients.json`; vyplň `nutrients` na 100 g (as-fed).

### 10.3 Výpočet směsi v Mixárně

* Z lokálních JSON načti suroviny → sestav mapu `nutrientsByIngredient` → POST `/api/mix` → POST `/api/targets/compare` (pokud je vybrán druh).

---
