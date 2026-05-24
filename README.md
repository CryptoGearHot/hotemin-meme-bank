# Hotemin Meme Bank

A simple no-login meme gallery for `$HOTEMIN`.

Users can:

- Enter sender name
- Upload one image
- Submit
- View the public gallery
- Download or share memes

## Tech stack

- Next.js
- Tailwind CSS
- Supabase Database
- Supabase Storage

## 1. Create Supabase project

1. Open Supabase.
2. Create a new project.
3. Go to **SQL Editor**.
4. Paste and run the content from `supabase.sql`.

This creates:

- `memes` table
- Public read + insert policies
- Public `memes` storage bucket
- Upload policy for images

## 2. Add environment variables

Create a file called `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Find these values in Supabase:

Project Settings → API

Use:

- Project URL
- anon public key

## 3. Install and run locally

```bash
npm install
npm run dev
```

Open:

```txt
http://localhost:3000
```

## 4. Deploy to Vercel

1. Push this project to GitHub.
2. Import it in Vercel.
3. Add the same environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy.

## Important note

This version has no login, so anyone can upload. That matches the free-access idea, but it also means people can spam it. For a public launch, consider adding one of these later:

- Admin approval queue
- Simple captcha
- File report button
- Rate limit

## Brand palette

- Sunset orange: `#FF7A1A`
- Coral: `#FF4F5E`
- Ocean cyan: `#1ECBE1`
- Sand cream: `#FFF3D6`
- Lemon: `#FFE66D`
- Deep navy: `#102033`
