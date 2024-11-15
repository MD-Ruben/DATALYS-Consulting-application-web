"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Pagination,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import { getAuth } from "firebase/auth";
import Breadcrumb from "@/components/TableauDeBord/Breadcrumbs/Breadcrumb";
import { db } from "@/firebase/firebaseConfig";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
  query,
  where,
} from "firebase/firestore";

interface Project {
  id: string;
  chefDeProjet: string;
  societe: string;
  intitule: string;
  domaine: string[];
  createdAt: Date;
  authorizedUsers?: string[];
}

interface User {
  id: string;
  isAdmin: boolean;
}

const GestionProjet = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [projectsPerPage] = useState(5);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [sortKey, setSortKey] = useState<keyof Project>("intitule");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const fetchUserData = async () => {
    const auth = getAuth();
    const firebaseUser = auth.currentUser;

    if (!firebaseUser) {
      console.error("Aucun utilisateur connecté");
      return null;
    }

    try {
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("User data fetched:", userData);
        return {
          id: firebaseUser.uid,
          isAdmin: userData.isAdmin || false,
        };
      }
      return null;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des données utilisateur:",
        error,
      );
      return null;
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      const userData = await fetchUserData();
      if (userData) {
        setCurrentUser(userData);
        await fetchProjects(userData);
      }
    };

    initializeData();
  }, []);

  const fetchProjects = async (user: User) => {
    try {
      console.log("Fetching projects with user:", user);
      const querySnapshot = await getDocs(collection(db, "projects"));
      const projectList = querySnapshot.docs
        .map((doc) => {
          const projectData = doc.data();

          // Vérification des autorisations
          if (!projectData.authorizedUsers && !user.isAdmin) {
            console.log(
              `Project ${doc.id} skipped: no authorizedUsers field and user is not admin`,
            );
            return null;
          }

          const isAuthorized =
            user.isAdmin ||
            (projectData.authorizedUsers &&
              Array.isArray(projectData.authorizedUsers) &&
              projectData.authorizedUsers.includes(user.id));

          console.log(`Project ${doc.id} authorization check:`, {
            isAdmin: user.isAdmin,
            hasAuthorizedUsers: !!projectData.authorizedUsers,
            isUserAuthorized: projectData.authorizedUsers?.includes(user.id),
            finalDecision: isAuthorized,
          });

          return isAuthorized
            ? ({
                id: doc.id,
                ...projectData,
                createdAt: projectData.createdAt.toDate(),
              } as Project)
            : null;
        })
        .filter((project): project is Project => project !== null);

      console.log("Projets filtrés et récupérés:", projectList);
      setProjects(projectList);
      setFilteredProjects(projectList);
    } catch (error) {
      console.error("Erreur lors de la récupération des projets :", error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      const filtered = projects.filter(
        (project) =>
          project.intitule.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.chefDeProjet
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          project.societe.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredProjects(filtered);
    }
  }, [searchTerm, projects, currentUser]);

  const handleSort = (key: keyof Project) => {
    setSortKey(key);
    const sortedProjects = [...filteredProjects].sort((a, b) => {
      if (key === "createdAt") {
        return sortOrder === "asc"
          ? a.createdAt.getTime() - b.createdAt.getTime()
          : b.createdAt.getTime() - a.createdAt.getTime();
      }
      if (key === "domaine") {
        const aDomaine = a.domaine.join(", ");
        const bDomaine = b.domaine.join(", ");
        return sortOrder === "asc"
          ? aDomaine.localeCompare(bDomaine)
          : bDomaine.localeCompare(aDomaine);
      }
      return sortOrder === "asc"
        ? a[key].localeCompare(b[key])
        : b[key].localeCompare(a[key]);
    });
    setFilteredProjects(sortedProjects);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = filteredProjects.slice(
    indexOfFirstProject,
    indexOfLastProject,
  );

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleEdit = (projectId: string) => {
    console.log(`Redirection pour la modification du projet ID: ${projectId}`);
    window.location.href = `/tableaudebord/projet/modifier/${projectId}`;
  };

  const handleDelete = async () => {
    if (projectToDelete && currentUser) {
      try {
        const projectDoc = await getDoc(doc(db, "projects", projectToDelete));
        const projectData = projectDoc.data();

        // Vérification des autorisations avant la suppression
        const isAuthorized =
          currentUser.isAdmin ||
          (projectData?.authorizedUsers &&
            projectData.authorizedUsers.includes(currentUser.id));

        if (!isAuthorized) {
          console.error("Non autorisé à supprimer ce projet");
          onClose();
          return;
        }

        // 1. Supprimer tous les fichiers associés au projet
        const filesRef = collection(db, "files");
        const filesQuery = query(
          filesRef,
          where("projectId", "==", projectToDelete),
        );
        const filesSnapshot = await getDocs(filesQuery);

        console.log(`Suppression de ${filesSnapshot.size} fichiers...`);
        const filesDeletions = filesSnapshot.docs.map((fileDoc) =>
          deleteDoc(doc(db, "files", fileDoc.id)),
        );
        await Promise.all(filesDeletions);

        // 2. Supprimer tous les dossiers associés au projet
        const foldersRef = collection(db, "folders");
        const foldersQuery = query(
          foldersRef,
          where("projectId", "==", projectToDelete),
        );
        const foldersSnapshot = await getDocs(foldersQuery);

        console.log(`Suppression de ${foldersSnapshot.size} dossiers...`);
        const foldersDeletions = foldersSnapshot.docs.map((folderDoc) =>
          deleteDoc(doc(db, "folders", folderDoc.id)),
        );
        await Promise.all(foldersDeletions);

        // 3. Supprimer le projet
        console.log(`Suppression du projet ${projectToDelete}...`);
        await deleteDoc(doc(db, "projects", projectToDelete));

        // 4. Mettre à jour l'interface
        setFilteredProjects(
          filteredProjects.filter((project) => project.id !== projectToDelete),
        );
        setProjects(
          projects.filter((project) => project.id !== projectToDelete),
        );

        console.log("Suppression complète terminée avec succès");
        onClose();
        setProjectToDelete(null);
      } catch (error) {
        console.error(
          "Erreur lors de la suppression du projet et de ses données :",
          error,
        );
      }
    }
  };

  const handleView = (projectId: string) => {
    console.log(`Redirection pour voir le projet ID: ${projectId}`);
    window.location.href = `/tableaudebord/projet/pageprojet/${projectId}`;
  };

  return (
    <>
      <Breadcrumb pageName="Gestion de projet" />
      <div className="mt-5 w-full max-w-full rounded-[10px]">
        <div className="mt-8 rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
          <div className="w-full max-w-full p-2">
            <div className="flex w-full items-center justify-between">
              <h3 className="pt-2 text-[22px] font-medium text-dark dark:text-white">
                Gestion de projet
              </h3>
              <Input
                type="text"
                placeholder="Rechercher un projet"
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </div>
          <div className="mt-4 rounded-lg border shadow-sm">
            <Table
              aria-label="Gestion de projet"
              className="h-full w-full overflow-y-auto scrollbar-hide"
            >
              <TableHeader>
                <TableColumn
                  onClick={() => handleSort("intitule")}
                  className="cursor-pointer"
                >
                  Intitulé{" "}
                  {sortKey === "intitule" && (sortOrder === "asc" ? "↑" : "↓")}
                </TableColumn>
                <TableColumn
                  onClick={() => handleSort("chefDeProjet")}
                  className="cursor-pointer"
                >
                  Chef de projet{" "}
                  {sortKey === "chefDeProjet" &&
                    (sortOrder === "asc" ? "↑" : "↓")}
                </TableColumn>
                <TableColumn
                  onClick={() => handleSort("societe")}
                  className="cursor-pointer"
                >
                  Société{" "}
                  {sortKey === "societe" && (sortOrder === "asc" ? "↑" : "↓")}
                </TableColumn>
                <TableColumn
                  onClick={() => handleSort("domaine")}
                  className="cursor-pointer"
                >
                  Domaine{" "}
                  {sortKey === "domaine" && (sortOrder === "asc" ? "↑" : "↓")}
                </TableColumn>
                <TableColumn
                  onClick={() => handleSort("createdAt")}
                  className="cursor-pointer"
                >
                  Date de création{" "}
                  {sortKey === "createdAt" && (sortOrder === "asc" ? "↑" : "↓")}
                </TableColumn>
                <TableColumn>Action</TableColumn>
              </TableHeader>
              <TableBody>
                {currentProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>{project.intitule}</TableCell>
                    <TableCell>{project.chefDeProjet}</TableCell>
                    <TableCell>{project.societe}</TableCell>
                    <TableCell>{project.domaine.join(", ")}</TableCell>
                    <TableCell>
                      {project.createdAt.toLocaleDateString()}
                    </TableCell>
                    <TableCell className="flex items-center gap-1">
                      <Button
                        onClick={() => handleView(project.id)}
                        color="success"
                        size="sm"
                      >
                        Voir
                      </Button>
                      {currentUser?.isAdmin && (
                        <>
                          <Button
                            onClick={() => handleEdit(project.id)}
                            color="primary"
                            size="sm"
                          >
                            Modifier
                          </Button>
                          <Button
                            onClick={() => {
                              setProjectToDelete(project.id);
                              onOpen();
                            }}
                            color="danger"
                            size="sm"
                          >
                            Supprimer
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination
              total={Math.ceil(filteredProjects.length / projectsPerPage)}
              initialPage={1}
              onChange={(page) => paginate(page)}
              className="flex items-center justify-center py-6"
            />
          </div>
        </div>
      </div>

      {/* Modal pour confirmer la suppression */}
      <Modal isOpen={isOpen} onOpenChange={onClose} placement="top-center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Confirmation de suppression
              </ModalHeader>
              <ModalBody>
                <p>
                  Êtes-vous sûr de vouloir supprimer ce projet ? Cette action
                  est irréversible.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={handleDelete}>
                  Supprimer
                </Button>
                <Button color="primary" onPress={onClose}>
                  Annuler
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default GestionProjet;
