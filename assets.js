import { list } from '@vercel/blob';

const PREFIXES = ['img/', 'video/'];

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const assets = {};
    let cursor;

    do {
      const result = await list(cursor ? { cursor } : {});

      for (const blob of result.blobs) {
        const logical = PREFIXES.some(prefix => blob.pathname.startsWith(prefix))
          ? blob.pathname
          : null;

        if (!logical) continue;

        const version = blob.uploadedAt
          ? new Date(blob.uploadedAt).getTime()
          : Date.now();

        assets[logical] =
          `${blob.url}${blob.url.includes('?') ? '&' : '?'}v=${version}`;
      }

      cursor = result.hasMore ? result.cursor : undefined;
    } while (cursor);

    res.setHeader('Cache-Control', 'no-store, max-age=0');
    return res.status(200).json(assets);
  } catch (error) {
    console.error('[Blob assets]', error);
    return res.status(500).json({ error: 'Unable to read Blob assets' });
  }
}
