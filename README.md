# Adarsh P A — Portfolio

Modern responsive personal portfolio built with React, TypeScript, and Tailwind CSS. Includes light/dark theme support.

## Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- Lucide icons

## Getting started

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

## Contact form email

Enquiries from the contact form are sent through a server-side `/api/contact` endpoint using Resend. The browser never talks to Resend directly.

### Local environment

Create a `.env` file in the project root (this file is gitignored):

```
EMAIL_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@adarshpa.in
EMAIL_TO=adarshputhuparambil324@gmail.com
```

Then run `npm run dev`. The Vite dev server exposes `POST /api/contact` locally.

Do not use a `VITE_` prefix for `EMAIL_API_KEY`. That would expose the key in the frontend bundle.

### Vercel environment variables

In the Vercel dashboard:

1. Open the project
2. Go to **Settings → Environment Variables**
3. Add `EMAIL_API_KEY`, `EMAIL_FROM`, and `EMAIL_TO`
4. Apply them to Production, Preview, and Development as needed
5. Redeploy after saving

## Customize

Update content in `src/data/profile.ts` (experience, projects, skills, contact links).
