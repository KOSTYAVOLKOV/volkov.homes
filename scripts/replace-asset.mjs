import { put } from '@vercel/blob';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const [, , localFile, blobPath] = process.argv;
if (!localFile || !blobPath) {
  console.error('Usage: node scripts/replace-asset.mjs ./new.jpg img/kitchens/walnut-fluted/01.jpg');
  process.exit(1);
}

const ext = path.extname(localFile).toLowerCase();
const contentType = ({
  '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.png':'image/png',
  '.webp':'image/webp', '.gif':'image/gif', '.svg':'image/svg+xml',
  '.avif':'image/avif'
})[ext];

const blob = await put(`site/${blobPath.replace(/^\/+/, '')}`, await readFile(localFile), {
  access: 'public',
  addRandomSuffix: false,
  allowOverwrite: true,
  ...(contentType ? { contentType } : {})
});

console.log(blob.url);
console.log(`Updated: ${blobPath}`);
