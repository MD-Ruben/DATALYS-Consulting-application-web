"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/TableauDeBord/Breadcrumbs/Breadcrumb";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/react";
import { Select, SelectItem } from "@nextui-org/react";
import { domaines } from "./domaineData";
import { db } from "@/firebase/firebaseConfig";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { createNotification } from "@/firebase/firebaseConfig";

const CreerProjet = () => {
  const [formData, setFormData] = useState({
    intitule: "",
    societe: "",
    chefDeProjet: "",
    domaine: [] as string[],
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (selected: Set<string>) => {
    setFormData({ ...formData, domaine: Array.from(selected) });
  };

  const handleSubmit = async () => {
    try {
      console.log("Début de la création du projet...");
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        console.error("Aucun utilisateur connecté");
        setError("Utilisateur non connecté");
        return;
      }

      if (!formData.intitule || !formData.societe || !formData.chefDeProjet || formData.domaine.length === 0) {
        setError("Veuillez remplir tous les champs.");
        return;
      }
      setLoading(true);

      const docRef = await addDoc(collection(db, "projects"), {
        intitule: formData.intitule,
        societe: formData.societe,
        chefDeProjet: formData.chefDeProjet,
        domaine: formData.domaine,
        createdAt: new Date(),
        createdBy: currentUser.uid,
      });

      console.log("Projet créé avec succès, ID:", docRef.id);

      const adminsSnapshot = await getDocs(
        query(collection(db, "users"), where("isAdmin", "==", true))
      );

      console.log("Nombre d'administrateurs trouvés:", adminsSnapshot.size);

      const notificationPromises = adminsSnapshot.docs.map(async (adminDoc) => {
        console.log("Création de notification pour admin:", adminDoc.id);
        try {
          await createNotification(
            adminDoc.id,
            {
              title: "Nouveau projet créé",
              body: `a créé un nouveau projet "${formData.intitule}"`,
              link: `/tableaudebord/projet/pageprojet/${docRef.id}`
            },
            currentUser.uid
          );
          console.log("Notification créée avec succès pour admin:", adminDoc.id);
        } catch (error) {
          console.error("Erreur lors de la création de la notification pour admin:", adminDoc.id, error);
        }
      });

      await Promise.all(notificationPromises);
      console.log("Toutes les notifications ont été créées");

      alert("Projet créé avec succès !");
      window.location.href = "/tableaudebord/projet/gerer";
    } catch (error) {
      console.error("Erreur lors de la création du projet:", error);
      setError("Erreur lors de la création du projet. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Breadcrumb pageName="Créer un projet" />
      <div className="mx-auto mt-5 w-full max-w-3xl rounded-[10px]">
        <div className="mt-8 rounded-[20px] bg-white p-8 shadow-1 dark:bg-gray-dark dark:shadow-card">
          <div className="mb-8 text-center">
            <h3 className="mb-2 text-[28px] font-bold text-dark dark:text-white">
              Créer un projet
            </h3>
            <p className="text-base text-gray-600 dark:text-gray-400">
              Remplissez les informations pour créer un nouveau projet
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
                label="Intitulé du projet"
                variant="bordered"
                color="primary"
                placeholder="Entrer l'intitulé du projet"
                className="text-base"
                name="intitule"
                onChange={handleChange}
                required
                labelPlacement="outside"
                size="lg"
              />

              <Input
                type="text"
                label="Nom de la société"
                variant="bordered"
                color="primary"
                placeholder="Entrer le nom de la société"
                className="text-base"
                name="societe"
                onChange={handleChange}
                required
                labelPlacement="outside"
                size="lg"
              />

              <Input
                type="text"
                label="Nom du chef de projet"
                variant="bordered"
                color="primary"
                placeholder="Entrer le nom du chef de projet"
                className="text-base"
                name="chefDeProjet"
                onChange={handleChange}
                required
                labelPlacement="outside"
                size="lg"
              />

              <Select
                label="Domaine du projet"
                color="primary"
                variant="bordered"
                placeholder="Choisir le domaine de projet"
                selectionMode="single"
                className="text-base"
                onSelectionChange={handleSelectChange}
                labelPlacement="outside"
                size="lg"
              >
                {domaines.map((domaine) => (
                  <SelectItem key={domaine.key} value={domaine.label}>
                    {domaine.label}
                  </SelectItem>
                ))}
              </Select>

              <div className="mt-8 text-center">
                <Button
                  color="primary"
                  className="h-12 w-full max-w-md text-base font-medium"
                  variant="solid"
                  size="lg"
                  onClick={handleSubmit}
                  isDisabled={loading}
                >
                  {loading ? "Création en cours..." : "Créer le projet"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Tous les champs sont obligatoires pour créer un projet
          </p>
        </div>
      </div>
    </>
  );
};

export default CreerProjet;
