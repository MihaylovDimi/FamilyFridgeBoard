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
    console.log('Notification permission:', permission);
    if (permission !== 'granted') {
      console.warn('Permission not granted, stopping. Value:', permission);
      return false;
    }

   console.log('Registering Firebase messaging SW...');
    const swRegistration = await navigator.serviceWorker.register(
      '/firebase-messaging-sw.js'
    );

    // Wait until the service worker is fully active before subscribing
    await navigator.serviceWorker.ready;
    console.log('Firebase SW active, getting token...');

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