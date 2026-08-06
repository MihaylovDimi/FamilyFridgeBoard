import { getMessaging, getToken, isSupported } from 'firebase/messaging';
import { doc, setDoc, arrayUnion } from 'firebase/firestore';
import app, { db } from './firebase';

const VAPID_KEY = 'BJLdIq_fCBX5nIYcUdg2DKelCwwtFXuTa9AuMjzOGHi6OyiorYL_LxJ_kgCXygrWhE8z4du31RuEXV2wSZNbJV8';

/** Requests permission and saves this device's push token for the user */
export async function setupPushNotifications(
  familyId: string,
  uid: string
): Promise<boolean> {
  try {
    // Check core browser capabilities directly
    if (!('Notification' in window)) {
      console.warn('Notifications not available in this browser');
      return false;
    }
    if (!('serviceWorker' in navigator)) {
      console.warn('Service workers not available in this browser');
      return false;
    }

    // Firebase support check (log but do not block — isSupported can be over-strict)
    const supported = await isSupported();
    console.log('FCM isSupported():', supported);

    // Ask for permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return false;

    // Wait for any existing service worker (PWA) to be ready first
    await navigator.serviceWorker.ready;

    // Register the Firebase messaging service worker on its own scope
    const swRegistration = await navigator.serviceWorker.register(
      '/firebase-messaging-sw.js',
      { scope: '/firebase-cloud-messaging-push-scope' }
    );

    // Get the device token
    const messaging = getMessaging(app);
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swRegistration,
    });

    if (!token) {
      console.warn('Failed to obtain device token');
      return false;
    }

    // Save the token in Firestore under this family/user
    await setDoc(
      doc(db, 'families', familyId, 'pushTokens', uid),
      { tokens: arrayUnion(token), uid },
      { merge: true }
    );

    console.log('Push notifications set up successfully');
    return true;
  } catch (err) {
    console.error('Error setting up push notifications:', err);
    return false;
  }
}