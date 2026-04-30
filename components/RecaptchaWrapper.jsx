"use client";

import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

export default function RecaptchaWrapper({ children }) {
  // HARD-CODED FOR TESTING
  const siteKey = "6LcSms4sAAAAAOr0TIOd7dv4C_e7LO4vP3kVbabs";

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={siteKey}
      language="ar"
    >
      {children}
    </GoogleReCaptchaProvider>
  );
}
