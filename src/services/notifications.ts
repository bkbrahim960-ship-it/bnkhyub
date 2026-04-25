import { LocalNotifications } from '@capacitor/local-notifications';
import { supabase } from "@/integrations/supabase/client";

export const setupNotifications = async () => {
  try {
    const perm = await LocalNotifications.requestPermissions();
    if (perm.display === 'granted') {
      console.log("Notifications permission granted");
    }
  } catch (e) {
    console.warn("Notifications not supported on this device");
  }
};

export const scheduleNewReleaseAlert = async (title: string, body: string) => {
  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          title,
          body,
          id: Math.floor(Math.random() * 10000),
          schedule: { at: new Date(Date.now() + 1000 * 5) }, // 5 seconds later for demo
          sound: 'default',
        }
      ]
    });
  } catch (e) {
    console.warn("Could not schedule local notification");
  }
};
