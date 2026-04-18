const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80";

export async function getFoodImageUrl(title) {
  const trimmedTitle = String(title || "").trim();
  const unsplashKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY?.trim();

  if (!unsplashKey || !trimmedTitle) {
    return FALLBACK_IMAGE;
  }

  const query = encodeURIComponent(trimmedTitle);
  const url = `https://api.unsplash.com/photos/random?query=${query}&orientation=landscape&client_id=${unsplashKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return FALLBACK_IMAGE;
    }
    const payload = await response.json();
    return payload?.urls?.regular || FALLBACK_IMAGE;
  } catch {
    return FALLBACK_IMAGE;
  }
}
