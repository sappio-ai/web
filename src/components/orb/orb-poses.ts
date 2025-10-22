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
}
