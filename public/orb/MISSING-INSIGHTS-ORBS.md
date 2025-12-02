# Missing Insights Orb Images

The following Orb pose images need to be generated manually using AI image generation tools.

## Required Images

### 1. analytics-dashboard.png
- **Status:** ❌ Missing
- **Size:** 256x256px
- **Description:** Sappio Orb surrounded by floating graphs, charts, and data visualization elements
- **Prompt:** See `AI-IMAGE-GENERATION-PROMPTS.md` section 8

### 2. progress-growth.png
- **Status:** ❌ Missing
- **Size:** 256x256px
- **Description:** Sappio Orb with upward arrow showing growth and improvement
- **Prompt:** See `AI-IMAGE-GENERATION-PROMPTS.md` section 9

### 3. weak-area-supportive.png
- **Status:** ❌ Missing
- **Size:** 256x256px
- **Description:** Sappio Orb with gentle, supportive expression
- **Prompt:** See `AI-IMAGE-GENERATION-PROMPTS.md` section 10

### 4. achievement-celebration.png
- **Status:** ❌ Missing
- **Size:** 256x256px
- **Description:** Sappio Orb celebrating with trophy and confetti
- **Prompt:** See `AI-IMAGE-GENERATION-PROMPTS.md` section 11

### 5. detective-analyzing.png
- **Status:** ❌ Missing
- **Size:** 256x256px
- **Description:** Sappio Orb with magnifying glass in detective pose
- **Prompt:** See `AI-IMAGE-GENERATION-PROMPTS.md` section 12

## How to Generate

1. Open `AI-IMAGE-GENERATION-PROMPTS.md` in this directory
2. Use the prompts with your AI image generation tool (DALL-E, Midjourney, Sora AI, etc.)
3. Generate each image at 256x256px
4. Ensure PNG format with transparency
5. Optimize images (use TinyPNG or similar)
6. Save to this directory with the exact filenames above
7. Delete this file once all images are generated

## Fallback

Until images are generated, the application will fall back to existing Orb poses:
- `analytics-dashboard` → falls back to `processing-thinking`
- `progress-growth` → falls back to `success-celebrating`
- `weak-area-supportive` → falls back to `neutral`
- `achievement-celebration` → falls back to `success-celebrating`
- `detective-analyzing` → falls back to `explorer-magnifying-glass`

## Code Integration Status

✅ Orb poses are defined in `src/components/orb/orb-poses.ts`
✅ Orbs are integrated into InsightsTab components
❌ Actual image files are missing

Once images are generated and placed in this directory, the Orbs will automatically display correctly.
