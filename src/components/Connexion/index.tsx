"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@nextui-org/react";
import { Button } from "@nextui-org/button";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { useRouter } from "next/navigation";

const Connexion: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    // Vérifier si un utilisateur est déjà connecté
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Si un utilisateur est connecté, rediriger vers le tableau de bord
        console.log(
          "Utilisateur déjà connecté, redirection vers le tableau de bord...",
        );
        router.push("/tableaudebord");
      }
    });

    // Nettoyer l'écouteur lors du démontage du composant
    return () => unsubscribe();
  }, [router]);

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
              alt="logo"
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
                  className="max-w-sm"
                  size="lg"
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  required
                  style={{ fontSize: "0.9rem" }}
                />
              </div>
              <div>
                <Input
                  type="password"
                  color="primary"
                  label="Mot de passe"
                  variant="flat"
                  placeholder="Entrer votre mot de passe"
                  className="max-w-sm"
                  size="lg"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  required
                  style={{ fontSize: "0.9rem" }}
                />
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
            <div className="flex flex-wrap pb-4 pt-5">
              <p className="text-dark">
                All Rights Reserved by
                <Link
                  className="ml-1 font-medium text-primary"
                  href="https://www.datalysconsulting.com/"
                  target="_blank"
                >
                  DATALYS Consulting
                </Link>
                . Designed and Developed by{" "}
                <Link className="text-primary" href="javascript:;">
                  LA VICTOIRE
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Connexion;
