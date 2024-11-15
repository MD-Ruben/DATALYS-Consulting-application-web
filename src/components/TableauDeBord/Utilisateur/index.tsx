"use client";

import React, { useEffect, useState } from "react";
import Breadcrumb from "@/components/TableauDeBord/Breadcrumbs/Breadcrumb";
import Image from "next/image";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  function: string;
  company: string;
  department: string;
  email: string;
  profileImage: string;
  isAdmin: boolean;
  createdAt: Date;
}

const Utilisateur = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const usersList = usersSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            function: data.function || "",
            company: data.company || "",
            department: data.department || "",
            email: data.email || "",
            profileImage: data.profileImage || "/images/user.png",
            isAdmin: data.isAdmin || false,
            createdAt: data.createdAt?.toDate() || new Date(),
          };
        });
        setUsers(usersList);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des utilisateurs:",
          error,
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return <div>Chargement des utilisateurs...</div>;
  }

  return (
    <>
      <Breadcrumb pageName="La liste des utilisateurs" />
      <div className="mt-5 w-full max-w-full rounded-[10px]">
        <div className="mt-8 rounded-[10px]">
          <div className="w-full max-w-full p-2">
            <div className="flex w-full items-center justify-start">
              <h3 className="pt-2 text-[22px] font-medium text-dark dark:text-white">
                La liste des utilisateurs
              </h3>
            </div>
          </div>
          <div className="mt-4 rounded-lg shadow-sm">
            <div className="grid grid-cols-1 gap-4 px-2 py-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="w-full rounded-lg border border-gray-200 bg-white p-4 shadow-1 transition-all duration-300 hover:shadow-lg dark:border-dark-3 dark:bg-gray-dark dark:shadow-card"
                >
                  <div className="flex flex-col items-center">
                    <div className="relative h-24 w-24 overflow-hidden rounded-full">
                      <Image
                        src={user.profileImage}
                        alt={`${user.firstName} ${user.lastName}`}
                        width={96}
                        height={96}
                        className="rounded-full object-cover transition-transform duration-300 hover:scale-110"
                      />
                    </div>
                    <div className="mt-4 text-center">
                      <h5 className="mb-2 text-xl font-semibold text-dark dark:text-white">
                        {user.firstName} {user.lastName}
                      </h5>
                      <div className="space-y-1">
                        {user.isAdmin && (
                          <span className="mb-2 inline-block rounded-full bg-primary px-3 py-1 text-xs text-white">
                            Administrateur
                          </span>
                        )}
                        {user.function && (
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {user.function}
                          </p>
                        )}
                        {user.company && (
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {user.company}
                          </p>
                        )}
                        {user.department && (
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {user.department}
                          </p>
                        )}
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          Membre depuis {user.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Utilisateur;
