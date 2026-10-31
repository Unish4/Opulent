import type { PlayerFormValues } from "./playerSchema";

interface OrderDraft {
  slug: string;
  packageId: string | null;
  values: PlayerFormValues;
}

const KEY = "opulent:order-draft";

export const saveDraft = (draft: OrderDraft): void => {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(draft));
  } catch {
    return;
  }
};

export const loadDraft = (slug: string): OrderDraft | null => {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as OrderDraft;
    return draft.slug === slug ? draft : null;
  } catch {
    return null;
  }
};

export const clearDraft = (): void => {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    return;
  }
};
