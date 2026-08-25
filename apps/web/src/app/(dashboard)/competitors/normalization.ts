// Normalize helpers for competitor inputs

export function normalizeWebsite(url: string | undefined | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  
  try {
    const parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    let domain = parsed.hostname.toLowerCase();
    if (domain.startsWith('www.')) domain = domain.substring(4);
    let path = parsed.pathname;
    if (path.endsWith('/')) path = path.slice(0, -1);
    return `${domain}${path}`;
  } catch {
    return trimmed.toLowerCase();
  }
}

export function normalizePlatformHandle(platform: string, val: string | undefined | null): string | null {
  if (!val) return null;
  const trimmed = val.trim();
  if (!trimmed) return null;

  switch (platform) {
    case 'instagram': {
      if (trimmed.includes('instagram.com/')) {
        const parts = trimmed.split('instagram.com/');
        const path = parts[1]?.split('?')[0]?.split('/')[0];
        if (path) return path.replace(/^@/, '').toLowerCase();
      }
      return trimmed.replace(/^@/, '').toLowerCase();
    }
    case 'twitter': {
      if (trimmed.includes('twitter.com/')) {
        const parts = trimmed.split('twitter.com/');
        const path = parts[1]?.split('?')[0]?.split('/')[0];
        if (path) return path.replace(/^@/, '').toLowerCase();
      }
      if (trimmed.includes('x.com/')) {
        const parts = trimmed.split('x.com/');
        const path = parts[1]?.split('?')[0]?.split('/')[0];
        if (path) return path.replace(/^@/, '').toLowerCase();
      }
      return trimmed.replace(/^@/, '').toLowerCase();
    }
    case 'tiktok': {
      if (trimmed.includes('tiktok.com/')) {
        const parts = trimmed.split('tiktok.com/');
        const path = parts[1]?.split('?')[0]?.split('/')[0];
        if (path) return path.replace(/^@/, '').toLowerCase();
      }
      return trimmed.replace(/^@/, '').toLowerCase();
    }
    case 'facebook': {
      if (trimmed.startsWith('http') || trimmed.includes('facebook.com/')) {
        try {
          const urlStr = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
          const parsed = new URL(urlStr);
          const domain = parsed.hostname.toLowerCase();
          let path = parsed.pathname;
          if (path.endsWith('/')) path = path.slice(0, -1);
          return `https://${domain}${path}`;
        } catch {
          return trimmed;
        }
      }
      return trimmed.replace(/^@/, '').toLowerCase();
    }
    case 'linkedin': {
      if (trimmed.startsWith('http') || trimmed.includes('linkedin.com/')) {
        try {
          const urlStr = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
          const parsed = new URL(urlStr);
          const domain = parsed.hostname.toLowerCase();
          let path = parsed.pathname;
          if (path.endsWith('/')) path = path.slice(0, -1);
          return `https://${domain}${path}`;
        } catch {
          return trimmed;
        }
      }
      return trimmed.replace(/^@/, '').toLowerCase();
    }
    case 'youtube': {
      if (trimmed.startsWith('http') || trimmed.includes('youtube.com/')) {
        try {
          const urlStr = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
          const parsed = new URL(urlStr);
          const domain = parsed.hostname.toLowerCase();
          let path = parsed.pathname;
          if (path.endsWith('/')) path = path.slice(0, -1);
          return `https://${domain}${path}`;
        } catch {
          return trimmed;
        }
      }
      const withAt = trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
      return withAt.toLowerCase();
    }
    default:
      return trimmed;
  }
}
