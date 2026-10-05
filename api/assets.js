import { list } from '@vercel/blob';

const PREFIXES = ['img/', 'video/'];

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const assets = {};

    for (const prefix of PREFIXES) {
      let cursor;
      do {
        const result = await list(cursor ? { prefix, cursor } : { prefix });
        for (const blob of result.blobs) {
          const version = blob.uploadedAt ? new Date(blob.uploadedAt).getTime() : Date.now();
          assets[blob.pathname] = `${blob.url}${blob.url.includes('?') ? '&' : '?'}v=${version}`;
        }
        cursor = result.hasMore ? result.cursor : undefined;
      } while (cursor);
    }

    res.setHeader('Cache-Control', 'no-store, max-age=0');
    return res.status(200).json(assets);
  } catch (error) {
    console.error('[Blob assets]', error);
    return res.status(500).json({ error: 'Unable to read Blob assets' });
  }
}
