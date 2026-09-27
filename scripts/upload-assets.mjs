import { put } from '@vercel/blob';
import { readdir, readFile, stat } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { Readable } from 'node:stream';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LOCAL_IMG = path.join(ROOT, 'img');
const BLOB_PREFIX = 'site/';

const externalMap = JSON.parse(
  await readFile(path.join(ROOT, 'external-assets.json'), 'utf8')
);

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await walk(full));
    else out.push(full);
  }
  return out;
}

async function uploadBuffer(pathname, body, contentType) {
  const blob = await put(`${BLOB_PREFIX}${pathname}`, body, {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    ...(contentType ? { contentType } : {})
  });
  console.log(`✓ ${pathname} -> ${blob.url}`);
  return blob;
}

const mime = ext => ({
  '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.png':'image/png',
  '.webp':'image/webp', '.gif':'image/gif', '.svg':'image/svg+xml',
  '.avif':'image/avif'
}[ext.toLowerCase()] || undefined);

// 1. Upload local img/ recursively.
let files = [];
try {
  files = await walk(LOCAL_IMG);
} catch {
  console.warn('No local img/ directory found. Skipping local files.');
}

for (const full of files) {
  const rel = path.relative(ROOT, full).split(path.sep).join('/');
  const body = await readFile(full);
  await uploadBuffer(rel, body, mime(path.extname(full)));
}

// 2. Download old Googleusercontent images and put them into Blob.
for (const [url, pathname] of Object.entries(externalMap)) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status}`);
  }
  const type = response.headers.get('content-type') || 'image/jpeg';
  const body = Buffer.from(await response.arrayBuffer());
  await uploadBuffer(pathname, body, type);
}

console.log('\nDone. Blob assets are under site/img/.');
console.log('Replace an image by uploading a new file to the same logical pathname.');
