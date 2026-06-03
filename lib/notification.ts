import { google } from "googleapis";

const PROJECT_ID = "sukamcd-caea8";

export async function sendReleasePushNotification(
  version: string,
  appName: string = "McdWallet",
  forceUpdate: boolean = false
) {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    console.warn("FCM push notifications skipped: FIREBASE_SERVICE_ACCOUNT_JSON is not configured in .env.local.");
    return { success: false, reason: "Credentials not configured" };
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountJson);
    if (!serviceAccount.client_email || !serviceAccount.private_key) {
      console.warn("FCM push notifications skipped: FIREBASE_SERVICE_ACCOUNT_JSON is invalid.");
      return { success: false, reason: "Invalid credentials format" };
    }

    // Authenticate using googleapis JWT auth (menggunakan objek parameter)
    const jwtClient = new google.auth.JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
    });

    await jwtClient.authorize();
    const accessToken = jwtClient.credentials.access_token;

    if (!accessToken) {
      throw new Error("Failed to get Google APIs OAuth2 access token");
    }

    const title = forceUpdate 
      ? `⚠️ Pembaruan Wajib ${appName} Tersedia!` 
      : `🚀 Pembaruan ${appName} Baru Tersedia!`;
    
    const body = forceUpdate
      ? `Versi v${version} dirilis. Anda wajib melakukan pembaruan untuk terus menggunakan aplikasi.`
      : `Versi v${version} sekarang tersedia. Buka aplikasi untuk melihat daftar perubahan dan mengunduh.`;

    const response = await fetch(
      `https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          message: {
            topic: "mcdwallet_updates",
            notification: {
              title: title,
              body: body,
            },
            android: {
              notification: {
                click_action: "TOP_LEVEL_INTENT",
                sound: "default",
              },
            },
            apns: {
              payload: {
                aps: {
                  sound: "default",
                },
              },
            },
          },
        }),
      }
    );

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error?.message || response.statusText);
    }

    console.log(`[FCM] Push notification sent successfully for version v${version}:`, result);
    return { success: true, messageId: result.name };

  } catch (error: any) {
    console.error("[FCM] Error sending push notification:", error);
    return { success: false, error: error.message };
  }
}
