# ExoMix Product Roadmap

> „S láskou namícháno pro vašeho papouška. ExoMix připravuje. Kubíček doporučuje. VetExotic garantuje.“

This roadmap translates VetExotic Group's long term vision into incremental releases for ExoMix, the intelligent nutrition configurator and mixing platform for parrots.

## Mission & Ecosystem Alignment

- **Mission:** Centralise nutrition knowledge, formulate personalised blends, and connect ExoMix with the broader VetExotic ecosystem (Můj Exot, VetExotic Clinic, VetExotic Shop, RegistrPtaku.cz, VetEdu.cz, ExoMix Feeder IoT).
- **Principles:** Professional yet intuitive, dynamic but safe, automated with human empathy.
- **Tagline:** "ExoMix připravuje. Kubíček doporučuje. VetExotic garantuje."

## Core Modules

| Module | Purpose |
| --- | --- |
| 🧠 Solver | Compute nutrient balance of a recipe using ingredient ratios. |
| ✅ Validator | Highlight deviations from ideal nutrient ranges, including Ca:P, fat, fibre, protein. |
| 🔄 Mode Validator | Adjust nutrient limits per life-stage or recovery mode. |
| 🦜 Profiles | Encyclopaedia of parrots and other birds with taxonomy, habitats, and nutrition goals. |
| 🧴 Ingredients | Database of seeds, grains, fruits, supplements, oils, minerals, vitamins, premixes. |
| ⚙️ Admin Panel | CRUD interface for managing ingredients and species metadata. |
| 📈 Mix History | Persist and revisit previous blends with edit + load functionality. |
| 🧾 PDF Export & Label Generator | Generate printable nutrition reports and bag labels with QR codes. |
| 🧠 AI Advisor Kubíček | Provide guided blend recommendations informed by diagnostics. |
| 📲 Notifications & Checklists | Reminders for supplement schedules and pre-mixing checklist. |
| 🪶 Subprofiles | Per-parrot seasonal or health-specific sub profiles (e.g., "Zima", "Nemocná játra"). |
| ☁️ Cloud Sync | Store recipes and nutrition data in Supabase / VetExotic Cloud. |
| 🔌 IoT Hardware | Integrate with ExoMix Feeder for automated dosing. |

## Architecture Overview

- **Frontend:** Next.js (App Router), React, TypeScript, TailwindCSS, Zustand for focused client state, jsPDF for labels, React Query/SWR for data fetching, Vercel deployments.
- **Backend:** Next.js API Routes (Express-compatible), CRUD endpoints for ingredients, profiles, mixes; JWT/Clerk authentication; Zod validation.
- **Database:** Prototype JSON (offline), production Supabase/PostgreSQL with key models (Ingredient, Profile, Mix, User, Reminder).
- **Storage:** Supabase buckets and JSON backups.
- **AI:** OpenAI (GPT-5) for Kubíček advisor.
- **Monitoring:** Logtail, Sentry.

## Data Model Snapshot

### Ingredient

| Field | Type | Notes |
| --- | --- | --- |
| id | UUID | Primary key |
| name | Text | Ingredient name |
| category | Text | Grain, oil, supplement, etc. |
| protein | Float | Percent protein |
| fat | Float | Percent fat |
| fiber | Float | Percent fibre |
| calcium | Float | Percent Ca |
| phosphorus | Float | Percent P |
| omega3 | Float | Percent ω3 |
| omega6 | Float | Percent ω6 |
| energy | Float | kJ/kg |

### Profile

| Field | Type | Notes |
| --- | --- | --- |
| id | UUID | Species identifier |
| name | Text | Species name |
| protein_min | Float | Minimum protein target |
| protein_max | Float | Maximum protein target |
| fat_min | Float | Minimum fat target |
| fat_max | Float | Maximum fat target |
| Ca_P_ratio | Float | Ideal Ca:P |

## Release Phases

| Phase | Description | Status |
| --- | --- | --- |
| ✅ **V1** | Local editor, solver, validator, PDF export | Complete |
| 🚧 **V2** | Web application with admin CRUD | In progress |
| 🔜 **V3** | Kubíček AI advisor (GPT integration) | Planned |
| 🔜 **V4** | VetExotic Clinic / RegistrPtaku integration | Planned |
| 🔜 **V5** | PWA / mobile app | Planned |
| 🔜 **V6** | IoT feeder + cloud | Planned |

## Detailed Vision

- **Mission:** Provide scientifically accurate, modular tooling for mixing, evaluating, and tracking parrot nutrition through life cycles.
- **User Segments:** Professional breeders, veterinarians, VetExotic partners.
- **Key Integrations:**
  - VetExotic Clinic – read laboratory results to inform AI-driven blends.
  - RegistrPtaku.cz – link registered parrots to their nutrition profiles.
  - VetEdu.cz – interactive nutrition education modules tied to live data.
  - Můj Exot – mobile experience for tracking mixes, weight, and health.
  - VetExotic Shop – direct ordering with printable labels & QR codes.
  - ExoMix Hardware – future dosing automation with ExoMix Cloud sync.

## Deployment Targets

| Layer | Technology |
| --- | --- |
| Frontend | Next.js on Vercel |
| Backend | Next.js API Routes / Express deployment |
| Database | Supabase/PostgreSQL |
| Storage | Supabase buckets / JSON backup |
| AI | OpenAI API (GPT-5) |
| Monitoring | Logtail, Sentry |

## Team Roles

| Role | Responsibilities |
| --- | --- |
| Dr. Hector Sebastian Franco | Project manager, veterinary guarantor |
| IT Manager | Architecture, API, DevOps |
| Frontend Developer | UI/UX, Next.js, React, Tailwind |
| Backend Developer | API, database, integrations |
| AI Engineer | Kubíček advisor logic |
| Design Team | Branding, UI, labels, print |
| QA & Tester | Validation of nutrition logic |
| Marketing | Communication with breeders, e-shop integrations |

---

The roadmap above should guide prioritisation, architecture decisions, and future tasks. All implementation work should reference the relevant phase and module so the ExoMix product remains aligned with VetExotic Group's strategic objectives.
