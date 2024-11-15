"use client";

import React, { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig";

const DeconnexionButton: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignOut = async () => {
    setLoading(true);
    setError(null); // Réinitialiser l'erreur avant la tentative de déconnexion
    try {
      await signOut(auth);
      window.location.href = "/connexion"; // Redirection après la déconnexion
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      setError("Une erreur est survenue lors de la déconnexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleSignOut} disabled={loading}>
        {loading ? "Déconnexion..." : "Se déconnecter"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default DeconnexionButton;
