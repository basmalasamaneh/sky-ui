import { buildBackendApiUrl } from './backend-api';

export const toImageSrc = (src) => {
  if (typeof src !== 'string' || !src.trim()) return null;
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  if (src.startsWith('/')) return buildBackendApiUrl(src);
  return null;
};

export const safeParseJSON = (str, fallback) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return fallback;
  }
};

export const normalizeWork = (work) => {
  const artworkImages = Array.isArray(work?.artwork_images) ? work.artwork_images : [];
  const artistProfile = Array.isArray(work?.users) ? work.users[0] : work?.users;
  const sortedImages = artworkImages.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  const mappedImages = sortedImages
    .map((image) => image.url || image.filename)
    .map((src) => toImageSrc(src))
    .filter(Boolean);
  const featuredIndex = sortedImages.findIndex((image) => image.is_featured);

  return {
    ...work,
    images: mappedImages,
    mainImageIndex: featuredIndex >= 0 ? featuredIndex : 0,
    artistName: artistProfile?.artist_name || [artistProfile?.first_name, artistProfile?.last_name].filter(Boolean).join(' '),
    artistAvatar: toImageSrc(artistProfile?.profile_image) || null,
    artistLocation: artistProfile?.location || null,
    artistPhone: artistProfile?.phone || null,
    artistBio: artistProfile?.bio || null,
    artistSocialMedia: (Array.isArray(artistProfile?.social_media) ? artistProfile.social_media : typeof artistProfile?.social_media === 'string' ? safeParseJSON(artistProfile.social_media, []) : []),
    createdAt: work?.created_at || work?.createdAt || null,
  };
};

export const categoryMapping = {
  'لوحات فنية': 'لوحات فنية',
  'تطريز فلسطيني': 'تطريز فلسطيني',
  'خزف وفخار': 'خزف وفخار',
  'خط عربي': 'خط عربي',
  'تصوير فوتوغرافي': 'تصوير فوتوغرافي',
  'نحت ومجسمات': 'نحت ومجسمات'
};

export const categories = ['الكل', 'لوحات فنية', 'تطريز فلسطيني', 'خزف وفخار', 'خط عربي', 'تصوير فوتوغرافي', 'نحت ومجسمات'];
