// src/components/withAuth.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "@/firebase/firebaseConfig"; // Assurez-vous que Firebase est bien configuré

const withAuth = (WrappedComponent: any) => {
  return function ProtectedRoute(props: any) {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const router = useRouter();
    const auth = getAuth(app);

    useEffect(() => {
      // Vérifier si l'utilisateur est authentifié
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (!user) {
          // Si l'utilisateur n'est pas authentifié, rediriger vers la page de connexion
          router.push("/connexionclient");
        } else {
          setAuthenticated(true); // Si l'utilisateur est authentifié, autoriser l'accès
        }
        setLoading(false);
      });

      // Nettoyage de l'effet pour éviter les fuites de mémoire
      return () => unsubscribe();
    }, [auth, router]);

    if (loading) {
      return <p>Chargement...</p>; // Vous pouvez remplacer cela par un Loader
    }

    if (!authenticated) {
      return null; // Si non authentifié, ne rien rendre jusqu'à la redirection
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
