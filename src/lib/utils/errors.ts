export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'invalid_credentials',
  EMAIL_EXISTS = 'email_exists',
  WEAK_PASSWORD = 'weak_password',
  INVALID_EMAIL = 'invalid_email',
  USERNAME_TAKEN = 'username_taken',
  SESSION_EXPIRED = 'session_expired',
  NETWORK_ERROR = 'network_error',
  UNKNOWN_ERROR = 'unknown_error',
  INVALID_TOKEN = 'invalid_token',
  TOKEN_EXPIRED = 'token_expired',
  TOKEN_USED = 'token_used',
  UNAUTHORIZED = 'unauthorized',
}

export const errorMessages: Record<AuthErrorCode, string> = {
  [AuthErrorCode.INVALID_CREDENTIALS]: 'Invalid email or password. Please try again.',
  [AuthErrorCode.EMAIL_EXISTS]: 'An account with this email already exists.',
  [AuthErrorCode.WEAK_PASSWORD]: 'Password must be at least 8 characters long.',
  [AuthErrorCode.INVALID_EMAIL]: 'Please enter a valid email address.',
  [AuthErrorCode.USERNAME_TAKEN]: 'This username is already taken.',
  [AuthErrorCode.SESSION_EXPIRED]: 'Your session has expired. Please log in again.',
  [AuthErrorCode.NETWORK_ERROR]: 'Network error. Please check your connection.',
  [AuthErrorCode.UNKNOWN_ERROR]: 'Something went wrong. Please try again.',
  [AuthErrorCode.INVALID_TOKEN]: 'Invalid reset token. Please request a new password reset.',
  [AuthErrorCode.TOKEN_EXPIRED]: 'Reset token has expired. Please request a new password reset.',
  [AuthErrorCode.TOKEN_USED]: 'This reset token has already been used. Please request a new password reset.',
  [AuthErrorCode.UNAUTHORIZED]: 'You must be logged in to access this resource.',
}

export function getErrorMessage(code: AuthErrorCode | string): string {
  if (code in errorMessages) {
    return errorMessages[code as AuthErrorCode]
  }
  return errorMessages[AuthErrorCode.UNKNOWN_ERROR]
}

export function translateSupabaseError(error: any): AuthErrorCode {
  const message = error?.message?.toLowerCase() || ''
  
  if (message.includes('invalid login credentials') || message.includes('invalid credentials')) {
    return AuthErrorCode.INVALID_CREDENTIALS
  }
  
  if (message.includes('user already registered') || message.includes('email already exists')) {
    return AuthErrorCode.EMAIL_EXISTS
  }
  
  if (message.includes('password') && (message.includes('weak') || message.includes('short'))) {
    return AuthErrorCode.WEAK_PASSWORD
  }
  
  if (message.includes('invalid email')) {
    return AuthErrorCode.INVALID_EMAIL
  }
  
  if (message.includes('jwt') || message.includes('token') || message.includes('expired')) {
    return AuthErrorCode.SESSION_EXPIRED
  }
  
  return AuthErrorCode.UNKNOWN_ERROR
}

export class AppError extends Error {
  constructor(
    public code: AuthErrorCode,
    message?: string
  ) {
    super(message || errorMessages[code])
    this.name = 'AppError'
  }
}

// ============================================================================
// Material Upload & Processing Errors
// ============================================================================

export enum MaterialErrorCode {
  FILE_TOO_LARGE = 'file_too_large',
  INVALID_FILE_TYPE = 'invalid_file_type',
  UNSUPPORTED_TYPE = 'unsupported_type',
  INVALID_INPUT = 'invalid_input',
  UPLOAD_FAILED = 'upload_failed',
  STORAGE_ERROR = 'storage_error',
  INVALID_URL = 'invalid_url',
  URL_FETCH_FAILED = 'url_fetch_failed',
  YOUTUBE_TRANSCRIPT_UNAVAILABLE = 'youtube_transcript_unavailable',
  OCR_FAILED = 'ocr_failed',
  EXTRACTION_FAILED = 'extraction_failed',
  PROCESSING_TIMEOUT = 'processing_timeout',
  PLAN_LIMIT_EXCEEDED = 'plan_limit_exceeded',
  MATERIAL_NOT_FOUND = 'material_not_found',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  GENERATION_FAILED = 'generation_failed',
  AI_API_ERROR = 'ai_api_error',
  DATABASE_ERROR = 'database_error',
}

export const materialErrorMessages: Record<MaterialErrorCode, string> = {
  [MaterialErrorCode.FILE_TOO_LARGE]: 'File too large. Maximum size is 50MB.',
  [MaterialErrorCode.INVALID_FILE_TYPE]: 'Unsupported file type. Please upload PDF, DOCX, or images.',
  [MaterialErrorCode.UNSUPPORTED_TYPE]: 'Unsupported material type.',
  [MaterialErrorCode.INVALID_INPUT]: 'Invalid input provided.',
  [MaterialErrorCode.UPLOAD_FAILED]: 'Upload failed. Please try again.',
  [MaterialErrorCode.STORAGE_ERROR]: 'Storage error. Please try again later.',
  [MaterialErrorCode.INVALID_URL]: 'Invalid URL. Please check the link and try again.',
  [MaterialErrorCode.URL_FETCH_FAILED]: 'Unable to access URL. Please check the link and try again.',
  [MaterialErrorCode.YOUTUBE_TRANSCRIPT_UNAVAILABLE]: 'YouTube transcript unavailable. Please try a different video.',
  [MaterialErrorCode.OCR_FAILED]: 'Unable to extract text from image. Please ensure the image contains readable text.',
  [MaterialErrorCode.EXTRACTION_FAILED]: 'Failed to extract content. Please try a different file.',
  [MaterialErrorCode.PROCESSING_TIMEOUT]: 'Processing took too long. Please try a smaller file.',
  [MaterialErrorCode.PLAN_LIMIT_EXCEEDED]: 'You have reached your monthly pack limit. Please upgrade your plan.',
  [MaterialErrorCode.MATERIAL_NOT_FOUND]: 'Material not found.',
  [MaterialErrorCode.UNAUTHORIZED_ACCESS]: 'You do not have permission to access this material.',
  [MaterialErrorCode.GENERATION_FAILED]: 'Generation failed. Please try again or contact support.',
  [MaterialErrorCode.AI_API_ERROR]: 'AI service error. Please try again later.',
  [MaterialErrorCode.DATABASE_ERROR]: 'Database error. Please try again.',
}

export function getMaterialErrorMessage(code: MaterialErrorCode | string): string {
  if (code in materialErrorMessages) {
    return materialErrorMessages[code as MaterialErrorCode]
  }
  return 'Something went wrong. Please try again.'
}

export class UploadError extends Error {
  constructor(
    public code: MaterialErrorCode,
    message?: string
  ) {
    super(message || materialErrorMessages[code])
    this.name = 'UploadError'
  }
}

export class ProcessingError extends Error {
  constructor(
    public code: MaterialErrorCode,
    message?: string,
    public materialId?: string
  ) {
    super(message || materialErrorMessages[code])
    this.name = 'ProcessingError'
  }
}

export class GenerationError extends Error {
  constructor(
    public code: MaterialErrorCode,
    message?: string,
    public studyPackId?: string
  ) {
    super(message || materialErrorMessages[code])
    this.name = 'GenerationError'
  }
}
