"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/firebase/firebaseConfig"; // Importez votre configuration Firebase
import { doc, getDoc } from "firebase/firestore"; // Importez Firestore pour vérifier le rôle admin
import { getAuth, onAuthStateChanged } from "firebase/auth"; // Importez Firebase Auth

const AdminOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const auth = getAuth();

    // Vérification de l'état d'authentification
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Récupérer les informations de l'utilisateur dans Firestore
          const userDocRef = doc(db, "users", user.uid); // Chemin vers les utilisateurs dans Firestore
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists() && userDoc.data().isAdmin) {
            // Si l'utilisateur est un admin
            setIsAdmin(true);
          } else {
            // Si l'utilisateur n'est pas admin, redirection vers la page de connexion
            window.location.href = "/connexion";
          }
        } catch (error) {
          console.error(
            "Erreur lors de la récupération des informations admin:",
            error,
          );
          window.location.href = "/connexion";
        }
      } else {
        // Redirection si l'utilisateur n'est pas connecté
        window.location.href = "/connexion";
      }
      setLoading(false);
    });

    return () => unsubscribe(); // Nettoyage de l'écouteur d'authentification
  }, []);

  if (loading) {
    return <p>Chargement...</p>; // Affichez un indicateur de chargement pendant la vérification
  }

  if (!isAdmin) {
    return null; // Si l'utilisateur n'est pas admin, redirection déjà effectuée
  }

  return <>{children}</>; // Affiche le contenu si l'utilisateur est admin
};

export default AdminOnly;
