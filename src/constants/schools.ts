export const schools = [
  'Columbia',
  'SVA',
  'NYU',
  'Cooper Union',
  'FIT',
  'Parsons',
] as const;

export type School = (typeof schools)[number];

export const schoolSlugs: Record<School, string> = {
  Columbia: 'columbia',
  SVA: 'sva',
  NYU: 'nyu',
  'Cooper Union': 'cooper-union',
  FIT: 'fit',
  Parsons: 'parsons',
};

export const schoolNotes: Record<School, string> = {
  Columbia: 'Morningside study spots, core classes, and KSA events.',
  SVA: 'Studio critiques, portfolio help, and creative housing leads.',
  NYU: 'Downtown classes, clubs, and student life across buildings.',
  'Cooper Union': 'Tight-knit engineering, art, and architecture threads.',
  FIT: 'Fashion, business, and design communities around Chelsea.',
  Parsons: 'Design studios, critiques, and Lower Manhattan meetups.',
};

export function getSchoolBySlug(slug: string | string[] | undefined) {
  const normalizedSlug = Array.isArray(slug) ? slug[0] : slug;

  return schools.find((school) => schoolSlugs[school] === normalizedSlug);
}

export const communitySections = [
  {
    title: 'Easy electives / class tips',
    description: 'Professor and easy elective recommendations by school.',
  },
  {
    title: 'School communities',
    description: 'School-specific boards plus one all-campus community.',
  },
  {
    title: 'Sublets / roommates',
    description: 'Housing leads, roommate matches, and short-term sublets.',
  },
  {
    title: 'Clubs',
    description: 'Club discovery for Korean and international students.',
  },
  {
    title: 'Campus events',
    description: 'Campus events, meetups, and student-run announcements.',
  },
  {
    title: 'KSA promotions / events',
    description: 'KSA promotions, gatherings, and community notices.',
  },
] as const;
