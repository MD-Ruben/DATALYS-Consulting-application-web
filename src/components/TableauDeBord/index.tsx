"use client";
import React, { useState, useEffect } from "react";
import {
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue,
} from "@nextui-org/react";
import Link from "next/link";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { getAuth } from "firebase/auth";

interface Project {
  id: string;
  intitule: string;
  societe: string;
  domaine: string[] | string;
  createdAt: Date;
}

interface File {
  id: string;
  name: string;
  projectId: string;
  projectName: string;
  createdAt: Date;
}

interface User {
  id: string;
  isAdmin: boolean;
}

const TableauDeBord: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
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
      console.error("Erreur lors de la récupération des données utilisateur:", error);
      return null;
    }
  };

  const fetchRecentProjects = async (user: User) => {
    try {
      console.log("Fetching recent projects...");
      console.log("Current user:", { id: user.id, isAdmin: user.isAdmin });
      
      const projectsRef = collection(db, "projects");
      const recentProjectsQuery = query(
        projectsRef,
        orderBy("createdAt", "desc"),
        limit(10),
      );
      const querySnapshot = await getDocs(recentProjectsQuery);

      const projectList = querySnapshot.docs
        .map((doc) => {
          const projectData = doc.data();
          console.log(`Project ${doc.id} data:`, {
            hasAuthorizedUsers: !!projectData.authorizedUsers,
            authorizedUsers: projectData.authorizedUsers || [],
          });

          if (!projectData.authorizedUsers && !user.isAdmin) {
            console.log(`Project ${doc.id} skipped: no authorizedUsers field and user is not admin`);
            return null;
          }

          const isAuthorized = user.isAdmin || 
            (projectData.authorizedUsers && 
             Array.isArray(projectData.authorizedUsers) && 
             projectData.authorizedUsers.includes(user.id));

          console.log(`Project ${doc.id} authorization check:`, {
            isAdmin: user.isAdmin,
            hasAuthorizedUsers: !!projectData.authorizedUsers,
            isUserAuthorized: projectData.authorizedUsers?.includes(user.id),
            finalDecision: isAuthorized
          });

          return isAuthorized ? {
            id: doc.id,
            ...projectData,
            createdAt: projectData.createdAt.toDate(),
          } as Project : null;
        })
        .filter((project) => project !== null);

      console.log("Projets filtrés et récupérés:", projectList);
      setProjects(projectList);
    } catch (error) {
      console.error("Erreur lors de la récupération des projets :", error);
    }
  };

  const fetchRecentFiles = async (user: User) => {
    try {
      console.log("Fetching recent files...");
      const filesRef = collection(db, "files");
      const recentFilesQuery = query(
        filesRef,
        orderBy("createdAt", "desc"),
        limit(10),
      );
      const querySnapshot = await getDocs(recentFilesQuery);

      const fileList = await Promise.all(
        querySnapshot.docs.map(async (fileDoc) => {
          const fileData = fileDoc.data();
          const projectDocRef = doc(db, "projects", fileData.projectId);
          const projectDocSnap = await getDoc(projectDocRef);
          
          if (!projectDocSnap.exists()) {
            console.log(`File ${fileDoc.id} skipped: project not found`);
            return null;
          }

          const projectData = projectDocSnap.data();
          console.log(`File ${fileDoc.id} project data:`, {
            projectId: fileData.projectId,
            hasAuthorizedUsers: !!projectData.authorizedUsers,
            authorizedUsers: projectData.authorizedUsers || [],
          });

          if (user.isAdmin) {
            let createdAtDate;
            if (
              fileData.createdAt &&
              typeof fileData.createdAt.toDate === "function"
            ) {
              createdAtDate = fileData.createdAt.toDate();
            } else if (fileData.createdAt instanceof Date) {
              createdAtDate = fileData.createdAt;
            } else if (typeof fileData.createdAt === "string") {
              createdAtDate = new Date(fileData.createdAt);
            } else {
              createdAtDate = new Date();
            }

            return {
              id: fileDoc.id,
              ...fileData,
              projectName: projectData.intitule,
              createdAt: createdAtDate,
            } as File;
          }

          if (!projectData.authorizedUsers) {
            console.log(`File ${fileDoc.id} skipped: no authorizedUsers field and user is not admin`);
            return null;
          }

          const isAuthorized = projectData.authorizedUsers && 
            Array.isArray(projectData.authorizedUsers) && 
            projectData.authorizedUsers.includes(user.id);

          console.log(`File ${fileDoc.id} authorization check:`, {
            isAdmin: user.isAdmin,
            hasAuthorizedUsers: !!projectData.authorizedUsers,
            isUserAuthorized: projectData.authorizedUsers?.includes(user.id),
            finalDecision: isAuthorized
          });

          if (!isAuthorized) {
            return null;
          }

          let createdAtDate;
          if (
            fileData.createdAt &&
            typeof fileData.createdAt.toDate === "function"
          ) {
            createdAtDate = fileData.createdAt.toDate();
          } else if (fileData.createdAt instanceof Date) {
            createdAtDate = fileData.createdAt;
          } else if (typeof fileData.createdAt === "string") {
            createdAtDate = new Date(fileData.createdAt);
          } else {
            createdAtDate = new Date();
          }

          return {
            id: fileDoc.id,
            ...fileData,
            projectName: projectData.intitule,
            createdAt: createdAtDate,
          } as File;
        }),
      );

      const filteredFileList = fileList.filter((file) => file !== null);
      console.log("Fichiers filtrés et récupérés:", filteredFileList);
      setFiles(filteredFileList);
    } catch (error) {
      console.error("Erreur lors de la récupération des fichiers :", error);
    }
  };

  const truncateFileName = (fileName: string, maxLength: number = 15) => {
    if (fileName.length <= maxLength) return fileName;
    return `${fileName.substring(0, maxLength)}...`;
  };

  useEffect(() => {
    const initializeData = async () => {
      const userData = await fetchUserData();
      if (userData) {
        setCurrentUser(userData);
        await Promise.all([
          fetchRecentProjects(userData),
          fetchRecentFiles(userData)
        ]);
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  if (loading) {
    return <p>Chargement des données récentes...</p>;
  }

  console.log("Rendu des tableaux avec:", {
    projects: projects.length,
    files: files.length,
  });

  const projectColumns = [
    { key: "intitule", label: "Intitulé" },
    { key: "societe", label: "Entreprise" },
    { key: "domaine", label: "Domaine" },
    { key: "action", label: "Action" },
  ];

  const fileColumns = [
    { key: "name", label: "Nom du fichier" },
    { key: "projectName", label: "Projet" },
    { key: "createdAt", label: "Date d'ajout" },
    { key: "action", label: "Action" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-2 2xl:gap-7.5">
      <div>
        <h4 className="mb-6 text-xl font-semibold text-dark dark:text-white">
          Projets récents
        </h4>
        <Table
          aria-label="Projets récents"
          className="h-[400px] w-full overflow-y-auto scrollbar-hide"
        >
          <TableHeader columns={projectColumns}>
            {(column) => (
              <TableColumn
                key={column.key}
                className="text-dark dark:text-white"
              >
                {column.label}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody items={projects}>
            {(project) => (
              <TableRow key={project.id}>
                {(columnKey) => (
                  <TableCell>
                    {columnKey === "action" ? (
                      <Button
                        as={Link}
                        href={`/tableaudebord/projet/pageprojet/${project.id}`}
                        color="primary"
                        size="sm"
                      >
                        Voir
                      </Button>
                    ) : (
                      getKeyValue(project, columnKey)
                    )}
                  </TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div>
        <h4 className="mb-6 text-xl font-semibold text-dark dark:text-white">
          Fichiers récents
        </h4>
        <Table
          aria-label="Fichiers récents"
          className="h-[400px] w-full overflow-y-auto scrollbar-hide"
        >
          <TableHeader columns={fileColumns}>
            {(column) => (
              <TableColumn
                key={column.key}
                className="text-dark dark:text-white"
              >
                {column.label}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody items={files}>
            {(file) => (
              <TableRow key={file.id}>
                {(columnKey) => (
                  <TableCell>
                    {columnKey === "name" ? (
                      <span title={file.name}>
                        {truncateFileName(file.name)}
                      </span>
                    ) : columnKey === "createdAt" ? (
                      file.createdAt.toLocaleDateString()
                    ) : columnKey === "action" ? (
                      <Button
                        as={Link}
                        href={`/tableaudebord/projet/pageprojet/${file.projectId}`}
                        color="primary"
                        size="sm"
                      >
                        Voir le projet
                      </Button>
                    ) : (
                      getKeyValue(file, columnKey)
                    )}
                  </TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TableauDeBord;
