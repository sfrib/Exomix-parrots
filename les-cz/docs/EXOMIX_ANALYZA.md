# Analýza podkladů ExoMix pro LES.cz

Datum analýzy: 18. 11. 2026

## Co bylo prohledáno

| Zdroj | Výsledek |
| --- | --- |
| Repozitář `sfrib/exomix-parrots` – aktuální stav | prohledány všechny soubory (`app/`, `src/`, `lib/`, `prisma/`, `sql/`, `labels/`, `emails/`, `docs/`) |
| Git historie repozitáře | obnoveny smazané soubory `data/ingredients.json`, `data/premix.json`, `data/profiles.json`, `data/modes.js`, `data/history.json`, `components/Kubicek*.tsx`, `utils/*.ts`, původní `README.md` |
| Google Drive (účet VetExotic) | hledány soubory ExoMix, byliny, receptury, rostliny, krmivo, Laguna. Nalezena jen složka „Laguna“ (crowdfundingový koncept z r. 2017, seznam papoušků). Nalezené účetní a klinické doklady obsahují osobní údaje klientů a pro LES.cz se **nepoužily**. |
| Projektová paměť | v tomto prostředí nebyla k dispozici |

## Co ExoMix obsahuje (A – použito na LES.cz)

| Údaj | Kde v ExoMixu | Použití na LES.cz |
| --- | --- | --- |
| Kategorie papoušků „Malý papoušek / Střední papoušek / Velký ara“ | `src/types/types.ts`, `src/lib/targets.ts` | rozdělení „Vhodnost podle druhů“ na každé kartě |
| Profily 17 druhů (hmotnost, denní příjem, poznámky) – např. *Neophema splendida* a *Agapornis roseicollis* citliví na přebytek tuku | `data/profiles.json` (smazáno, obnoveno z historie) | poznámky u lískových oříšků |
| Lískové ořechy (mleté), ostropestřec (limitovaný), lněné a dýňové semínko, proso, saflor – složky vzorové receptury | `labels/label_schema.sample.json`, `app/recipes/[id]/label/page.tsx` | karty Lískové oříšky, Ostropestřec |
| Ostropestřecový olej (tuk 99 %, ω-6 40 %), pupalkový olej | `data/premix.json` | karta Ostropestřec |
| Režim „hepatopatie“ (tuk 3–6 %, vláknina 8–14 %), tip Kubíčka „Na játra bych ti tam hodil ostropestřec“ | `data/modes.js`, `components/KubicekTips.tsx` | karta Ostropestřec (s upozorněním, že léčbu určuje veterinář) |
| Bezpečnostní limity „aflatoxiny, oxaláty, Ca:P“ | `lib/ai/prompts.ts` | karta Plísně |
| Validátor: tuk > 20 %, Ca:P mimo 1,3–2,5, vláknina < 5 % | `utils/validator.ts` (smazáno) | poznámka u lískových oříšků |

## Co ExoMix NEOBSAHUJE

- databázi lesních plodů, dřevin, bylin ani planých rostlin,
- seznam toxických rostlin,
- nutriční data pro lesní materiály (ExoMix má jen 3 semena: slunečnice černá, oves nahý, mungo),
- informace o sběru, identifikaci rostlin a přírodních hračkách.

**Proto je naprostá většina databáze LES.cz nově zpracovaná (B nebo C)** a čeká na odbornou kontrolu. Žádná data nebyla vymyšlena jako „převzatá z ExoMixu“.

## Rozdělení původu informací

- **A – ExoMix:** jen údaje z tabulky výše.
- **B – odborná literatura:** jen tam, kde zdroj z registru `data/sources.ts` daný údaj prokazatelně pokrývá (toxikologie rostlin, určovací znaky, právní předpisy, aspergilóza, avokádo). Konkrétní strany doplní odborná kontrola.
- **C – k ověření:** chovatelská praxe (seznamy „bezpečných dřevin“), doporučená množství, postupy přípravy, všechny číselné nutriční hodnoty z USDA (vztahují se k pěstovaným odrůdám, ne k planým druhům).

Aktuální podíl A/B/C ukazuje stránka `/zdroje`.

## Doporučení pro další propojení s ExoMixem

1. Přesunout databázi rostlin do sdíleného balíčku (např. `packages/nature-db`), aby ji mohl číst ExoMix i LES.cz.
2. Doplnit do ExoMixu kategorii „čerstvé krmivo / zeleň“ a napojit ji na karty LES.cz.
3. Sjednotit kategorie druhů papoušků (LES.cz používá kategorie ExoMixu).
