---
description: Implement AI Video Generation
---

# Implement AI Video Generation

1.  **Backend (API):**
    *   Create a new route file: `apps/api/src/routes/ai.ts`.
    *   Implement an endpoint `POST /generate` that receives `prompt` and `style`.
    *   Since we don't have an external AI key, use FFmpeg to generate a synth video.
        *   Use `testsrc`, `mandelbrot`, or `rgbtestsrc` as a base.
        *   Overlay the user's text on top.
        *   Optionally add a filter effect based on the "style".
    *   Save the generated video to S3 (or temp storage) and return the URL.
    *   Register the route in `apps/api/src/index.ts`.

2.  **Frontend (Mobile):**
    *   Create a new screen: `apps/mobile/src/screens/AIGeneratorScreen.tsx`.
    *   UI should have:
        *   Text Input for Prompt (e.g., "A futuristic city").
        *   Style Selector (e.g., "Cyberpunk", "Retro", "Nature").
        *   "Generate" Button.
        *   Video Player to preview the result.
        *   "Post" button to upload it to the feed.
    *   Update `AppNavigator.tsx` to include the new screen.
    *   Update `CreatorScreen.tsx` to navigate to `AIGenerator` when "AI Magic" is clicked.

3.  **Service Integration:**
    *   Update `apps/mobile/src/services/api.ts` to include `aiService.generateVideo`.
