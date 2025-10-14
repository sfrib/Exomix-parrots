
'use client';
import Button from './Button';
import { useState } from 'react';

export default function SaveBar({ onSave, onSubmitReview, onExportLabel, onPrintPDF }:
  { onSave:()=>Promise<void>|void; onSubmitReview:()=>Promise<void>|void; onExportLabel:()=>Promise<void>|void; onPrintPDF:()=>Promise<void>|void; }) {
  const [dirty, setDirty] = useState(true);
  return (
    <div className="fixed bottom-0 left-64 right-0 bg-white border-t shadow-card px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-sm">{dirty ? 'Neuložené změny' : 'Vše uloženo'}</span>
        <span className="kbd">Ctrl</span>+<span className="kbd">S</span>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="secondary" onClick={onExportLabel} title="Export etikety (HTML/PDF)">Etiketa</Button>
        <Button variant="ghost" onClick={onPrintPDF} title="Tisk PDF">Tisk PDF</Button>
        <Button variant="danger" onClick={onSubmitReview} title="Odeslat ke schválení vetovi">Odeslat vet</Button>
        <Button variant="primary" onClick={onSave} title="Uložit změny">Uložit</Button>
      </div>
    </div>
  );
}
