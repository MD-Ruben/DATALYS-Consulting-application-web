"use client";
// Import polyfills
import "@/lib/polyfills";
/*import "jsvectormap/dist/css/jsvectormap.css";*/
import "flatpickr/dist/flatpickr.min.css";
import "@/css/satoshi.css";
import "@/css/style.css";
import React, { useEffect, useState } from "react";
import Loader from "@/components/common/Loader";
import { requestFCMToken } from "@/firebase/firebaseConfig";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((registration) => {
          console.log("Service Worker enregistré avec succès:", registration);
          requestFCMToken();
        })
        .catch((error) => {
          console.error(
            "Erreur lors de l'enregistrement du Service Worker:",
            error,
          );
        });
    } else {
      console.warn("Service Worker non supporté dans ce navigateur.");
    }
  }, []);

  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        {loading ? <Loader /> : children}
      </body>
    </html>
  );
}
