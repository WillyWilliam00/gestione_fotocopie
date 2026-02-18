import { useState, useEffect } from "react";

/**
 * Restituisce un valore che si aggiorna solo dopo `delay` ms dall'ultimo cambio di `value`.
 * Utile per campi di ricerca: l'input è reattivo, la query parte solo quando l'utente smette di scrivere.
 *
 * @param value - Valore corrente (es. stato dell'input)
 * @param delay - Ritardo in ms (es. 300)
 * @returns Valore debounced da passare alla query
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
