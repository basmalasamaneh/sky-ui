export function normalizeUserData(userData = {}) {
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
    socialMedia: userData?.socialMedia || userData?.social_media || userData?.instagram || '',
  };
}