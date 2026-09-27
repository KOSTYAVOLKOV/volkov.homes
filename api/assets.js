import { list } from '@vercel/blob';

const PREFIX = 'site/img/';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const assets = {};
    let cursor;

    do {
      const result = await list(cursor ? { prefix: PREFIX, cursor } : { prefix: PREFIX });

      for (const blob of result.blobs) {
        const logical = blob.pathname.startsWith(PREFIX)
          ? blob.pathname.slice('site/'.length)
          : null;

        if (!logical) continue;

        // Vercel Blob URLs are immutable/cached. The timestamp query parameter
        // makes a replacement immediately visible to browsers/CDNs.
        const version = blob.uploadedAt ? new Date(blob.uploadedAt).getTime() : Date.now();
        assets[logical] = `${blob.url}${blob.url.includes('?') ? '&' : '?'}v=${version}`;
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
