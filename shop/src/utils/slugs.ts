export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD') // Separate accents from letters
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

export function createProductSlug(title: string, id: string): string {
  return `${slugify(title)}--${id}`;
}

export function extractIdFromSlug(slug: string): string {
  const parts = slug.split('--');
  return parts.length > 1 ? parts[parts.length - 1] : slug;
}
