// VAPID Public Key for Web Push Notifications
// This is a public key and can be safely stored in the codebase
// Replace this with your actual VAPID public key from the secrets you configured

export const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

// Note: Make sure to add VITE_VAPID_PUBLIC_KEY to your .env file
// You can get this value from the VAPID_PUBLIC_KEY secret you configured
