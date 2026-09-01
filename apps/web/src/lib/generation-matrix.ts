export function determineRequiredModalities(format: string, platform: string) {
  const f = format.toUpperCase();
  const p = platform.toUpperCase();

  const reqs = {
    text: true, // Always required
    image: false,
    video: false,
  };

  if (f.includes('VIDEO') || f.includes('REEL') || f.includes('SHORT') || p === 'YOUTUBE' || p === 'TIKTOK') {
    reqs.video = true;
  } else if (f.includes('IMAGE') || f.includes('CAROUSEL')) {
    reqs.image = true;
  } else if (f === 'POST') {
    // Basic posts depend on platform
    if (p === 'INSTAGRAM') {
      reqs.image = true;
    } else {
      reqs.image = false;
    }
  } else if (f === 'BLOG' || f === 'ARTICLE') {
    reqs.image = true; // Often blogs have header images
  }

  return reqs;
}
