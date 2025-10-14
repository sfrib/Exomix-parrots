
-- User-level preferences and blacklist/soft-avoid
create table if not exists recipe_preferences (
  id text primary key default gen_random_uuid(),
  recipe_id text references recipes(id) on delete cascade,
  hard_exclude jsonb not null default '[]', -- [ingredient_ids or tags]
  soft_avoid jsonb not null default '[]',
  preferred jsonb not null default '[]',
  texture jsonb, -- {crunchy:bool, ground:bool, soft:bool}
  limits jsonb   -- {fatMax: number, fiberMin: number, sugarMax: number, caToP: "2:1"}
);
