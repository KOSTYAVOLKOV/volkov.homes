# VOLKOV.STUDIO + Vercel Blob

This version keeps image paths logical (`img/...`) in the site code.
The browser calls `/api/assets`, which uses Vercel Blob server-side to resolve
each logical path to the current public Blob URL.

The secret `BLOB_READ_WRITE_TOKEN` is never shipped to the browser.

## One-time setup

1. Keep `BLOB_READ_WRITE_TOKEN` in Vercel Environment Variables.
2. Install dependencies:
   `npm install`
3. Put your existing local `img/` folder beside `index.html`.
4. Run:
   `npm run blob:upload`
5. Deploy the whole folder to Vercel.

The upload script also uploads the three images that were embedded as base64
inside the old HTML and downloads the existing Googleusercontent images into
Blob.

## Replacing one image

No HTML change is required:

`npm run blob:replace -- ./new-photo.jpg img/kitchens/walnut-fluted/01.jpg`

The site resolves the current Blob URL dynamically and adds a version query
parameter based on the Blob upload timestamp, so a replacement becomes visible
without editing `index.html`.

You can also replace assets through the Vercel Blob dashboard using the same
logical pathname.

## Important

Do not commit `.env.local` or expose `BLOB_READ_WRITE_TOKEN` in browser code.
