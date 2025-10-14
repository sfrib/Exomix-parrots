
export const SYSTEM_PROMPT = `Jsi odborný nutriční poradce pro exotické ptáky. Dodržuj bezpečnostní limity (aflatoxiny, oxaláty, Ca:P) a preferuj vědecky podložené volby. Vracej konkrétní % a zdůvodnění.`;

export const MAKE_MIX_PROMPT = (input: {
  species: string;
  season?: 'zima'|'jaro'|'leto'|'podzim';
  targets: { fat?: number; protein?: number; fiber?: number; cap?: string };
  banned?: string[];
  softAvoid?: string[];
  preferred?: string[];
}) => `Navrhni krmnou směs pro ${input.species}.
Sezóna: ${input.season ?? 'celoročně'}
Cíle: tuk ${input.targets.fat ?? '-'} %, bílkoviny ${input.targets.protein ?? '-'} %, vláknina ${input.targets.fiber ?? '-'} %, Ca:P ${input.targets.cap ?? '-'}.
Nevyužívej (tvrdě vyloučit): ${(input.banned ?? []).join(', ') || '—'}.
Vyhýbej se (měkce): ${(input.softAvoid ?? []).join(', ') || '—'}.
Preferuj: ${(input.preferred ?? []).join(', ') || '—'}.
Vrať JSON s položkami: [{name, share_pct}] a souhrnem živin.`;
