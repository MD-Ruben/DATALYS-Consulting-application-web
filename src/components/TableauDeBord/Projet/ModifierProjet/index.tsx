"use client";
import React, { useEffect, useState } from "react";
import { db } from "@/firebase/firebaseConfig";
import { doc, getDoc, updateDoc, getDocs, query, collection, where } from "firebase/firestore";
import { Input, Select, SelectItem } from "@nextui-org/react";
import { Button } from "@nextui-org/button";
import Breadcrumb from "@/components/TableauDeBord/Breadcrumbs/Breadcrumb";
import { domaines } from "../GererProjet/domaineData";
import { createNotification } from "@/firebase/firebaseConfig";
import { getAuth } from "firebase/auth";

interface ProjectData {
  intitule: string;
  societe: string;
  chefDeProjet: string;
  domaine: string[];
  createdAt: Date;
}

interface ModifierProjetProps {
  id: string;
}

const ModifierProjet: React.FC<ModifierProjetProps> = ({ id }) => {
  const [projectData, setProjectData] = useState<ProjectData>({
    intitule: "",
    societe: "",
    chefDeProjet: "",
    domaine: [],
    createdAt: new Date(),
  });

  useEffect(() => {
    const fetchProject = async () => {
      if (id) {
        try {
          const docRef = doc(db, "projects", id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProjectData({
              intitule: data.intitule || "",
              societe: data.societe || "",
              chefDeProjet: data.chefDeProjet || "",
              domaine: data.domaine || [],
              createdAt: data.createdAt.toDate(),
            });
          } else {
            console.log("Projet non trouvé");
          }
        } catch (error) {
          console.error("Erreur lors de la récupération du projet:", error);
        }
      }
    };
    fetchProject();
  }, [id]);

  const handleUpdate = async () => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        setError("Utilisateur non connecté");
        return;
      }

      if (!id) return;
      
      const docRef = doc(db, "projects", id);
      const updateData = {
        intitule: projectData.intitule,
        societe: projectData.societe,
        chefDeProjet: projectData.chefDeProjet,
        domaine: projectData.domaine,
      };

      await updateDoc(docRef, updateData);
      console.log("Projet mis à jour avec succès");

      // Notifier les administrateurs
      const adminsSnapshot = await getDocs(
        query(collection(db, "users"), where("isAdmin", "==", true))
      );

      adminsSnapshot.docs.forEach(async (adminDoc) => {
        await createNotification(
          adminDoc.id,
          {
            title: "Projet modifié",
            body: `a modifié le projet "${projectData.intitule}"`,
            link: `/tableaudebord/projet/pageprojet/${id}`
          },
          currentUser.uid
        );
      });

      // Notifier l'utilisateur lui-même s'il n'est pas admin
      if (!isUserAdmin) {
        await createNotification(
          currentUser.uid,
          {
            title: "Projet modifié",
            body: `modifié le projet "${projectData.intitule}"`,
            link: `/tableaudebord/projet/pageprojet/${id}`
          },
          currentUser.uid
        );
      }

      window.location.href = "/tableaudebord/projet/gerer";
    } catch (error) {
      console.error("Erreur lors de la mise à jour du projet:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProjectData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <>
      <Breadcrumb pageName="Modifier le projet" />
      <div className="mt-5 w-full max-w-full rounded-[10px]">
        <div className="mt-8 rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
          <div className="w-full max-w-full p-2">
            <h3 className="pt-2 text-[22px] font-medium text-dark dark:text-white">
              Modifier le projet
            </h3>
          </div>
          <div className="mt-4 rounded-lg shadow-sm">
            <div className="grid grid-cols-2 gap-4 px-2 py-6 md:py-4">
              <Input
                type="text"
                label="Intitulé du projet"
                variant="bordered"
                color="primary"
                name="intitule"
                value={projectData.intitule}
                onChange={handleChange}
                className="text-sm font-medium md:text-base"
              />
              <Input
                type="text"
                label="Nom de la société"
                variant="bordered"
                color="primary"
                name="societe"
                value={projectData.societe}
                onChange={handleChange}
                className="text-sm font-medium md:text-base"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 px-2 py-6 md:py-4">
              <Input
                type="text"
                label="Nom du chef de projet"
                variant="bordered"
                color="primary"
                name="chefDeProjet"
                value={projectData.chefDeProjet}
                onChange={handleChange}
                className="text-sm font-medium md:text-base"
              />
              <Select
                label="Domaine du projet"
                variant="bordered"
                color="primary"
                selectionMode="multiple"
                selectedKeys={new Set(projectData.domaine)}
                onSelectionChange={(keys) => {
                  const selectedDomaines = Array.from(keys) as string[];
                  setProjectData(prev => ({ ...prev, domaine: selectedDomaines }));
                }}
                className="text-sm font-medium md:text-base"
              >
                {domaines.map((domaine) => (
                  <SelectItem key={domaine.key} value={domaine.key}>
                    {domaine.label}
                  </SelectItem>
                ))}
              </Select>
            </div>
            <div className="flex justify-center px-2 py-2">
              <Button
                color="primary"
                className="w-64 flex-none"
                variant="solid"
                size="md"
                onPress={handleUpdate}
              >
                Modifier
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ModifierProjet;
