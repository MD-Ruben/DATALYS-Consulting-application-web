"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/TableauDeBord/Breadcrumbs/Breadcrumb";
import { Button } from "@nextui-org/button";
import { Input, Checkbox } from "@nextui-org/react";
import { db } from "@/firebase/firebaseConfig";
import {
  collection,
  setDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
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

  const uploadProfileImage = async (
    file: File,
    userId: string,
  ): Promise<string> => {
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
        formData.password,
      );
      const newUser = userCredential.user;

      // Upload de l'image de profil si fournie
      let profileImageUrl = "/images/user.png";
      if (formData.profileImage) {
        try {
          profileImageUrl = await uploadProfileImage(
            formData.profileImage,
            newUser.uid,
          );
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
        query(collection(db, "users"), where("isAdmin", "==", true)),
      );

      // Créer les notifications de manière plus robuste
      if (adminsSnapshot.docs.length > 0) {
        const notificationPromises = adminsSnapshot.docs.map((adminDoc) => {
          return createNotification(
            adminDoc.id,
            {
              title: "Nouveau compte créé",
              body: `créé un nouveau compte pour ${formData.firstName} ${formData.lastName} (${formData.username})`,
              link: "/tableaudebord/utilisateur/voir",
            },
            currentUser.uid,
          ).catch((error) => {
            console.error(
              "Erreur lors de la création de la notification:",
              error,
            );
          });
        });

        await Promise.allSettled(notificationPromises);
      }

      alert("Utilisateur créé avec succès !");
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        setError("Cette adresse e-mail est déjà utilisée.");
      } else {
        console.error("Erreur lors de la création de l'utilisateur :", error);
        setError(
          "Erreur lors de la création de l'utilisateur. Veuillez réessayer.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Breadcrumb pageName="Créer un compte" />
      <div className="mt-5 w-full max-w-full rounded-[10px]">
        <div className="mt-8 rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
          <div className="w-full max-w-full p-2">
            <h3 className="pt-2 text-[22px] font-medium text-dark dark:text-white">
              Créer un compte
            </h3>
          </div>
          <div className="mt-4 rounded-lg shadow-sm">
            <div className="grid grid-cols-1 gap-2 px-2 py-6 md:grid-cols-2 md:gap-4 md:py-4">
              <Input
                type="text"
                label="Nom"
                variant="bordered"
                color="primary"
                placeholder="Entrer votre nom"
                className="text-sm font-medium md:text-base"
                name="lastName"
                onChange={handleChange}
                required
              />
              <Input
                type="text"
                label="Prénom"
                variant="bordered"
                color="primary"
                placeholder="Entrer votre prénom"
                className="text-sm font-medium md:text-base"
                name="firstName"
                onChange={handleChange}
                required
              />
              <Input
                type="text"
                label="Nom d'utilisateur"
                variant="bordered"
                color="primary"
                placeholder="Entrer votre nom d'utilisateur"
                className="text-sm font-medium md:text-base"
                name="username"
                onChange={handleChange}
                required
              />

              <Input
                type="text"
                label="Adresse e-mail"
                variant="bordered"
                color="primary"
                placeholder="Entrer votre adresse e-mail"
                className="text-sm font-medium md:text-base"
                name="email"
                onChange={handleChange}
                required
              />
              <Input
                type="password"
                label="Mot de passe"
                variant="bordered"
                color="primary"
                placeholder="Entrer votre mot de passe"
                className="text-sm font-medium md:text-base"
                name="password"
                onChange={handleChange}
                required
              />
              <Input
                type="password"
                label="Confirmer le mot de passe"
                variant="bordered"
                color="primary"
                placeholder="Veuillez confirmer votre mot de passe"
                className="text-sm font-medium md:text-base"
                name="confirmPassword"
                onChange={handleChange}
                required
              />
              <Input
                type="text"
                label="Poste"
                variant="bordered"
                color="primary"
                placeholder="Entrer votre poste"
                className="text-sm font-medium md:text-base"
                name="function"
                onChange={handleChange}
                required
              />
              <Input
                type="text"
                label="Société"
                variant="bordered"
                color="primary"
                placeholder="Entrer le nom de la société"
                className="text-sm font-medium md:text-base"
                name="company"
                onChange={handleChange}
                required
              />
              <Input
                type="text"
                label="Département de la société"
                variant="bordered"
                color="primary"
                placeholder="Entrer le département"
                className="text-sm font-medium md:text-base"
                name="department"
                onChange={handleChange}
                required
              />
              <Input
                type="file"
                label="Photo de profil"
                variant="bordered"
                color="primary"
                className="text-sm font-medium md:text-base"
                name="profileImage"
                onChange={handleFileChange}
              />
              <Checkbox
                isSelected={formData.isAdmin}
                onChange={handleRoleChange}
                color="primary"
              >
                Administrateur
              </Checkbox>
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <div className="flex justify-center px-2 py-2">
              <Button
                color="primary"
                className="w-64 flex-none"
                variant="solid"
                size="md"
                onClick={handleSubmit}
                isDisabled={loading}
              >
                {loading ? "Création..." : "Créer"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreerUnCompte;
