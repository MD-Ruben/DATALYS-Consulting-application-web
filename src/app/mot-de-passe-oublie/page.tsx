"use client";

import React, { useState } from "react";
import { Input } from "@nextui-org/react";
import { Button } from "@nextui-org/button";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import Link from "next/link";
import Image from "next/image";

const MotDePasseOublie = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      setMessage({
        text: "Un email de réinitialisation a été envoyé à votre adresse email.",
        type: 'success'
      });
      setEmail("");
    } catch (error: any) {
      let errorMessage = "Une erreur est survenue.";
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = "L'adresse email n'est pas valide.";
          break;
        case 'auth/user-not-found':
          errorMessage = "Aucun compte n'est associé à cette adresse email.";
          break;
      }
      setMessage({
        text: errorMessage,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex w-full">
      <div className="relative hidden h-screen flex-1 items-center justify-center bg-[#001614] lg:flex">
        <div className="relative z-10 -mt-7 w-full max-w-md">
          <Image
            src="/images/logo/logo.png"
            alt=""
            width={180}
            height={120}
          />
          <div className="mt-16 space-y-3">
            <h3 className="text-3xl font-bold text-white">
              Réinitialisation du mot de passe
            </h3>
            <p className="text-gray-300">
              Nous vous enverrons un email pour réinitialiser votre mot de passe.
            </p>
          </div>
        </div>
      </div>
      <div className="flex h-screen flex-1 items-center justify-center">
        <div className="w-full max-w-2xl space-y-8 px-3 text-gray-600 md:px-6">
          <div>
            <Image
              src="/images/logo/logo-2.png"
              width={150}
              height={150}
              className="lg:hidden"
              alt=""
            />
            <div className="mt-5 space-y-2">
              <h3 className="text-2xl font-bold text-[#002925] sm:text-3xl">
                Mot de passe oublié
              </h3>
              <p className="text-gray-600">
                Entrez votre email pour réinitialiser votre mot de passe
              </p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Input
                type="email"
                color="primary"
                label="Adresse email"
                variant="flat"
                placeholder="Entrer votre adresse email"
                className="max-w-sm [&_input::placeholder]:text-black"
                size="lg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {message && (
              <p className={`text-${message.type === 'success' ? 'green' : 'red'}-500`}>
                {message.text}
              </p>
            )}
            <div className="flex flex-col gap-4">
              <Button
                type="submit"
                color="primary"
                variant="solid"
                disabled={loading}
              >
                {loading ? "Envoi en cours..." : "Envoyer le lien"}
              </Button>
              <Link
                href="/"
                className="text-center text-sm text-primary hover:underline"
              >
                Retour à la connexion
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default MotDePasseOublie; 