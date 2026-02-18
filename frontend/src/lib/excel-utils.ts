import * as XLSX from "xlsx";
import type { BulkImportDocenti } from "../../../shared/validation.js";

/**
 * Legge un file Excel e restituisce un array di docenti nel formato atteso.
 * Accetta colonne con nomi flessibili (es. "limite", "copie effettuate").
 * @throws Error se il file è vuoto, formato non valido o validazione fallisce
 */
export function parseExcelFile(file: File): Promise<BulkImportDocenti["docenti"]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result as ArrayBuffer | null;
        if (!data) {
          throw new Error("Nessun dato letto dal file");
        }
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          raw: false,
        }) as Record<string, unknown>[];

        if (jsonData.length === 0) {
          reject(new Error("Il file Excel è vuoto"));
          return;
        }

        const getColumnValue = (row: Record<string, unknown>, candidates: string[]) => {
          for (const [key, value] of Object.entries(row)) {
            const normalized = key.toLowerCase().replace(/\s|_/g, "");
            if (candidates.includes(normalized)) return value;
          }
          return undefined;
        };

        const docenti = jsonData.map((row, index) => {
          const nomeRaw = getColumnValue(row, ["nome"]);
          const cognomeRaw = getColumnValue(row, ["cognome"]);
          const limiteRaw = getColumnValue(row, ["limitecopie", "limite"]);
          const copieRaw = getColumnValue(row, ["copieeffettuate", "copieeff", "copie"]);
          const noteRaw = getColumnValue(row, ["note"]);

          const nome =
            typeof nomeRaw === "string" ? nomeRaw.trim() : String(nomeRaw ?? "").trim();
          const cognome =
            typeof cognomeRaw === "string"
              ? cognomeRaw.trim()
              : String(cognomeRaw ?? "").trim();
          const limiteCopie = Number(limiteRaw ?? 0);
          const copieEffettuate = Number(copieRaw ?? 0);
          const note =
            typeof noteRaw === "string" ? noteRaw : noteRaw != null ? String(noteRaw) : "";

          if (!nome || !cognome) {
            throw new Error(`Riga ${index + 2}: nome e cognome sono obbligatori`);
          }
          if (isNaN(limiteCopie) || limiteCopie < 0) {
            throw new Error(`Riga ${index + 2}: limiteCopie deve essere un numero >= 0`);
          }
          if (isNaN(copieEffettuate) || copieEffettuate < 0) {
            throw new Error(
              `Riga ${index + 2}: copieEffettuate deve essere un numero >= 0`
            );
          }
          if (copieEffettuate > limiteCopie) {
            throw new Error(
              `Riga ${index + 2}: copieEffettuate (${copieEffettuate}) supera limiteCopie (${limiteCopie})`
            );
          }

          return {
            nome,
            cognome,
            limiteCopie,
            copieEffettuate,
            note: note ? String(note).trim() : undefined,
          };
        });

        resolve(docenti);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error("Errore nella lettura del file"));
    reader.readAsArrayBuffer(file);
  });
}
