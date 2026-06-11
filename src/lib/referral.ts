const REF_KEY = 'flashmatch_ref';
const REF_EXPIRY_KEY = 'flashmatch_ref_expiry';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export const saveReferralCode = (code: string) => {
  try {
    localStorage.setItem(REF_KEY, code);
    localStorage.setItem(REF_EXPIRY_KEY, String(Date.now() + THIRTY_DAYS_MS));
  } catch {}
};

export const getReferralCode = (): string | null => {
  try {
    const code = localStorage.getItem(REF_KEY);
    const expiry = localStorage.getItem(REF_EXPIRY_KEY);
    if (!code || !expiry) return null;
    if (Date.now() > Number(expiry)) {
      clearReferralCode();
      return null;
    }
    return code;
  } catch {
    return null;
  }
};

export const clearReferralCode = () => {
  try {
    localStorage.removeItem(REF_KEY);
    localStorage.removeItem(REF_EXPIRY_KEY);
  } catch {}
};
