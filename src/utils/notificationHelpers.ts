import { getMessaging, getToken } from 'firebase/messaging';
import { app } from '@/firebase/firebaseConfig';

export const initializeNotifications = async () => {
  try {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const messaging = getMessaging(app);
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        const token = await getToken(messaging, {
          vapidKey: "BFaXd4OytA6IpbDILdtWk_GjmBUk4Iwd9t5-L1tc4A1K6N8x9owSfSv1ylB-oeRWuksMnQj9sXIx6D_9XNfE5w8"
        });
        return token;
      }
    }
    return null;
  } catch (error) {
    console.error('Notification initialization failed:', error);
    return null;
  }
}; 