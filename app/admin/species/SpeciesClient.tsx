'use client';

import { useMemo, useRef, useState } from 'react';

import { Species, SpeciesCategory } from '@/src/types/types';

type SpeciesAction = (formData: FormData) => Promise<void>;

interface Props {
  species: Species[];
  onUpdate: SpeciesAction;
}

const CATEGORY_OPTIONS: SpeciesCategory[] = ['Velký ara', 'Střední papoušek', 'Malý papoušek'];

export default function SpeciesClient({ species, onUpdate }: Props) {
  const [editing, setEditing] = useState<Species | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const ordered = useMemo(() => [...species].sort((a, b) => a.czechName.localeCompare(b.czechName)), [species]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Druhy</h1>

      <dialog ref={dialogRef} className="w-full max-w-lg rounded-lg border border-slate-200 p-6">
        <form
          action={async (formData) => {
            await onUpdate(formData);
            dialogRef.current?.close();
          }}
          className="space-y-4"
        >
          <input type="hidden" name="id" value={editing?.id ?? ''} />
          <h2 className="text-xl font-semibold">Upravit druh</h2>
          <div className="grid grid-cols-1 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Kategorie</span>
              <select
                name="category"
                className="rounded border border-slate-300 px-3 py-2"
                defaultValue={editing?.category ?? CATEGORY_OPTIONS[1]}
                required
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Hmotnost (g)</span>
              <input
                name="averageWeight_g"
                type="number"
                min="1"
                step="1"
                required
                defaultValue={editing?.averageWeight_g ?? ''}
                className="rounded border border-slate-300 px-3 py-2"
              />
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
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
                Hmotnost (g)
              </th>
              <th scope="col" className="px-4 py-3" aria-label="Akce" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {ordered.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.czechName}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{item.category}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{item.averageWeight_g.toFixed(0)}</td>
                <td className="px-4 py-3 text-right text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(item);
                      dialogRef.current?.showModal();
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
