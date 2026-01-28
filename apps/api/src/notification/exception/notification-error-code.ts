export const NotificationErrorCode = {
  FCM_TOKEN_REQUIRED: 'FCM_TOKEN_REQUIRED',
  NOT_FOUND_NOTIFICATION: 'NOT_FOUND_NOTIFICATION',
  INACTIVE_NOTIFICATION: 'INACTIVE_NOTIFICATION',
} as const;

/**
 * @see https://firebase.google.com/docs/cloud-messaging/error-codes?hl=ko
 */
export const FCM_ERROR_CODES = {
  INVALID_TOKEN: 'messaging/invalid-registration-token',
  NOT_REGISTERED: 'messaging/registration-token-not-registered',
  MESSAGE_TOO_BIG: 'messaging/message-too-big',
  QUOTA_EXCEEDED: 'messaging/quota-exceeded',

  INVALID_ARGUMENT: 'messaging/invalid-argument',
  INVALID_REGISTRATION_TOKEN: 'messaging/invalid-registration-token',
  REGISTRATION_TOKEN_NOT_REGISTERED:
    'messaging/registration-token-not-registered',

  INVALID_RECIPIENT: 'messaging/invalid-recipient',
  MISMATCHED_CREDENTIAL: 'messaging/mismatched-credential',

  INVALID_PAYLOAD: 'messaging/invalid-payload',
  MESSAGE_RATE_EXCEEDED: 'messaging/message-rate-exceeded',

  INTERNAL_ERROR: 'messaging/internal-error',
  SERVER_UNAVAILABLE: 'messaging/server-unavailable',

  INVALID_APNS_CREDENTIALS: 'messaging/invalid-apns-credentials',
  THIRD_PARTY_AUTH_ERROR: 'messaging/third-party-auth-error',
  UNKNOWN_ERROR: 'messaging/unknown-error',
} as const;

export type FCMErrorCode =
  (typeof FCM_ERROR_CODES)[keyof typeof FCM_ERROR_CODES];
