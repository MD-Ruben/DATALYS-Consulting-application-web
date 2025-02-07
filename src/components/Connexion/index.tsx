"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@nextui-org/react";
import { Button } from "@nextui-org/button";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

const Connexion: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    // Vérifier si un utilisateur est déjà connecté
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Si un utilisateur est connecté, rediriger vers le tableau de bord
        console.log("Utilisateur déjà connecté, redirection vers le tableau de bord...");
        router.push("/tableaudebord");
      }
    });

    // Nettoyer l'écouteur lors du démontage du composant
    return () => unsubscribe();
  }, [router]);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const auth = getAuth();
      // Connexion de l'utilisateur
      await signInWithEmailAndPassword(auth, email, password);

      // Rediriger vers le tableau de bord après connexion réussie
      router.push("/tableaudebord");
    } catch (error: any) {
      // Gérer les erreurs spécifiques à Firebase
      switch (error.code) {
        case "auth/invalid-email":
          setError("L'adresse e-mail n'est pas valide.");
          break;
        case "auth/user-disabled":
          setError("Ce compte utilisateur est désactivé.");
          break;
        case "auth/user-not-found":
          setError("Aucun utilisateur trouvé avec cet e-mail.");
          break;
        case "auth/wrong-password":
          setError("Le mot de passe est incorrect.");
          break;
        default:
          setError("Erreur lors de la connexion : " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main className="flex w-full">
        <div className="relative hidden h-screen flex-1 items-center justify-center bg-[#001614] lg:flex">
          <div className="relative z-10 -mt-7 w-full max-w-md">
            <Image
              src="/images/logo/logo.png"
              alt=""
              width={180}
              height={120}
            />
            <div className=" mt-16 space-y-3">
              <h3 className="text-3xl font-bold text-white">
                Infrastructure et analyse des données
              </h3>
              <p className="text-gray-300">
                La donnée est aujourd'hui un moteur de croissance pour beaucoup
                d'entreprises.
              </p>
            </div>
          </div>
        </div>
        <div className="flex h-screen flex-1 items-center justify-center">
          <div className="w-full max-w-2xl space-y-8 px-3 text-gray-600 md:px-6">
            <div className="">
              <Image
                src="/images/logo/logo-2.png"
                width={150}
                height={150}
                className="lg:hidden"
                alt=""
              />
              <div className="mt-5 space-y-2">
                <h3 className="text-2xl font-bold text-[#002925] sm:text-3xl">
                  Connexion
                </h3>
              </div>
            </div>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <Input
                  type="email"
                  color="primary"
                  label="Adresse email"
                  variant="flat"
                  placeholder="Entrer votre adresse email"
                  className="max-w-sm [&_input::placeholder]:text-black"
                  size="lg"
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  required
                />
              </div>
              <div>
                <Input
                  type={isVisible ? "text" : "password"}
                  color="primary"
                  label="Mot de passe"
                  variant="flat"
                  placeholder="Entrer votre mot de passe"
                  className="max-w-sm [&_input::placeholder]:text-black"
                  size="lg"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  required
                  endContent={
                    <button
                      className="focus:outline-none"
                      type="button"
                      onClick={toggleVisibility}
                    >
                      {isVisible ? (
                        <svg
                          className="text-2xl text-default-400"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                            fill="currentColor"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="text-2xl text-default-400"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12 19.5c-4.73 0-8.76-2.93-10.5-7 1.74-4.07 5.77-7 10.5-7s8.76 2.93 10.5 7c-1.74 4.07-5.77 7-10.5 7zm0-14c-3.86 0-7.21 2.08-9 5 1.79 2.92 5.14 5 9 5s7.21-2.08 9-5c-1.79-2.92-5.14-5-9-5zm0 8c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm0-4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"
                            fill="currentColor"
                          />
                          <path
                            d="M2 4L22 20"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      )}
                    </button>
                  }
                />
              </div>
              <div className="flex justify-between items-center">
                <Link
                  href="/mot-de-passe-oublie"
                  className="text-sm text-primary hover:underline"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              {error && <p className="text-red-500">{error}</p>}
              <Button
                type="submit"
                color="primary"
                variant="solid"
                disabled={loading}
              >
                {loading ? "Connexion..." : "Connexion"}
              </Button>
            </form>
            <div className="flex justify-start py-4">
              <p className="text-dark text-sm md:text-base">
                All Rights Reserved by
                <Link
                  className="ml-1 font-medium text-primary"
                  href="https://www.datalysconsulting.com/"
                >
                  DATALYS Consulting</Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Connexion;
