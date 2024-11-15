"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/firebase/firebaseConfig"; // Assurez-vous que Firebase est bien configuré

interface BreadcrumbProps {
  pageName: string;
}

const Breadcrumb = ({ pageName }: BreadcrumbProps) => {
  const [userName, setUserName] = useState({ firstName: "", lastName: "" });

  // Fonction pour récupérer les informations utilisateur depuis Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid); // Assurez-vous que la collection est correcte
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserName({
              firstName: userData.firstName,
              lastName: userData.lastName,
            });
          }
        } catch (error) {
          console.error(
            "Erreur lors de la récupération des données utilisateur :",
            error,
          );
        }
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-[22px] font-thin leading-[30px] text-dark dark:text-white">
        M. {userName.firstName} {userName.lastName}
      </h2>

      <nav>
        <ol className="flex items-center gap-2">
          <li>
            <Link className="font-medium" href="/">
              Tableau de bord /
            </Link>
          </li>
          <li className="font-medium text-primary">{pageName}</li>
        </ol>
      </nav>
    </div>
  );
};

export default Breadcrumb;
