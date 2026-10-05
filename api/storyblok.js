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

  const preview = req.query?.preview === '1';

  try {
    const params = new URLSearchParams({
      version: preview ? 'draft' : 'published',
      token,
      cv: String(Date.now())
    });

    const response = await fetch(
      'https://api.storyblok.com/v2/cdn/stories/home?' + params.toString()
    );

    const body = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({
        configured: true,
        storyblok_status: response.status,
        storyblok_response: body
      });
    }

    const data = JSON.parse(body);

    return res.status(200).json({
      configured: true,
      preview,
      version: preview ? 'draft' : 'published',
      story: data.story || null
    });

  } catch (error) {
    return res.status(500).json({
      configured: true,
      error: error.message || 'Unable to contact Storyblok'
    });
  }
}
