# WanderWise — AI Travel Planner

A complete starter project for a personalized AI travel itinerary app, built with Next.js, TypeScript, and Google's Gemini API.

## What you get

- Responsive travel-planner interface
- Destination, duration, budget, traveller type, travel style, and interest inputs
- Server-side Gemini API route (`app/api/plan/route.ts`)
- Loading and error states
- Generated itinerary with a copy button
- API key kept on the server (not exposed to the browser)

## Requirements

- Node.js (recommended: current LTS)
- VS Code
- A Gemini API key from Google AI Studio: https://aistudio.google.com/apikey

## Windows setup

1. Extract the ZIP file to a folder such as `C:\Users\user\Desktop\projects\ai-travel-planner`.
2. Open **VS Code**.
3. Choose **File → Open Folder...** and select the extracted `ai-travel-planner` folder.
4. Open **Terminal → New Terminal**.
5. Install dependencies:

   ```powershell
   npm install
   ```

6. Create a file named `.env.local` in the project root (the same folder as `package.json`).
7. Copy the following into `.env.local`, replacing the placeholder with your real key:

   ```env
   GEMINI_API_KEY=your_real_gemini_api_key_here
   GEMINI_MODEL=gemini-3.8-flash
   ```

   Get the key from Google AI Studio. Do not put the key in `app/page.tsx`, do not share it, and do not commit `.env.local` to GitHub.

8. Start the app:

   ```powershell
   npm run dev
   ```

9. Open http://localhost:3000 in your browser.

## If you see a Gemini model 404

The API error in your previous logs recommended `gemini-3.8-flash`, so that is the default in this project. Model availability can differ by API key/project. Check the models listed in Google AI Studio or Google's Gemini API documentation. If your key has access to another model, change `GEMINI_MODEL` in `.env.local`, save the file, and restart `npm run dev`.

## Common errors

- **401 / UNAUTHENTICATED**: Check that the value is a Gemini API key from Google AI Studio, with no extra quotes or spaces. If you change `.env.local`, restart the dev server.
- **403 / permission denied**: Check the Google project, API access, and any key restrictions.
- **404 / model not found**: Set `GEMINI_MODEL` to a model available to your key.
- **429 / quota**: Check your Google AI Studio usage limits and billing/quota.
- **`GEMINI_API_KEY is missing`**: Ensure `.env.local` is in the project root beside `package.json`, not inside `app/`.

## Useful commands

```powershell
npm run dev
npm run build
```

Stop the development server with `Ctrl + C`.

## Note about costs and accuracy

Gemini API usage and free-tier availability depend on Google's current model, region, account, and quota policies. Check Google AI Studio for your account's limits. Generated plans may contain inaccuracies; verify prices, schedules, opening hours, and safety advice before booking.
