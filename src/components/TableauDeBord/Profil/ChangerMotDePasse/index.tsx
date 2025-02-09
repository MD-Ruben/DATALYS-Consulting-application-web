"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/TableauDeBord/Breadcrumbs/Breadcrumb";
import { Button } from "@nextui-org/button";
import { Input, Checkbox } from "@nextui-org/react";
import { 
  getAuth, 
  updatePassword, 
  signInWithEmailAndPassword, 
  signOut,
  EmailAuthProvider,
  reauthenticateWithCredential 
} from "firebase/auth";

const ChangerMotDePasse = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [keepOtherSessionsActive, setKeepOtherSessionsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] = useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  // Validation du mot de passe
  const validatePassword = (password: string): boolean => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      setError(`Le mot de passe doit contenir au moins ${minLength} caractères`);
      return false;
    }
    if (!hasUpperCase) {
      setError("Le mot de passe doit contenir au moins une majuscule");
      return false;
    }
    if (!hasLowerCase) {
      setError("Le mot de passe doit contenir au moins une minuscule");
      return false;
    }
    if (!hasNumbers) {
      setError("Le mot de passe doit contenir au moins un chiffre");
      return false;
    }
    if (!hasSpecialChar) {
      setError("Le mot de passe doit contenir au moins un caractère spécial");
      return false;
    }
    return true;
  };

  const handlePasswordChange = async () => {
    try {
      setError(null);
      setLoading(true);

      // Vérifications de base
      if (!currentPassword || !newPassword || !confirmPassword) {
        setError("Veuillez remplir tous les champs");
        return;
      }

      if (newPassword !== confirmPassword) {
        setError("Les nouveaux mots de passe ne correspondent pas");
        return;
      }

      if (currentPassword === newPassword) {
        setError("Le nouveau mot de passe doit être différent de l'ancien");
        return;
      }

      // Validation du nouveau mot de passe
      if (!validatePassword(newPassword)) {
        return;
      }

      const auth = getAuth();
      const user = auth.currentUser;

      if (!user || !user.email) {
        setError("Aucun utilisateur connecté"); 
        return;
      }

      try {
        // Réauthentification de l'utilisateur
        const credential = EmailAuthProvider.credential(
          user.email,
          currentPassword
        );
        await reauthenticateWithCredential(user, credential);

        // Mettre à jour le mot de passe
        await updatePassword(user, newPassword);

        // Si l'utilisateur ne veut pas garder les autres sessions actives
        if (!keepOtherSessionsActive) {
          // Déconnecter toutes les autres sessions
          await signOut(auth);
          // Se reconnecter avec le nouveau mot de passe
          await signInWithEmailAndPassword(auth, user.email, newPassword);
        }

        // Réinitialiser les champs
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        alert("Mot de passe modifié avec succès !");
      } catch (error) {
        console.error("Erreur spécifique:", error);
        if (error.code === 'auth/wrong-password') {
          setError("Le mot de passe actuel est incorrect");
        } else {
          setError("Une erreur est survenue lors du changement de mot de passe");
        }
      }
    } catch (error) {
      console.error("Erreur lors du changement de mot de passe:", error);
      setError("Une erreur est survenue lors du changement de mot de passe");
    } finally {
      setLoading(false);
    }
  };

  const toggleCurrentPasswordVisibility = () => setIsCurrentPasswordVisible(!isCurrentPasswordVisible);
  const toggleNewPasswordVisibility = () => setIsNewPasswordVisible(!isNewPasswordVisible);
  const toggleConfirmPasswordVisibility = () => setIsConfirmPasswordVisible(!isConfirmPasswordVisible);

  return (
    <>
      <Breadcrumb pageName="Changer votre mot de passe" />
      <div className="mt-5 w-full max-w-full rounded-[10px]">
        <div className="mt-8 rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
          <div className="w-full max-w-full p-2">
            <h3 className="pt-2 text-[22px] font-medium text-dark dark:text-white">
              Changer votre mot de passe
            </h3>
          </div>
          <div className="mt-4 rounded-lg shadow-sm">
            {error && (
              <div className="mx-2 mb-4 rounded-lg bg-red-100 p-4 text-red-700">
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 gap-2 px-2 py-6 md:grid-cols-2 md:gap-4 md:py-4">
              <Input
                type={isCurrentPasswordVisible ? "text" : "password"}
                label="Mot de passe actuel"
                variant="bordered"
                color="primary"
                placeholder="Entrer votre mot de passe actuel"
                className="text-sm font-medium md:text-base"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                endContent={
                  <button
                    className="focus:outline-none"
                    type="button"
                    onClick={toggleCurrentPasswordVisibility}
                  >
                    {isCurrentPasswordVisible ? (
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
              <Input
                type={isNewPasswordVisible ? "text" : "password"}
                label="Nouveau mot de passe"
                variant="bordered"
                color="primary"
                placeholder="Entrer votre nouveau mot de passe"
                className="text-sm font-medium md:text-base"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                endContent={
                  <button
                    className="focus:outline-none"
                    type="button"
                    onClick={toggleNewPasswordVisibility}
                  >
                    {isNewPasswordVisible ? (
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
              <Input
                type={isConfirmPasswordVisible ? "text" : "password"}
                label="Confirmer le nouveau mot de passe"
                variant="bordered"
                color="primary"
                placeholder="Confirmer votre nouveau mot de passe"
                className="text-sm font-medium md:text-base"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                endContent={
                  <button
                    className="focus:outline-none"
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                  >
                    {isConfirmPasswordVisible ? (
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
            <div className="px-2 py-2">
              <Checkbox
                isSelected={keepOtherSessionsActive}
                onValueChange={setKeepOtherSessionsActive}
              >
                Garder les autres sessions actives
              </Checkbox>
            </div>
            <div className="flex justify-center px-2 py-2">
              <Button
                color="primary"
                className="w-64 flex-none"
                variant="solid"
                size="md"
                onPress={handlePasswordChange}
                isLoading={loading}
              >
                Changer le mot de passe
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChangerMotDePasse;
