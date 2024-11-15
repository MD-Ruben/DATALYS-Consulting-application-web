"use client";

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

  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowLoader(true), 300); // Affiche le loader après 300 ms
    return () => clearTimeout(timer); // Efface le timer à la fin
  }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((registration) => {
          console.log("Service Worker enregistré avec succès:", registration);

          // Vérifie que le Service Worker est actif avant de demander le token FCM
          if (registration.active) {
            console.log("Service Worker est actif.");
            requestFCMToken();
          } else {
            registration.addEventListener("statechange", (event) => {
              if (event.target.state === "activated") {
                console.log("Service Worker activé.");
                requestFCMToken();
              }
            });
          }
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
        {loading && showLoader ? <Loader /> : children}
      </body>
    </html>
  );
}
