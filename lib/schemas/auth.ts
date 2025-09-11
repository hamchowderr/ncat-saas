import { z } from 'zod'

// Auth General Settings Schema
export const authGeneralSettingsSchema = z.object({
  DISABLE_SIGNUP: z.boolean().optional(),
  SITE_URL: z.string().url().optional(),
  SECURITY_CAPTCHA_ENABLED: z.boolean().optional(),
  SECURITY_CAPTCHA_SECRET: z.string().optional(),
  SECURITY_CAPTCHA_PROVIDER: z.enum(['hcaptcha', 'turnstile']).optional(),
  MAILER_AUTOCONFIRM: z.boolean().optional(),
  MAILER_SECURE_EMAIL_CHANGE_ENABLED: z.boolean().optional(),
  SESSIONS_TIMEBOX: z.number().min(0).optional(),
  SESSIONS_INACTIVITY_TIMEOUT: z.number().min(0).optional(),
  PASSWORD_MIN_LENGTH: z.number().min(6).max(128).optional(),
})

export type AuthGeneralSettingsSchema = z.infer<typeof authGeneralSettingsSchema>

// Email Provider Schema
export const authEmailProviderSchema = z.object({
  MAILER_AUTOCONFIRM: z.boolean().optional(),
  MAILER_SECURE_EMAIL_CHANGE_ENABLED: z.boolean().optional(),
  MAILER_OTP_EXP: z.number().min(60).max(86400).optional(),
  MAILER_OTP_LENGTH: z.number().min(4).max(10).optional(),
  PASSWORD_MIN_LENGTH: z.number().min(6).max(128).optional(),
  SECURITY_UPDATE_PASSWORD_REQUIRE_REAUTHENTICATION: z.boolean().optional(),
})

// Phone Provider Schema
export const authPhoneProviderSchema = z.object({
  SMS_AUTOCONFIRM: z.boolean().optional(),
  SMS_OTP_EXP: z.number().min(60).max(86400).optional(),
  SMS_OTP_LENGTH: z.number().min(4).max(10).optional(),
  SMS_PROVIDER: z.enum(['twilio', 'messagebird', 'textlocal', 'vonage']).optional(),
  SMS_TWILIO_ACCOUNT_SID: z.string().optional(),
  SMS_TWILIO_AUTH_TOKEN: z.string().optional(),
  SMS_TWILIO_MESSAGE_SERVICE_SID: z.string().optional(),
})

// Google Provider Schema
export const authGoogleProviderSchema = z.object({
  EXTERNAL_GOOGLE_ENABLED: z.boolean().optional(),
  EXTERNAL_GOOGLE_CLIENT_ID: z.string().optional(),
  EXTERNAL_GOOGLE_SECRET: z.string().optional(),
  EXTERNAL_GOOGLE_REDIRECT_URI: z.string().url().optional(),
  EXTERNAL_GOOGLE_SKIP_NONCE_CHECK: z.boolean().optional(),
})

// Field labels for form rendering
export const authFieldLabels: Record<string, string> = {
  // General Settings
  DISABLE_SIGNUP: 'Disable new user signups',
  SITE_URL: 'Site URL',
  SECURITY_CAPTCHA_ENABLED: 'Enable Captcha protection',
  SECURITY_CAPTCHA_SECRET: 'Captcha secret key',
  SECURITY_CAPTCHA_PROVIDER: 'Captcha provider',
  MAILER_AUTOCONFIRM: 'Enable email confirmations',
  MAILER_SECURE_EMAIL_CHANGE_ENABLED: 'Secure email change',
  SESSIONS_TIMEBOX: 'Session timeout (seconds)',
  SESSIONS_INACTIVITY_TIMEOUT: 'Inactivity timeout (seconds)',
  PASSWORD_MIN_LENGTH: 'Minimum password length',
  
  // Email Provider
  MAILER_OTP_EXP: 'Email OTP expiry (seconds)',
  MAILER_OTP_LENGTH: 'Email OTP length',
  SECURITY_UPDATE_PASSWORD_REQUIRE_REAUTHENTICATION: 'Require re-authentication for password updates',
  
  // Phone Provider
  SMS_AUTOCONFIRM: 'Auto-confirm phone numbers',
  SMS_OTP_EXP: 'SMS OTP expiry (seconds)',
  SMS_OTP_LENGTH: 'SMS OTP length',
  SMS_PROVIDER: 'SMS provider',
  SMS_TWILIO_ACCOUNT_SID: 'Twilio Account SID',
  SMS_TWILIO_AUTH_TOKEN: 'Twilio Auth Token',
  SMS_TWILIO_MESSAGE_SERVICE_SID: 'Twilio Message Service SID',
  
  // Google Provider
  EXTERNAL_GOOGLE_ENABLED: 'Enable Google OAuth',
  EXTERNAL_GOOGLE_CLIENT_ID: 'Google Client ID',
  EXTERNAL_GOOGLE_SECRET: 'Google Client Secret',
  EXTERNAL_GOOGLE_REDIRECT_URI: 'Google Redirect URI',
  EXTERNAL_GOOGLE_SKIP_NONCE_CHECK: 'Skip nonce verification',
}
