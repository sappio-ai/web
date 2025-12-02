export type OrbPose =
  | 'welcome-wave'
  | 'success-celebrating'
  | 'error-confused'
  | 'processing-thinking'
  | 'neutral'
  | 'upload-ready'
  | 'reading-document'
  | 'generating-sparkles'
  | 'teacher-pointer'
  | 'flashcard-holding'
  | 'quiz-master'
  | 'limit-reached'
  | 'upgrade-prompt'
  | 'explorer-magnifying-glass'
  | 'organizing-connecting'
  | 'empty-state-inviting'
  | 'packaging-wrapping'
  | 'download-arrow'
  | 'delivery-gift'
  | 'paywall-upsell'
  | 'format-pdf'
  | 'format-csv'
  | 'format-anki'
  // Dashboard poses
  | 'dashboard-hero'
  | 'welcome-back-morning'
  | 'welcome-back-afternoon'
  | 'welcome-back-evening'
  | 'pack-card-alert'
  | 'pack-card-happy'
  | 'motivational'
  // Insights poses
  | 'analytics-dashboard'
  | 'progress-growth'
  | 'weak-area-supportive'
  | 'achievement-celebration'
  | 'detective-analyzing'

interface OrbPoseData {
  imagePath: string
  altText: string
  preload: boolean
}

export const orbPoses: Record<OrbPose, OrbPoseData> = {
  'welcome-wave': {
    imagePath: '/orb/welcome-wave.png',
    altText: 'Sappio Orb waving hello with a friendly smile',
    preload: true,
  },
  'success-celebrating': {
    imagePath: '/orb/success-celebrating.png',
    altText: 'Sappio Orb celebrating success with confetti',
    preload: false,
  },
  'error-confused': {
    imagePath: '/orb/error-confused.png',
    altText: 'Sappio Orb looking confused with a question mark',
    preload: false,
  },
  'processing-thinking': {
    imagePath: '/orb/processing-thinking.png',
    altText: 'Sappio Orb thinking with orbital rings spinning',
    preload: true,
  },
  neutral: {
    imagePath: '/orb/neutral.png',
    altText: 'Sappio Orb in neutral pose',
    preload: false,
  },
  // Study pack creation poses
  'upload-ready': {
    imagePath: '/orb/upload-ready.png',
    altText: 'Sappio Orb holding a document, ready for upload',
    preload: true,
  },
  'reading-document': {
    imagePath: '/orb/reading-document.png',
    altText: 'Sappio Orb reading with book and glasses',
    preload: false,
  },
  'generating-sparkles': {
    imagePath: '/orb/generating-sparkles.png',
    altText: 'Sappio Orb generating content with sparkles',
    preload: false,
  },
  'teacher-pointer': {
    imagePath: '/orb/teacher-pointer.png',
    altText: 'Sappio Orb in teacher mode with pointer',
    preload: false,
  },
  'flashcard-holding': {
    imagePath: '/orb/flashcard-holding.png',
    altText: 'Sappio Orb holding flashcards',
    preload: false,
  },
  'quiz-master': {
    imagePath: '/orb/quiz-master.png',
    altText: 'Sappio Orb as quiz master with question mark bubble',
    preload: false,
  },
  'limit-reached': {
    imagePath: '/orb/limit-reached.png',
    altText: 'Sappio Orb indicating limit reached',
    preload: false,
  },
  'upgrade-prompt': {
    imagePath: '/orb/upgrade-prompt.png',
    altText: 'Sappio Orb encouraging upgrade with star',
    preload: false,
  },
  // Mind map poses
  'explorer-magnifying-glass': {
    imagePath: '/orb/explorer-magnifying-glass.png',
    altText: 'Sappio Orb exploring with magnifying glass',
    preload: false,
  },
  'organizing-connecting': {
    imagePath: '/orb/organizing-connecting.png',
    altText: 'Sappio Orb organizing and connecting nodes',
    preload: false,
  },
  'empty-state-inviting': {
    imagePath: '/orb/empty-state-inviting.png',
    altText: 'Sappio Orb with inviting gesture for empty state',
    preload: false,
  },
  // Export poses
  'packaging-wrapping': {
    imagePath: '/orb/packaging-wrapping.png',
    altText: 'Sappio Orb wrapping and preparing files for export',
    preload: false,
  },
  'download-arrow': {
    imagePath: '/orb/download-arrow.png',
    altText: 'Sappio Orb holding a download arrow',
    preload: false,
  },
  'delivery-gift': {
    imagePath: '/orb/delivery-gift.png',
    altText: 'Sappio Orb delivering a gift box with success',
    preload: false,
  },
  'paywall-upsell': {
    imagePath: '/orb/paywall-upsell.png',
    altText: 'Sappio Orb with gentle upsell gesture and premium badge',
    preload: false,
  },
  'format-pdf': {
    imagePath: '/orb/format-pdf.png',
    altText: 'Sappio Orb holding a PDF document icon',
    preload: false,
  },
  'format-csv': {
    imagePath: '/orb/format-csv.png',
    altText: 'Sappio Orb holding a CSV spreadsheet icon',
    preload: false,
  },
  'format-anki': {
    imagePath: '/orb/format-anki.png',
    altText: 'Sappio Orb holding an Anki flashcard deck icon',
    preload: false,
  },
  // Dashboard poses
  'dashboard-hero': {
    imagePath: '/orb/dashboard-hero.png',
    altText: 'Sappio Orb with orbital rings on dashboard',
    preload: true,
  },
  'welcome-back-morning': {
    imagePath: '/orb/welcome-back-morning.png',
    altText: 'Sappio Orb greeting with coffee cup',
    preload: false,
  },
  'welcome-back-afternoon': {
    imagePath: '/orb/welcome-back-afternoon.png',
    altText: 'Sappio Orb greeting with sun',
    preload: false,
  },
  'welcome-back-evening': {
    imagePath: '/orb/welcome-back-evening.png',
    altText: 'Sappio Orb greeting with moon',
    preload: false,
  },
  'pack-card-alert': {
    imagePath: '/orb/pack-card-alert.png',
    altText: 'Mini Orb with alert expression',
    preload: false,
  },
  'pack-card-happy': {
    imagePath: '/orb/pack-card-happy.png',
    altText: 'Mini Orb with happy expression',
    preload: false,
  },
  'motivational': {
    imagePath: '/orb/motivational.png',
    altText: 'Sappio Orb with encouraging gesture',
    preload: false,
  },
  // Insights poses
  'analytics-dashboard': {
    imagePath: '/orb/analytics-dashboard.png',
    altText: 'Sappio Orb with graphs and charts',
    preload: false,
  },
  'progress-growth': {
    imagePath: '/orb/progress-growth.png',
    altText: 'Sappio Orb showing growth with upward arrow',
    preload: false,
  },
  'weak-area-supportive': {
    imagePath: '/orb/weak-area-supportive.png',
    altText: 'Sappio Orb with supportive expression',
    preload: false,
  },
  'achievement-celebration': {
    imagePath: '/orb/achievement-celebration.png',
    altText: 'Sappio Orb celebrating achievement with trophy',
    preload: false,
  },
  'detective-analyzing': {
    imagePath: '/orb/detective-analyzing.png',
    altText: 'Sappio Orb with magnifying glass analyzing data',
    preload: false,
  },
}
