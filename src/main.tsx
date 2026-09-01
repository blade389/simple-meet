import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";

// Clean up stale/broken service workers (the old /sw.js no longer exists and,
// when left registered, it can intercept requests and cause "Failed to fetch").
// Push notifications are handled by the OneSignal worker, which registers itself.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations?.()
    .then((registrations) => {
      registrations.forEach((registration) => {
        const scriptUrl =
          registration.active?.scriptURL ||
          registration.installing?.scriptURL ||
          registration.waiting?.scriptURL ||
          '';
        if (!scriptUrl.includes('OneSignal')) {
          registration.unregister();
        }
      });
    })
    .catch(() => {
      /* ignore */
    });
}


createRoot(document.getElementById("root")!).render(<App />);
