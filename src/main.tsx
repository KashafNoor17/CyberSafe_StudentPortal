import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import App from "./App.tsx";
import "./index.css";
import "./i18n/config";

Sentry.init({
  dsn: "https://ccaad279647bcc903361259a3a3476f7@o4511011762536448.ingest.us.sentry.io/4511011784032256",
  environment: import.meta.env.MODE,
  integrations: [
    Sentry.browserTracingIntegration({
      enableInp: true,
    }),
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
  replaysSessionSampleRate: 0.01,
  replaysOnErrorSampleRate: 1.0,
  beforeSend(event) {
    if (event.request?.url) {
      event.request.url = event.request.url.replace(
        /([?&]email=)[^&]*/gi,
        "$1[Filtered]"
      );
    }
    return event;
  },
});

createRoot(document.getElementById("root")!).render(<App />);
