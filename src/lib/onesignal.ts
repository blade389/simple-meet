import OneSignal from 'react-onesignal';

export const runOneSignal = async () => {
  try {
    await OneSignal.init({
      appId: "YOUR_ONESIGNAL_APP_ID", // TODO: Sostituisci con il tuo App ID di OneSignal
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
