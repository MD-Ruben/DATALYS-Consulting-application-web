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

      if (
        !formData.intitule ||
        !formData.societe ||
        !formData.chefDeProjet ||
        formData.domaine.length === 0
      ) {
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
        query(collection(db, "users"), where("isAdmin", "==", true)),
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
              link: `/tableaudebord/projet/pageprojet/${docRef.id}`,
            },
            currentUser.uid,
          );
          console.log(
            "Notification créée avec succès pour admin:",
            adminDoc.id,
          );
        } catch (error) {
          console.error(
            "Erreur lors de la création de la notification pour admin:",
            adminDoc.id,
            error,
          );
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
      <Breadcrumb pageName="Ajouter un projet" />
      <div className="mt-5 w-full max-w-full rounded-[10px]">
        <div className="mt-8 rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
          <div className="w-full max-w-full p-2">
            <h3 className="pt-2 text-[22px] font-medium text-dark dark:text-white">
              Ajouter un projet
            </h3>
          </div>
          <div className="mt-4 rounded-lg shadow-sm">
            <div className="grid grid-cols-2 gap-4 px-2 py-6 md:py-4">
              <Input
                type="text"
                label="Intitulé du projet"
                variant="bordered"
                color="primary"
                placeholder="Entrer l'intitulé du projet"
                className="text-sm font-medium md:text-base"
                name="intitule"
                onChange={handleChange}
                required
              />
              <Input
                type="text"
                label="Nom de la société"
                variant="bordered"
                color="primary"
                placeholder="Entrer le nom de la société"
                className="text-sm font-medium md:text-base"
                name="societe"
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4 px-2 py-6 md:py-4">
              <Input
                type="text"
                label="Nom du chef de projet"
                variant="bordered"
                color="primary"
                placeholder="Entrer le nom du chef de projet"
                className="text-sm font-medium md:text-base"
                name="chefDeProjet"
                onChange={handleChange}
                required
              />
              <Select
                label="Domaine du projet"
                color="primary"
                variant="bordered"
                placeholder="Choisir le domaine de projet"
                selectionMode="single"
                className="text-sm font-medium md:text-base"
                onSelectionChange={handleSelectChange}
              >
                {domaines.map((domaine) => (
                  <SelectItem key={domaine.key} value={domaine.label}>
                    {domaine.label}
                  </SelectItem>
                ))}
              </Select>
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

export default CreerProjet;
