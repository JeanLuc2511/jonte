/**
 * INHALTE  →  später: CMS oder Buchungs-Backend (Community-Projekte der Mitglieder)
 */
import { FAQ } from "@/lib/daten/faq";
import { PROJEKTE } from "@/lib/daten/projekte";

export async function getProjekte() {
  return PROJEKTE;
}

export async function getFaq() {
  return FAQ;
}
