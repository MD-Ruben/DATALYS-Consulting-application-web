"use client"; // Assurez-vous que ce composant est un Client Component

import { signOut } from "firebase/auth"; // Import Firebase signOut
import { auth } from "@/firebase/firebaseConfig"; // Import Firebase auth instance

const TestPage = () => {
  const handleLogout = async () => {
    try {
      await signOut(auth); // Appel à la fonction signOut de Firebase
      console.log("Déconnexion réussie"); // Afficher dans la console si ça fonctionne
      window.location.href = "/connexionclient"; // Rediriger après déconnexion
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error); // Afficher les erreurs
    }
  };

  return (
    <div>
      <h1>Test de la déconnexion Firebase</h1>
      <button onClick={handleLogout}>Se déconnecter</button>
    </div>
  );
};

export default TestPage;
