"use client";

import { useEffect } from "react";
import { initializeMessaging } from "@/firebase/firebaseConfig";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Vérifier si nous sommes côté client
    if (typeof window !== "undefined") {
      // Initialiser la messagerie de manière sécurisée
      initializeMessaging().catch(console.error);
    }
  }, []);

  // ... reste du composant
} 