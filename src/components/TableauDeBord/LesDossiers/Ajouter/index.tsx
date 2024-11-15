"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/TableauDeBord/Breadcrumbs/Breadcrumb";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/react";
import { db } from "@/firebase/firebaseConfig"; // Assurez-vous que Firestore est bien importé
import { collection, addDoc } from "firebase/firestore"; // Pour ajouter des documents dans Firestore

const AjouterProjet = () => {
  const [formData, setFormData] = useState({
    nom: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Enregistrer le projet dans Firestore
      const docRef = await addDoc(collection(db, "projects"), {
        nom: formData.nom,
      });

      console.log("Projet créé avec ID :", docRef.id);
      alert("Projet créé avec succès !");
    } catch (error: any) {
      console.error("Erreur lors de la création du projet :", error);
      setError("Erreur lors de la création du projet. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Breadcrumb pageName="Créer un projet" />
      <div className="mt-5 w-full max-w-5xl rounded-[10px]">
        <div className="mt-8 rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
          <div className="w-full max-w-full p-2">
            <h3 className="pt-2 text-[22px] font-medium text-dark dark:text-white">
              Créer un dossier
            </h3>
          </div>
          <div className="mt-4 rounded-lg shadow-sm">
            <div className="grid grid-cols-1 gap-2 px-2 py-6 md:py-4">
              <Input
                type="text"
                label="Nom du dossier"
                variant="bordered"
                color="primary"
                placeholder="Entrer le nom du dossier"
                className="text-sm font-medium md:text-base"
                name="nom"
                onChange={handleChange}
                required
              />
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

export default AjouterProjet;
