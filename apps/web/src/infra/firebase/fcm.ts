/**
 * FCM 토큰 조회 (PWA/모바일 푸시 알림용)
 * 환경 변수는 .env에서만 로드하며, 코드에는 절대 하드코딩하지 않음.
 * VITE_ 접두사로 브라우저에 노출되는 값은 Firebase 콘솔에서 도메인 제한으로 보안 처리.
 */

function getFirebaseConfig(): Record<string, string> | null {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
  const appId = import.meta.env.VITE_FIREBASE_APP_ID;

  if (
    !apiKey ||
    !authDomain ||
    !projectId ||
    !storageBucket ||
    !messagingSenderId ||
    !appId
  ) {
    return null;
  }

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
  };
}

function getVapidKey(): string | null {
  const key = import.meta.env.VITE_FCM_VAPID_KEY;
  return key && key.length > 0 ? key : null;
}

let messagingInstance: import('firebase/messaging').Messaging | null = null;

/**
 * Firebase Messaging 인스턴스 (브라우저 + env 있을 때만 초기화)
 */
async function getMessagingInstance(): Promise<
  import('firebase/messaging').Messaging | null
> {
  if (typeof window === 'undefined') return null;

  const config = getFirebaseConfig();
  const vapidKey = getVapidKey();
  if (!config || !vapidKey) return null;

  try {
    const { initializeApp } = await import('firebase/app');
    const { getMessaging, isSupported } = await import('firebase/messaging');

    const isMessagingSupported = await isSupported();
    if (!isMessagingSupported) return null;

    const app = initializeApp(config);
    messagingInstance = getMessaging(app);
    return messagingInstance;
  } catch {
    return null;
  }
}

/**
 * FCM 등록 토큰 조회
 * PWA/모바일에서 알림 활성화 시 POST /notifications/settings에 전달할 토큰.
 * env 미설정·미지원 환경에서는 null 반환.
 */
export async function getFcmToken(): Promise<string | null> {
  const vapidKey = getVapidKey();
  if (!vapidKey) return null;

  const messaging = await getMessagingInstance();
  if (!messaging) return null;

  try {
    const { getToken } = await import('firebase/messaging');
    const token = await getToken(messaging, { vapidKey });
    return token ?? null;
  } catch {
    return null;
  }
}
