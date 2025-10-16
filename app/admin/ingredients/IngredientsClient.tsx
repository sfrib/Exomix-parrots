'use client';

import { useMemo, useRef, useState } from 'react';

import type { Ingredient } from '@/src/types/types';

type IngredientAction = (formData: FormData) => Promise<void>;

interface Props {
  ingredients: Ingredient[];
  onCreate: IngredientAction;
  onUpdate: IngredientAction;
}

interface EditableIngredient extends Ingredient {}

function IngredientFormFields({ ingredient }: { ingredient?: Partial<EditableIngredient> }) {
  return (
    <div className="grid grid-cols-1 gap-3">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Název</span>
        <input
          name="name"
          required
          defaultValue={ingredient?.name ?? ''}
          className="rounded border border-slate-300 px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Kategorie</span>
        <input
          name="category"
          required
          defaultValue={ingredient?.category ?? ''}
          className="rounded border border-slate-300 px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Protein (%)</span>
        <input
          name="protein_pct"
          type="number"
          step="0.1"
          min="0"
          required
          defaultValue={ingredient?.protein_pct ?? ''}
          className="rounded border border-slate-300 px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Tuk (%)</span>
        <input
          name="fat_pct"
          type="number"
          step="0.1"
          min="0"
          required
          defaultValue={ingredient?.fat_pct ?? ''}
          className="rounded border border-slate-300 px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Vláknina (%)</span>
        <input
          name="fiber_pct"
          type="number"
          step="0.1"
          min="0"
          required
          defaultValue={ingredient?.fiber_pct ?? ''}
          className="rounded border border-slate-300 px-3 py-2"
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Vápník (%)</span>
          <input
            name="calcium_pct"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={ingredient?.calcium_pct ?? ''}
            className="rounded border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Fosfor (%)</span>
          <input
            name="phosphorus_pct"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={ingredient?.phosphorus_pct ?? ''}
            className="rounded border border-slate-300 px-3 py-2"
          />
        </label>
      </div>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Cena (Kč/kg)</span>
        <input
          name="price_per_kg"
          type="number"
          step="0.1"
          min="0"
          required
          defaultValue={ingredient?.price_per_kg ?? ''}
          className="rounded border border-slate-300 px-3 py-2"
        />
      </label>
    </div>
  );
}

export default function IngredientsClient({ ingredients, onCreate, onUpdate }: Props) {
  const [editing, setEditing] = useState<EditableIngredient | null>(null);
  const createDialogRef = useRef<HTMLDialogElement>(null);
  const editDialogRef = useRef<HTMLDialogElement>(null);

  const sortedIngredients = useMemo(
    () => [...ingredients].sort((a, b) => a.name.localeCompare(b.name)),
    [ingredients],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Ingredience</h1>
        <button
          type="button"
          onClick={() => createDialogRef.current?.showModal()}
          className="rounded bg-emerald-600 px-4 py-2 text-white shadow hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          Přidat ingredienci
        </button>
      </div>

      <dialog ref={createDialogRef} className="w-full max-w-lg rounded-lg border border-slate-200 p-6">
        <form
          action={async (formData) => {
            await onCreate(formData);
            createDialogRef.current?.close();
          }}
          className="space-y-4"
        >
          <h2 className="text-xl font-semibold">Nová ingredience</h2>
          <IngredientFormFields />
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => createDialogRef.current?.close()}
              className="rounded border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              Zavřít
            </button>
            <button
              type="submit"
              className="rounded bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              Uložit
            </button>
          </div>
        </form>
      </dialog>

      <dialog ref={editDialogRef} className="w-full max-w-lg rounded-lg border border-slate-200 p-6">
        <form
          action={async (formData) => {
            await onUpdate(formData);
            editDialogRef.current?.close();
          }}
          className="space-y-4"
        >
          <input type="hidden" name="id" value={editing?.id ?? ''} />
          <h2 className="text-xl font-semibold">Upravit ingredienci</h2>
          <IngredientFormFields ingredient={editing ?? undefined} />
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => editDialogRef.current?.close()}
              className="rounded border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              Zavřít
            </button>
            <button
              type="submit"
              className="rounded bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              Aktualizovat
            </button>
          </div>
        </form>
      </dialog>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                Název
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                Kategorie
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                Protein %
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                Tuk %
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                Cena Kč/kg
              </th>
              <th scope="col" className="px-4 py-3" aria-label="Akce" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {sortedIngredients.map((ingredient) => (
              <tr key={ingredient.id}>
                <td className="px-4 py-3 text-sm font-medium text-slate-900">{ingredient.name}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{ingredient.category}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{ingredient.protein_pct.toFixed(1)}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{ingredient.fat_pct.toFixed(1)}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{ingredient.price_per_kg.toFixed(2)}</td>
                <td className="px-4 py-3 text-right text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(ingredient);
                      editDialogRef.current?.showModal();
                    }}
                    className="rounded border border-slate-300 px-3 py-1 text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  >
                    Upravit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
