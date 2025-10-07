🦜 ExoMix – Inteligentní výživový konfigurátor a míchačka krmných směsí pro papoušky

**ExoMix** je komplexní webová aplikace z dílny **VetExotic Group**, určená pro profesionální chovatele a veterináře exotických ptáků.  
Jejím cílem je nabídnout **vědecky přesné, přehledné a modulární prostředí pro míchání, vyhodnocování a sledování výživy papoušků** v různých životních situacích (odchov, nemoc, rekonvalescence, zimní sezóna apod.).

---

## 🧭 Hlavní mise

- Centralizovat data o výživě, doplňcích a druzích ptáků.  
- Umožnit personalizované návrhy směsí podle laboratorních výsledků, hmotnosti a sezóny.  
- Vytvořit propojený ekosystém s dalšími projekty VetExotic:
  - **MŮJ EXOT (mobilní aplikace)** – správa zvířat, historie krmení, QR pasy.
  - **VetExotic Clinic** – veterinární záznamy a laboratorní výsledky.
  - **VetExotic Shop** – online objednávky směsí.
  - **RegistrPtaku.cz** – párování identifikovaných papoušků se směsí.
  - **VetEdu.cz** – vzdělávací modul s interaktivní výukou výživy.

---

## 💡 Vize systému

> „ExoMix připravuje. Kubíček doporučuje. VetExotic garantuje.“

Aplikace má být:
- **Odborná, ale intuitivní.**
- **Dynamická, ale bezpečná.**
- **Automatizovaná, ale s lidským přístupem.**

---

## 🧩 Klíčové funkce

| Modul | Popis |
|--------|-------|
| 🧠 **Solver** | Výpočet nutriční bilance směsi z poměrů ingrediencí. |
| ✅ **Validator** | Upozorňuje na odchylky od ideálních hodnot, sleduje Ca:P poměr, tuk, vlákninu, bílkoviny. |
| 🔄 **Mode Validator** | Přepočítává výživové limity podle režimu (např. rekonvalescence, hnízdění, línání). |
| 🦜 **Profiles** | Obsahuje detailní profily papoušků, pěvců a jiných druhů (Ara, Žako, Amazoňan, Kanár, Korela…). |
| 🧴 **Ingredients (Suroviny)** | Databáze semen, zrnin, ovoce, doplňků, olejů, minerálů, vitamínů a premixů (Nekton, Versele Laga, Roboran). |
| ⚙️ **Admin Panel** | Umožňuje přidávat, upravovat a mazat ingredience a jejich nutriční hodnoty. |
| 📈 **Historie mixů** | Uchovává přehled dříve vytvořených směsí, umožňuje načtení a úpravu. |
| 🧾 **PDF export & Label Generator** | Vytváří tisknutelný výživový protokol + štítek na pytel s QR kódem. |
| 🧠 **AI poradce Kubíček** | Navrhuje směsi, vysvětluje logiku, radí podle diagnostických údajů. |
| 📲 **Notifikace & Checklisty** | Připomínky (např. přidání Ca, doplnění oleje) + kontrolní seznam před mícháním. |
| 🪶 **Subprofily papoušků** | Jeden papoušek může mít různé stavy: „Zima“, „Hnízdění“, „Nemocná játra“. |
| ☁️ **Integrace cloud storage** | Uložení receptur a výživových dat do VetExotic databáze / Supabase. |
I 🔌 IoT Hardware	Automatické dávkování krmiva (ExoMix Feeder).
---

## 🧱 Architektura

### Frontend
- **Next.js (React, TypeScript)**
- **TailwindCSS**
- **Zustand** – správa stavu
- **jsPDF** – export PDF protokolů
- **React Query / SWR** – komunikace s API
- **Vercel Deployment**

### Backend
- **Next.js API Routes / Express kompatibilní**
- **CRUD endpointy pro suroviny, profily a směsi**
- **Autentizace (JWT nebo Clerk)**
- **Validace dat (Zod)**

### Databáze
- Prototyp: JSON (offline test)
- Produkční: **Supabase / PostgreSQL**
- Modely:
  - `Ingredient`
  - `Profile`
  - `Mix`
  - `User`
  - `Reminder`

---

## 📦 Struktura projektu

exomix/
│
├── data/
│ ├── ingredients.json
│ ├── profiles.json
│ ├── modes.json
│ ├── history.json
│ └── supplements.json
│
├── utils/
│ ├── solver.ts
│ ├── validator.ts
│ ├── modeValidator.ts
│ ├── nutritionUtils.ts
│ ├── labelGenerator.ts
│ ├── pdfGenerator.ts
│ └── aiAssistant.ts
│
├── components/
│ ├── MixEditor.tsx
│ ├── IngredientSelector.tsx
│ ├── ModeSelector.tsx
│ ├── ProfileSelector.tsx
│ ├── SaveMix.tsx
│ ├── LoadFromLocal.tsx
│ ├── HistoryViewer.tsx
│ ├── LabelPreview.tsx
│ ├── PDFExport.tsx
│ ├── ChecklistPanel.tsx
│ ├── Reminder.tsx
│ ├── FAQ.tsx
│ └── AdminDashboard.tsx
│
├── pages/
│ ├── index.tsx
│ ├── admin.tsx
│ └── api/
│ ├── ingredients.ts
│ ├── profiles.ts
│ └── mixes.ts
│
├── public/
│ ├── logo.png
│ ├── favicon.ico
│ └── qr-template.png
│
├── styles/
│ └── globals.css
│
├── package.json
├── README.md
├── next.config.js
└── tsconfig.json

yaml
Zkopírovat kód

---

## ⚙️ API – přehled endpointů

