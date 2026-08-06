// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyBaS2v1eOwvSPJczZ7WRGgr6wngQLGgKNI',
  authDomain: 'family-fridge-board.firebaseapp.com',
  projectId: 'family-fridge-board',
  storageBucket: 'family-fridge-board.appspot.com',
  messagingSenderId: '783837383370',
  appId: '1:783837383370:web:c3a86416acdcc571700233',
});

const messaging = firebase.messaging();


messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'Family Fridge Board';
  const options = {
    body: payload.notification?.body || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
  };
  self.registration.showNotification(title, options);
});