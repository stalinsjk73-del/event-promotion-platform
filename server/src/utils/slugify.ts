import slugify from 'slugify';

export const createBaseSlug = (title: string): string => {
  return slugify(title, {
    lower: true,
    strict: true,
    trim: true,
  });
};

export const generateUniqueSlug = async (
  title: string,
  isSlugTaken: (slug: string) => Promise<boolean>,
  customSlug?: string
): Promise<string> => {
  let base = customSlug ? createBaseSlug(customSlug) : createBaseSlug(title);
  if (!base) {
    base = 'event';
  }

  let slug = base;
  let counter = 1;

  while (await isSlugTaken(slug)) {
    counter += 1;
    slug = `${base}-${counter}`;
  }

  return slug;
};
