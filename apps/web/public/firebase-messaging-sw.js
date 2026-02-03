/* eslint-env serviceworker */
/* global importScripts */
// 1. 서비스 워커에 필요한 Firebase 라이브러리 로드
importScripts(
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js',
);
importScripts(
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js',
);

// 2. Firebase 초기화 (프로젝트 설정값)
self.firebase.initializeApp({
  apiKey: 'AIzaSyCFCJkSpMHzCy5CitGWhEduesz209pnIaA',
  authDomain: 'locus-c2f18.firebaseapp.com',
  projectId: 'locus-c2f18',
  storageBucket: 'locus-c2f18.appspot.com',
  messagingSenderId: '722239265422',
  appId: '1:722239265422:web:227b8ef956460baffe47df',
});

// 3. 메시징 객체 생성
const messaging = self.firebase.messaging();

// 4. 백그라운드 메시지 수신 처리
messaging.onBackgroundMessage((payload) => {
  const notificationTitle =
    payload.notification?.title ?? payload.data?.title ?? 'Locus';
  const notificationOptions = {
    body: payload.notification?.body ?? payload.data?.body ?? '',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
