export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const preview = String(req.query?.preview || '') === '1' || '_storyblok' in (req.query || {});
  const token = preview
    ? process.env.STORYBLOK_PREVIEW_TOKEN
    : process.env.STORYBLOK_PUBLIC_TOKEN;

  if (!token) {
    return res.status(503).json({
      error: 'Storyblok is not configured yet',
      configured: false
    });
  }

  try {
    const version = preview ? 'draft' : 'published';
    const url = new URL('https://api.storyblok.com/v2/cdn/stories');
    url.searchParams.set('token', token);
    url.searchParams.set('version', version);
    url.searchParams.set('per_page', '100');
    url.searchParams.set('starts_with', 'projects/');
    url.searchParams.set('cv', String(Date.now()));

    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      cache: 'no-store'
    });

    if (!response.ok) {
      const body = await response.text();
      console.error('[Storyblok]', response.status, body);
      return res.status(response.status).json({ error: 'Storyblok request failed' });
    }

    const data = await response.json();
    const stories = Array.isArray(data.stories) ? data.stories : [];

    return res.status(200).json({
      configured: true,
      preview,
      version,
      stories
    });
  } catch (error) {
    console.error('[Storyblok]', error);
    return res.status(500).json({ error: 'Unable to read Storyblok' });
  }
}