| Endpoint | Metoda | Popis |
|-----------|--------|--------|
| `/api/ingredients` | `GET` | Vrátí seznam všech surovin |
| `/api/ingredients/:id` | `GET` | Vrátí detailní info o surovině |
| `/api/ingredients` | `POST` | Přidá novou surovinu |
| `/api/ingredients/:id` | `PUT` | Aktualizuje existující surovinu |
| `/api/ingredients/:id` | `DELETE` | Smaže surovinu |
| `/api/profiles` | `GET` | Vrátí seznam všech druhů papoušků |
| `/api/modes` | `GET` | Vrátí režimy a jejich nutriční limity |
| `/api/mix` | `POST` | Uloží uživatelský mix |
| `/api/mix/:id` | `GET` | Načte konkrétní uloženou směs |
| `/api/export/pdf` | `POST` | Generuje PDF protokol |

---

## 🧰 Admin Dashboard

**Přístup:** `/admin` (chráněno heslem)

**Funkce:**
- CRUD pro suroviny a profily
- Validace hodnot (min/max)
- Import/Export JSON nebo CSV
- Audit log
- Historie změn (kdo, co, kdy upravil)
- Možnost synchronizace s **VetExotic Clinic DB**

---

## 🔗 Integrace s ostatními projekty VetExotic

| Projekt | Napojení |
|----------|-----------|
| **VetExotic Clinic** | Přímé čtení laboratorních výsledků → AI návrh směsi (např. po operaci jater). |
| **RegistrPtaku.cz** | Každý papoušek má ID, které se váže k jeho výživovému profilu. |
| **VetEdu.cz** | E-learning o výživě ptáků + propojení na ExoMix simulátor. |
| **MŮJ EXOT App** | Mobilní rozhraní pro sledování směsí, váhy a stavu ptáka. |
| **VetExotic Shop** | Přímá objednávka směsi → tisknutelný štítek, QR na balení. |
| **ExoMix Hardware (IoT)** | Plánovaný automatický dávkovač krmiva, napojený na směsi z databáze. |

---

## 🧮 Datový model (Supabase / PostgreSQL)

### Ingredient
| Pole | Typ | Popis |
|------|-----|--------|
| id | UUID | Primární klíč |
| name | Text | Název suroviny |
| category | Text | Kategorie (zrní, olej, doplněk…) |
| protein | Float | % bílkovin |
| fat | Float | % tuku |
| fiber | Float | % vlákniny |
| calcium | Float | % Ca |
| phosphorus | Float | % P |
| omega3 | Float | % omega 3 |
| omega6 | Float | % omega 6 |
| energy | Float | kJ/kg |

### Profile
| Pole | Typ | Popis |
|------|-----|--------|
| id | UUID | Druh papouška |
| name | Text | Název druhu |
| protein_min | Float | min. požadavek |
| protein_max | Float | max. požadavek |
| fat_min | Float | min. požadavek |
| fat_max | Float | max. požadavek |
| Ca_P_ratio | Float | ideální poměr Ca:P |

---

## 🧭 Roadmapa vývoje

| Fáze | Popis | Stav |
|------|--------|------|
| ✅ V1 | Lokální editor, solver, validátor, export PDF | Hotovo |
| 🚧 V2 | Web app + admin CRUD | Probíhá |
| 🔜 V3 | AI poradce Kubíček (GPT API) | Plán |
| 🔜 V4 | Integrace VetExotic Clinic / RegistrPtaku | Plán |
| 🔜 V5 | PWA / mobilní app | Plán |
| 🔜 V6 | IoT dávkovač + propojení ExoMix Cloud | Plán |

---

## 🧱 Deployment

| Prostředí | Technologie |
|------------|-------------|
| Frontend | Next.js (Vercel) |
| Backend | API Routes / Express (Vercel / Railway) |
| Databáze | Supabase / PostgreSQL |
| Storage | Supabase Buckets / JSON Backup |
| AI | OpenAI API (ChatGPT 4 / GPT-5) |
| Monitoring | Logtail, Sentry |
| Version Control | GitHub + GitHub Actions CI/CD |

---

## 👥 Tým

| Role | Odpovědnost |
|------|--------------|
| **Dr. Hector Sebastian Franco** | Projektový manažer, veterinární garant |
| **IT Manager** | Architektura systému, API, DevOps |
| **Frontend Developer** | UI/UX, Next.js, React, Tailwind |
| **Backend Developer** | API, databáze, integrace |
| **AI Engineer** | Chatbot Kubíček, výživová logika |
| **Design Team** | Branding, UI, štítky, tisk |
| **QA & Tester** | Testování logiky výpočtů a validace |
| **Marketing** | Komunikace s chovateli, e-shop napojení |

---

| Fáze  | Popis                                | Stav    |
| ----- | ------------------------------------ | ------- |
| ✅ V1  | Lokální solver + PDF export          | Hotovo  |
| 🚧 V2 | Web CRUD a admin panel               | Probíhá |
| 🔜 V3 | AI Kubíček + GPT analýza             | Plán    |
| 🔜 V4 | VetExotic Clinic / Registr integrace | Plán    |
| 🔜 V5 | PWA mobilní verze                    | Plán    |
| 🔜 V6 | IoT Feeder + Cloud                   | Plán    |


## 🧠 Motto

> „S láskou namícháno pro vašeho papouška.  
> ExoMix připravuje. Kubíček doporučuje. VetExotic garantuje.“

---

© 2025 **VetExotic Group s.r.o.** – All rights reserved.
Chceš, abych ti to rovnou převedl do PDF verze (pro investory / tým) a přidal titulní stránku s logem VetExotic Group a ExoMix?









