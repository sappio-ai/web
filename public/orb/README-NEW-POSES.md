# New Orb Poses Needed

The following Orb pose images need to be generated for the Dashboard & Insights Enhancement feature:

## Dashboard Poses

1. **dashboard-hero.png**
   - Description: Main orb with prominent orbital rings animation
   - Style: Energetic, welcoming, central focus
   - Use: Dashboard header/hero section

2. **welcome-back-morning.png**
   - Description: Orb with coffee cup accessory
   - Style: Fresh, energetic, morning vibes
   - Use: Morning greeting (5 AM - 12 PM)

3. **welcome-back-afternoon.png**
   - Description: Orb with sun accessory
   - Style: Bright, warm, midday energy
   - Use: Afternoon greeting (12 PM - 6 PM)

4. **welcome-back-evening.png**
   - Description: Orb with moon/stars accessory
   - Style: Calm, relaxed, evening mood
   - Use: Evening greeting (6 PM - 5 AM)

5. **pack-card-alert.png**
   - Description: Mini orb with alert/attention expression
   - Style: Urgent but friendly, small size
   - Use: Pack cards with due cards

6. **pack-card-happy.png**
   - Description: Mini orb with happy/satisfied expression
   - Style: Content, peaceful, small size
   - Use: Pack cards with no due cards

7. **motivational.png**
   - Description: Orb with encouraging gesture (thumbs up, fist pump, etc.)
   - Style: Supportive, energetic, inspiring
   - Use: Motivational messages when all caught up

## Image Specifications

- **Format**: PNG with transparency
- **Size**: 
  - Standard poses: 256x256px
  - Mini poses (pack-card-*): 128x128px
- **Style**: Consistent with existing Sappio Orb design
- **Colors**: Match brand palette (#a8d5d5, #8bc5c5, #f5e6d3)
- **Optimization**: Compress to WebP after generation for production

## Generation Instructions

1. Use AI image generation tool (DALL-E, Midjourney, etc.)
2. Base prompt: "Cute friendly glowing orb character with orbital rings, [specific pose description], soft lighting, dark background, digital art style"
3. Maintain consistency with existing orb poses in `/public/orb/`
4. Export as PNG with transparency
5. Optimize with tools like TinyPNG or convert to WebP

## Temporary Fallback

Until images are generated, the system will fall back to existing poses:
- dashboard-hero → neutral
- welcome-back-* → welcome-wave
- pack-card-alert → limit-reached
- pack-card-happy → success-celebrating
- motivational → success-celebrating

## Status

- [ ] dashboard-hero.png
- [ ] welcome-back-morning.png
- [ ] welcome-back-afternoon.png
- [ ] welcome-back-evening.png
- [ ] pack-card-alert.png
- [ ] pack-card-happy.png
- [ ] motivational.png
