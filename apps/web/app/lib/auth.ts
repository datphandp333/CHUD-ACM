export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isAllowedEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);

  return (
    normalizedEmail.endsWith("@mavs.uta.edu") ||
    normalizedEmail.endsWith("@gmail.com")
  );
}

export function getUserDisplayName(
  fullName?: string | null,
  email?: string | null
) {
  const cleanedName = fullName?.trim();

  if (cleanedName) {
    return cleanedName;
  }

  return email?.trim() || "CHUD User";
}