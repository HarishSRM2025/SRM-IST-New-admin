export const FACULTY_DESIGNATION_SUGGESTIONS = [
  'Director',
  'Dean',
  'Principal',
  'Head of the Department',
  'Professor',
  'Associate Professor',
  'Assistant Professor',
];

export const getDesignationRank = (designation = '') => {
  const normalized = String(designation || '').trim().toLowerCase();

  if (normalized.includes('director')) return 0;
  if (normalized.includes('dean')) return 1;
  if (normalized.includes('principal')) return 2;
  if (
    normalized.includes('head of the department') ||
    normalized.includes('head of the dept') ||
    normalized.includes('hod') ||
    /\bhead\b/.test(normalized)
  ) return 3;
  if (normalized.includes('professor') && !normalized.includes('assistant') && !normalized.includes('associate')) return 4;
  if (normalized.includes('associate professor')) return 5;
  if (normalized.includes('assistant professor')) return 6;
  return 7;
};

export const getExperienceValue = (value) => {
  const parsed = Number(String(value ?? '').replace(/[^\d.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

export const sortFacultyMembers = (list = []) => [...list].sort((a, b) => {
  const rankDifference = getDesignationRank(a?.designation) - getDesignationRank(b?.designation);
  if (rankDifference !== 0) return rankDifference;

  const experienceDifference = getExperienceValue(b?.facultyExperience) - getExperienceValue(a?.facultyExperience);
  if (experienceDifference !== 0) return experienceDifference;

  return String(a?.facultyName || '').localeCompare(String(b?.facultyName || ''));
});
