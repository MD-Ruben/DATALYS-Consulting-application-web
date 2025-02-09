"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/TableauDeBord/Breadcrumbs/Breadcrumb";
import { Button } from "@nextui-org/button";
import { Input, Checkbox } from "@nextui-org/react";
import { db } from "@/firebase/firebaseConfig";
import { collection, setDoc, doc, getDocs, query, where } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { createNotification } from "@/firebase/firebaseConfig";

const CreerUnCompte = () => {
  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    isAdmin: false,
    function: "",
    company: "",
    department: "",
    profileImage: null as File | null,
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, profileImage: e.target.files[0] });
    }
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, isAdmin: e.target.checked });
  };

  const uploadProfileImage = async (file: File, userId: string): Promise<string> => {
    const storage = getStorage();
    const storageRef = ref(storage, `profileImages/${userId}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const checkUsernameExists = async (username: string): Promise<boolean> => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const handleSubmit = async () => {
    setError(null);

    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        setError("Vous devez être connecté pour créer un compte");
        return;
      }

      if (
        !formData.lastName ||
        !formData.firstName ||
        !formData.username ||
        !formData.email ||
        !formData.password ||
        !formData.confirmPassword
      ) {
        setError("Veuillez remplir tous les champs.");
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Les mots de passe ne correspondent pas.");
        return;
      }

      // Vérifier si le username existe déjà
      const usernameExists = await checkUsernameExists(formData.username);
      if (usernameExists) {
        setError("Ce nom d'utilisateur est déjà pris.");
        return;
      }

      setLoading(true);

      // Créer le nouvel utilisateur
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const newUser = userCredential.user;

      // Upload de l'image de profil si fournie
      let profileImageUrl = "/images/user.png";
      if (formData.profileImage) {
        try {
          profileImageUrl = await uploadProfileImage(formData.profileImage, newUser.uid);
        } catch (error) {
          console.error("Erreur lors de l'upload de l'image:", error);
        }
      }

      // Créer le document utilisateur
      await setDoc(doc(db, "users", newUser.uid), {
        lastName: formData.lastName,
        firstName: formData.firstName,
        username: formData.username,
        email: formData.email,
        isAdmin: formData.isAdmin,
        function: formData.function,
        company: formData.company,
        department: formData.department,
        profileImage: profileImageUrl,
        createdAt: new Date(),
      });

      console.log("Utilisateur créé avec succès !");

      // Notifier les administrateurs
      const adminsSnapshot = await getDocs(
        query(collection(db, "users"), where("isAdmin", "==", true))
      );

      // Créer les notifications avec l'ID de l'utilisateur actuel
      const notificationPromises = adminsSnapshot.docs.map(async (adminDoc) => {
        await createNotification(
          adminDoc.id,
          {
            title: "Nouveau compte créé",
            body: `créé un nouveau compte pour ${formData.firstName} ${formData.lastName} (${formData.username})`,
            link: "/tableaudebord/utilisateur/voir"
          },
          currentUser.uid
        );
      });

      await Promise.all(notificationPromises);
      alert("Utilisateur créé avec succès !");

    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        setError("Cette adresse e-mail est déjà utilisée.");
      } else {
        console.error("Erreur lors de la création de l'utilisateur :", error);
        setError("Erreur lors de la création de l'utilisateur. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible);
  const toggleConfirmPasswordVisibility = () => setIsConfirmPasswordVisible(!isConfirmPasswordVisible);

  return (
    <>
      <Breadcrumb pageName="Créer un compte" />
      <div className="mx-auto mt-5 w-full max-w-3xl rounded-[10px]">
        <div className="mt-8 rounded-[20px] bg-white p-8 shadow-1 dark:bg-gray-dark dark:shadow-card">
          <div className="mb-8 text-center">
            <h3 className="mb-2 text-[28px] font-bold text-dark dark:text-white">
              Créer un compte
            </h3>
            <p className="text-base text-gray-600 dark:text-gray-400">
              Remplissez les informations pour créer un nouveau compte utilisateur
            </p>
          </div>

          <div className="mt-8">
            {error && (
              <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-10">
              <Input
                type="text"
                label="Nom"
                variant="bordered"
                color="primary"
                placeholder="Entrer votre nom"
                className="text-base"
                name="lastName"
                onChange={handleChange}
                required
                labelPlacement="outside"
                size="lg"
              />

              <Input
                type="text"
                label="Prénom"
                variant="bordered"
                color="primary"
                placeholder="Entrer votre prénom"
                className="text-base"
                name="firstName"
                onChange={handleChange}
                required
                labelPlacement="outside"
                size="lg"
              />

              <Input
                type="text"
                label="Nom d'utilisateur"
                variant="bordered"
                color="primary"
                placeholder="Entrer votre nom d'utilisateur"
                className="text-base"
                name="username"
                onChange={handleChange}
                required
                labelPlacement="outside"
                size="lg"
              />

              <Input
                type="email"
                label="Email"
                variant="bordered"
                color="primary"
                placeholder="Entrer votre email"
                className="text-base"
                name="email"
                onChange={handleChange}
                required
                labelPlacement="outside"
                size="lg"
              />

              <Input
                type={isPasswordVisible ? "text" : "password"}
                label="Mot de passe"
                variant="bordered"
                color="primary"
                placeholder="Entrer votre mot de passe"
                className="text-base"
                name="password"
                onChange={handleChange}
                required
                labelPlacement="outside"
                size="lg"
                endContent={
                  <button
                    className="focus:outline-none"
                    type="button"
                    onClick={togglePasswordVisibility}
                  >
                    {isPasswordVisible ? (
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
                label="Confirmer le mot de passe"
                variant="bordered"
                color="primary"
                placeholder="Veuillez confirmer votre mot de passe"
                className="text-base"
                name="confirmPassword"
                onChange={handleChange}
                required
                labelPlacement="outside"
                size="lg"
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

              <Input
                type="text"
                label="Poste"
                variant="bordered"
                color="primary"
                placeholder="Entrer votre poste"
                className="text-base"
                name="function"
                onChange={handleChange}
                required
                labelPlacement="outside"
                size="lg"
              />

              <Input
                type="text"
                label="Société"
                variant="bordered"
                color="primary"
                placeholder="Entrer le nom de la société"
                className="text-base"
                name="company"
                onChange={handleChange}
                required
                labelPlacement="outside"
                size="lg"
              />

              <Input
                type="text"
                label="Département de la société"
                variant="bordered"
                color="primary"
                placeholder="Entrer le département"
                className="text-base"
                name="department"
                onChange={handleChange}
                required
                labelPlacement="outside"
                size="lg"
              />

              <Input
                type="file"
                label="Photo de profil"
                variant="bordered"
                color="primary"
                className="text-base"
                name="profileImage"
                onChange={handleFileChange}
                labelPlacement="outside"
                size="lg"
              />

              <div className="mt-2">
                <Checkbox
                  isSelected={formData.isAdmin}
                  onChange={handleRoleChange}
                  color="primary"
                  size="sm"
                  className="text-base"
                >
                  Administrateur
                </Checkbox>
              </div>

              <div className="mt-8 text-center">
                <Button
                  color="primary"
                  className="h-12 w-full max-w-md text-base font-medium"
                  variant="solid"
                  size="lg"
                  onClick={handleSubmit}
                  isDisabled={loading}
                >
                  {loading ? "Création en cours..." : "Créer le compte"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Tous les champs sont obligatoires sauf la photo de profil
          </p>
        </div>
      </div>
    </>
  );
};

export default CreerUnCompte;