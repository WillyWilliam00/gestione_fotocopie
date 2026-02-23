import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { AxiosError } from "axios"
import type { Utente } from "@shared/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatError(err: unknown, defaultMessage = "Si è verificato un errore."): string {
  if (err instanceof AxiosError) {
    return (err.response?.data?.error as string) || err.message || defaultMessage
  }
  if (err instanceof Error) return err.message
  return defaultMessage
}

export function utenteDisplayName(u: Utente): string {
  return u.ruolo === "admin" ? (u as { email: string }).email : (u as { username: string }).username;
}