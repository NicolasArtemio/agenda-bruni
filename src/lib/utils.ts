import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalizeWords(value: string): string {
  return value
    .toLocaleLowerCase("es-AR")
    .replace(/(^|\s)(\S)/gu, (_, separator: string, char: string) =>
      separator + char.toLocaleUpperCase("es-AR"),
    );
}
