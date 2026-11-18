import { redirect } from 'next/navigation';

/** Krátká adresa pro „Rizikové rostliny“ (sociální sítě, tiskoviny). */
export default function RiskyRedirect() {
  redirect('/kategorie/rizikove-zbozi');
}
