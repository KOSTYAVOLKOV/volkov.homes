# Storyblok setup for VOLKOV.STUDIO

This version keeps the existing static frontend, Vercel Blob assets and embedded 3D hero. Storyblok is added as a content layer. If Storyblok is not configured, the site falls back to the existing hardcoded PROJECTS data.

## 1. Vercel Environment Variables

Add these variables in Vercel → Project → Settings → Environment Variables:

- STORYBLOK_PUBLIC_TOKEN = the Storyblok Public token
- STORYBLOK_PREVIEW_TOKEN = the Storyblok Preview token

Do not put either token directly into `index.html`.

## 2. Project content type

Create a Storyblok component named `project` with these fields:

- slug — Text
- title — Text
- location — Text
- year — Text
- scope — Text
- client — Text
- status — Text
- img — Asset, Image
- shots — Assets, Images, multiple
- lead — Textarea
- text — Richtext
- title_en — Text
- scope_en — Text
- status_en — Text
- lead_en — Textarea

Create stories below the `projects/` folder, for example:

projects/geuzenkade-45
projects/aerdenhout
projects/schie-36

The slug should match the existing website route.

## 3. Current behavior

The frontend requests `/api/storyblok`. If Storyblok is unavailable or not configured, nothing breaks and the current PROJECTS array remains active.

The adapter expects Storyblok stories to contain the component fields above. Once the first Project stories exist, the adapter can replace the hardcoded PROJECTS array with Storyblok content.

## 4. Preview

For Storyblok Visual Editor preview, use the site's HTTPS URL and add `?preview=1`. The API endpoint then uses `STORYBLOK_PREVIEW_TOKEN` and requests the draft version.

The next integration step is the Storyblok Visual Editor bridge and live editing. That should be added after the first Project story is working, so debugging does not involve five systems simultaneously. Humanity has suffered enough from configuration screens.
