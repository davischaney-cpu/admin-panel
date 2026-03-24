export function getOwnerEmail() {
  return process.env.OWNER_EMAIL?.trim().toLowerCase() || null;
}

export function isOwnerEmail(email?: string | null) {
  const ownerEmail = getOwnerEmail();
  return Boolean(ownerEmail && email && ownerEmail === email.trim().toLowerCase());
}
