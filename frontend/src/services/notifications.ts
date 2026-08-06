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
    // Check the browser supports FCM
    const supported = await isSupported();
    if (!supported) {
      console.warn('This browser does not support push notifications');
      return false;
    }

    if (!('Notification' in window)) return false;

    // Ask for permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return false;

    // Get the device token
    const messaging = getMessaging(app);
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });

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