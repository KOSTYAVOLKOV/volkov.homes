export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.STORYBLOK_TOKEN;

  if (!token) {
    return res.status(500).json({
      configured: false,
      error: 'STORYBLOK_TOKEN is not configured in Vercel'
    });
  }

  try {
    const url = new URL('https://api.storyblok.com/v2/cdn/stories/home');
    url.searchParams.set('version', req.query?.preview === '1' ? 'draft' : 'published');
    url.searchParams.set('token', token);
    url.searchParams.set('cv', String(Date.now()));

    const response = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
      cache: 'no-store'
    });

    const body = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({
        configured: true,
        storyblok_status: response.status,
        storyblok_response: body
      });
    }

    let data;
    try {
      data = JSON.parse(body);
    } catch {
      return res.status(502).json({
        configured: true,
        error: 'Storyblok returned a non-JSON response',
        storyblok_response: body
      });
    }

    return res.status(200).json({
      configured: true,
      preview: req.query?.preview === '1',
      version: req.query?.preview === '1' ? 'draft' : 'published',
      story: data.story || null
    });
  } catch (error) {
    console.error('[Storyblok API]', error);
    return res.status(500).json({
      configured: true,
      error: error?.message || 'Unable to contact Storyblok'
    });
  }
}
