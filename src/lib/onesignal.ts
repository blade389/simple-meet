import OneSignal from "react-onesignal";

export const runOneSignal = async () => {
  try {
    await OneSignal.init({
      appId: "6c1a6559-422c-4b84-84c7-95574fcc3ae1", // TODO: Sostituisci con il tuo App ID di OneSignal
      allowLocalhostAsSecureOrigin: true,
    });
    console.log("OneSignal initialized");
  } catch (error) {
    console.error("Error initializing OneSignal:", error);
  }
};

export const showOneSignalPrompt = async () => {
  try {
    await OneSignal.Slidedown.promptPush();
  } catch (error) {
    console.error("Error showing OneSignal prompt:", error);
  }
};

export const loginOneSignal = async (userId: string) => {
  try {
    await OneSignal.login(userId);
    console.log("OneSignal user logged in:", userId);
  } catch (error) {
    console.error("Error logging in OneSignal user:", error);
  }
};
