"use client";

import React, { useEffect, useState } from "react";
import Breadcrumb from "@/components/TableauDeBord/Breadcrumbs/Breadcrumb";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "@/firebase/firebaseConfig";
import ModifierProfil from "@/components/TableauDeBord/Profil/ModifierProfil";
import { Button } from "@nextui-org/react";

interface UserData {
  lastName: string;
  firstName: string;
  function: string;
  company: string;
  department: string;
  email: string;
  profileImage: string;
  isAdmin: boolean;
  createdAt: Date;
}

const VoirProfil = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const fetchUserData = async () => {
    const auth = getAuth(app);
    const user = auth.currentUser;
    if (user) {
      console.log("Utilisateur authentifié:", user.uid);
      const db = getFirestore(app);
      const userDoc = doc(db, "users", user.uid);
      console.log(
        "Tentative de récupération des données pour l'utilisateur:",
        user.uid,
      );
      const userSnapshot = await getDoc(userDoc);
      if (userSnapshot.exists()) {
        console.log("Données utilisateur récupérées:", userSnapshot.data());
        setUserData(userSnapshot.data() as UserData);
      } else {
        console.log("Aucune donnée trouvée pour cet utilisateur.");
      }
    } else {
      console.log("Aucun utilisateur authentifié.");
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleUpdate = async () => {
    console.log("Rafraîchissement des données du profil...");
    await fetchUserData();
  };

  if (!userData) {
    return <div>Chargement...</div>;
  }

  return (
    <>
      <Breadcrumb pageName="Voir votre profil" />
      <div className="mt-5 w-full max-w-full rounded-[10px]">
        <div className="mt-8 rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
          <div className="container mx-auto py-8">
            <div className="grid grid-cols-12 gap-6 px-4">
              <div className="col-span-12 md:col-span-3">
                <div className="rounded-lg border-stroke bg-white p-6 shadow dark:border-stroke-dark dark:bg-gray-dark">
                  <div className="flex flex-col items-center">
                    <div className="relative h-32 w-32 overflow-hidden rounded-full">
                      <img
                        src={userData.profileImage || "/images/user.png"}
                        alt="Photo de profil"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <h1 className="mt-4 text-xl font-bold">
                      {userData.firstName} {userData.lastName}
                    </h1>
                    <p className="text-gray-900 dark:text-white">
                      {userData.function}
                    </p>
                    <Button
                      onPress={() => setIsEditing(true)}
                      color="primary"
                      className="mt-4"
                    >
                      Modifier le Profil
                    </Button>
                  </div>
                </div>
              </div>
              <div className="col-span-12 md:col-span-9">
                <div className="rounded-lg border-stroke bg-white p-6 shadow dark:border-stroke-dark dark:bg-gray-dark">
                  <h2 className="mb-4 text-xl font-bold">Voir votre profil</h2>
                  <div className="mt-4 rounded-lg shadow-sm">
                    <div className="grid grid-cols-1 gap-2 px-2 py-6 md:grid-cols-2 md:gap-4 md:py-4">
                      <p className="text-base font-extrabold tracking-wide text-dark dark:text-white">
                        Nom:{" "}
                        <span className="font-light">{userData.lastName}</span>
                      </p>
                      <p className="text-base font-extrabold tracking-wide text-dark dark:text-white">
                        Prénom:{" "}
                        <span className="font-light">{userData.firstName}</span>
                      </p>
                      <p className="text-base font-extrabold tracking-wide text-dark dark:text-white">
                        Votre fonction:{" "}
                        <span className="font-light">{userData.function}</span>
                      </p>
                      <p className="text-base font-extrabold tracking-wide text-dark dark:text-white">
                        Société:{" "}
                        <span className="font-light">{userData.company}</span>
                      </p>
                      <p className="text-base font-extrabold tracking-wide text-dark dark:text-white">
                        Département de la société:{" "}
                        <span className="font-light">
                          {userData.department}
                        </span>
                      </p>
                      <p className="text-base font-extrabold tracking-wide text-dark dark:text-white">
                        Adresse e-mail:{" "}
                        <span className="font-light">{userData.email}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isEditing && (
        <ModifierProfil
          userData={userData}
          onClose={() => setIsEditing(false)}
          onUpdate={handleUpdate}
        />
      )}
    </>
  );
};

export default VoirProfil;
