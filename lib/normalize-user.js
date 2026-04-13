export function normalizeUserData(userData = {}) {
  const rawSocialMedia = userData?.socialMedia ?? userData?.social_media ?? [];
  let socialMedia = rawSocialMedia;
  if (typeof rawSocialMedia === 'string') {
    try { socialMedia = JSON.parse(rawSocialMedia); } catch { socialMedia = []; }
  }

  return {
    id: userData?.id || userData?.userId || '',
    email: userData?.email || '',
    role: userData?.role || 'user',
    firstName: userData?.firstName || userData?.first_name || '',
    lastName: userData?.lastName || userData?.last_name || '',
    artistName: userData?.artistName || userData?.artist_name || '',
    bio: userData?.bio || '',
    location: userData?.location || '',
    phone: userData?.phone || '',
    socialMedia: Array.isArray(socialMedia) ? socialMedia : [],
  };
}