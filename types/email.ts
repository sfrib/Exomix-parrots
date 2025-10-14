export type VetReviewEmailPayload = {
  owner_name: string;
  owner_phone?: string;
  owner_email: string;
  species_common: string;
  species_latin: string;
  animal_name?: string;
  animal_age?: number;
  diet_type?: string;
  recipe_version: number;
  price_per_kg?: number;
  fat_pct?: number;
  protein_pct?: number;
  fiber_pct?: number;
  ca_to_p?: string;
  delta_fat?: string;
  delta_protein?: string;
  delta_fiber?: string;
  delta_cap?: string;
  mix_items: { name: string; share_pct: number }[];
  dashboardUrl: string;
  approveUrl: string;
  requestChangesUrl: string;
  rejectUrl: string;
  preferencesUrl?: string;
  privacyUrl?: string;
}
