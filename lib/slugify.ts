export function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .replace(/-{2,}/g, "-");
}

export function createUrlSlug(base: string, text: string): string {
  const slug = slugify(text);
  return `${base.replace(/\/$/, "")}/${slug}`;
}
