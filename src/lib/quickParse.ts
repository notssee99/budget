import type { Category, TransactionType } from '@/types';
import { detectCategory, detectType } from '@/lib/categoryDetection';

// ---------------------------------------------------------------------------
// QuickInputResult (inline — mirrors what @/types should export)
// ---------------------------------------------------------------------------
export interface QuickInputResult {
  description: string;
  amount: number;
  category: Category;
  type: TransactionType;
}

// ---------------------------------------------------------------------------
// parseQuickInput
// ---------------------------------------------------------------------------

/**
 * Parses a freeform quick-entry string into a structured result.
 *
 * Accepted formats (order of amount and description is flexible):
 *   "Coffee 2.5"
 *   "2.5 Coffee"
 *   "45 Fuel"
 *   "Salary 1734"
 *   "Lidl 36"
 *
 * Returns null if no valid numeric amount is found.
 */
export function parseQuickInput(input: string): QuickInputResult | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Match an integer or decimal number anywhere in the string.
  // We look for the first standalone number (not part of a word like "H&M1").
  const amountRegex = /(?:^|\s)([\d]+(?:[.,][\d]{1,2})?)(?:\s|$)/;
  const match = trimmed.match(amountRegex);

  if (!match) return null;

  // Normalise decimal separator (support both '.' and ',')
  const rawNumber = match[1].replace(',', '.');
  const amount = parseFloat(rawNumber);

  if (isNaN(amount) || amount <= 0) return null;

  // Remove the matched number (and surrounding whitespace) to get the description
  const descriptionRaw = trimmed
    .replace(match[0], ' ')
    .trim()
    .replace(/\s{2,}/g, ' ');

  const description = capitalize(descriptionRaw) || 'Untitled';

  const category = detectCategory(description);
  const type = detectType(description, amount);

  return {
    description,
    amount,
    category,
    type,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}
