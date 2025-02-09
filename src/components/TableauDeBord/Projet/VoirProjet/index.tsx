"use client";

import React, { useEffect, useState, useContext } from "react";
import {
  Chip,
  Button,
  Input,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  CheckboxGroup,
} from "@nextui-org/react";
import Breadcrumb from "@/components/TableauDeBord/Breadcrumbs/Breadcrumb";
import { CustomCheckbox } from "./CustomCheckbox";
import {
  collection,
  getDocs,
  Timestamp,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import CreateFolderModal from "@/components/TableauDeBord/Projet/VoirProjet/Folder/CreateFolderModal";
import FolderItemSmall from "@/components/TableauDeBord/Projet/VoirProjet/Folder/FolderItemSmall";
import UploadFileModal from "@/components/TableauDeBord/Projet/VoirProjet/File/UploadFileModal";
import FileItem from "@/components/TableauDeBord/Projet/VoirProjet/File/FileItem";
import FileItemXL from "@/components/TableauDeBord/Projet/VoirProjet/File/FileItemXL";
import { ParentFolderIdContext } from "@/context/ParentFolderIdContext";
import FolderItem from "@/components/TableauDeBord/Projet/VoirProjet/Folder/FolderItem";
import FileList from "@/components/TableauDeBord/Projet/VoirProjet/File/FileList";
import Image from "next/image";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "@/firebase/firebaseConfig"; 

// Définir les interfaces pour Folder et File
interface Folder {
  id: string;
  name: string;
  parentFolderId: string | null;
  projectId: string;
  type: 'folder';
  isPrivate?: boolean;
}

interface File {
  id: string;
  name: string;
  type: string;
  size: number;
  modifiedAt: number;
  imageUrl: string;
  parentFolderId: string | null;
  projectId: string;
  isPrivate?: boolean;
}

interface Project {
  intitule: string;
  societe: string;
  chefDeProjet: string;
  domaine: string[] | string;
  createdAt: any; // Utilisez Timestamp de Firestore
  authorizedUsers?: string[];
}

interface User {
  id: string;
  name?: string;
  username?: string;
  url?: string;
  role?: string;
}

// Ajoutez une fonction pour récupérer les utilisateurs
const fetchUsers = async () => {
  const usersSnapshot = await getDocs(collection(db, "users"));
  return usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

const VoirProjet: React.FC<{ id: string }> = ({ id }) => {
  // Modal pour ajouter un client
  const [groupSelected, setGroupSelected] = React.useState<string[]>([]);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const modal = useDisclosure();
  const [size, setSize] = React.useState<"xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "full">("2xl");
  const sizes = "2xl";

  const handleOpen = (newSize: typeof size) => {
    setSize(newSize);
    onOpen();
  };
  // Utilisez directement l'ID passé en prop
  const projectId = id;

  const [project, setProject] = useState<Project | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]); // Stocker les dossiers
  const [files, setFiles] = useState<File[]>([]); // Stocker les fichiers
  const [loading, setLoading] = useState(true); // Pour gérer l'état de chargement
  const [showUploadModal, setShowUploadModal] = useState(false); // State pour afficher la modal d'upload
  const { parentFolderId, setParentFolderId } = useContext(
    ParentFolderIdContext,
  ) || { parentFolderId: null, setParentFolderId: () => {} };
  const [isGridView, setIsGridView] = useState(false);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]); // Stocker les utilisateurs
  const [authorizedUsers, setAuthorizedUsers] = useState<string[]>([]); // Stocker les utilisateurs autorisés
  const [projectData, setProjectData] = useState<Project | null>(null);
  const [hasAccess, setHasAccess] = useState(false);

  // Ajoutez cette fonction pour vérifier si l'utilisateur est admin
  const [isUserAdmin, setIsUserAdmin] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [nonAdminUsers, setNonAdminUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  // Fonction pour récupérer les utilisateurs non-admin
  const fetchNonAdminUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersList = usersSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          name: `${doc.data().firstName} ${doc.data().lastName}`,
          username: doc.data().username,
          profileImage: doc.data().profileImage || "/images/user.png",
        }))
        .filter(user => !user.isAdmin); // Ne garder que les utilisateurs non-admin

      setNonAdminUsers(usersList);
      setFilteredUsers(usersList);
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
    }
  };

  // Effet pour charger les utilisateurs non-admin
  useEffect(() => {
    fetchNonAdminUsers();
  }, []);

  // Effet pour filtrer les utilisateurs selon la recherche
  useEffect(() => {
    const filtered = nonAdminUsers.filter(user => 
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchQuery, nonAdminUsers]);

  useEffect(() => {
    const checkUserAdmin = async () => {
      const auth = getAuth(app);
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setIsUserAdmin(userDoc.data().isAdmin || false);
        }
      }
    };
    checkUserAdmin();
  }, []);

  useEffect(() => {
    const fetchProjectData = async () => {
      const auth = getAuth(app);
      const user = auth.currentUser;
      if (user) {
        console.log("Utilisateur authentifié:", user.uid);
        const db = getFirestore(app);
        const userDoc = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userDoc);
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          console.log("Données utilisateur récupérées:", userData);
          console.log("isAdmin:", userData.isAdmin);

          const projectDoc = doc(db, "projects", id);
          const projectSnapshot = await getDoc(projectDoc);
          if (projectSnapshot.exists()) {
            const projectData = projectSnapshot.data() as Project;
            console.log("Données du projet récupérées:", projectData);

            if (
              userData.isAdmin || 
              (projectData.authorizedUsers && projectData.authorizedUsers.includes(user.uid))
            ) {
              setHasAccess(true);
              setProjectData(projectData);
            } else {
              console.log("Accès refusé : l'utilisateur n'a pas les permissions nécessaires.");
            }
          } else {
            console.log("Aucune donnée trouvée pour ce projet.");
          }
        } else {
          console.log("Aucune donnée trouvée pour cet utilisateur.");
        }
      } else {
        console.log("Aucun utilisateur authentifié.");
      }
      setLoading(false);
    };

    fetchProjectData();
  }, [id]);

  useEffect(() => {
    const fetchProjectAndUsers = async () => {
      const projectDoc = await getDoc(doc(db, "projects", projectId));
      if (projectDoc.exists()) {
        const projectData = projectDoc.data() as Project;
        setProject(projectData);
        setAuthorizedUsers(projectData.authorizedUsers || []);
      }
      const usersList = await fetchUsers();
      setUsers(usersList);
    };

    fetchProjectAndUsers();
  }, [projectId]);

  const handleValidate = async () => {
    try {
      console.log("Utilisateurs sélectionnés pour l'ajout :", groupSelected);
      // Mettre à jour authorizedUsers dans le document du projet
      await updateDoc(doc(db, "projects", projectId), {
        authorizedUsers: groupSelected,
      });

      // Pour chaque utilisateur sélectionné, mettre à jour leur tableau authorizedProjects
      groupSelected.forEach(async (userId) => {
        const userDocRef = doc(db, "users", userId);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const authorizedProjects = userData.authorizedProjects || [];
          if (!authorizedProjects.includes(projectId)) {
            authorizedProjects.push(projectId);
            await updateDoc(userDocRef, { authorizedProjects });
          }
        }
      });

      setAuthorizedUsers(groupSelected);
      modal.onClose();
      console.log("Utilisateurs autorisés mis à jour avec succès.");
    } catch (error) {
      console.error("Erreur lors de la mise à jour des utilisateurs autorisés :", error);
    }
  };

  // Récupérer l'ID du projet à partir de l'URL
  const getProjectIdFromUrl = () => {
    const path = window.location.pathname;
    const segments = path.split("/");
    return segments[segments.length - 1];
  };

  useEffect(() => {
    if (parentFolderId === null) {
      setParentFolderId(projectId);
    }
    fetchFoldersAndFiles();
  }, [projectId, parentFolderId]);

  // Récupérer les informations du projet depuis Firestore
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const docRef = doc(db, "projects", projectId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProject(docSnap.data() as Project);
        } else {
          console.error("Aucun projet trouvé !");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du projet :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  // Récupérer les dossiers et fichiers depuis Firestore
  const fetchFoldersAndFiles = async () => {
    try {
      const auth = getAuth(app);
      const user = auth.currentUser;
      const userDoc = await getDoc(doc(db, "users", user?.uid));
      const isUserAdmin = userDoc.exists() ? userDoc.data().isAdmin : false;

      // Récupérer les dossiers du projet actuel
      const folderSnapshot = await getDocs(
        query(collection(db, "Folders"), 
          where("projectId", "==", projectId),
          where("parentFolderId", "==", parentFolderId) // Ne récupérer que les dossiers du niveau actuel
        )
      );

      // Filtrer les dossiers
      const folderList = folderSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((folder) => {
          // Si l'utilisateur est admin, il voit tout
          if (isUserAdmin) return true;
          
          // Si le dossier est privé et l'utilisateur n'est pas admin, il ne le voit pas
          if (folder.isPrivate) return false;
          
          return true;
        });

      // Récupérer les fichiers du projet actuel
      const fileSnapshot = await getDocs(
        query(collection(db, "files"), 
          where("projectId", "==", projectId),
          where("parentFolderId", "==", parentFolderId) // Ne récupérer que les fichiers du niveau actuel
        )
      );

      // Filtrer les fichiers
      const fileList = fileSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((file) => {
          // Si l'utilisateur est admin, il voit tout
          if (isUserAdmin) return true;
          
          // Si le fichier est privé et l'utilisateur n'est pas admin, il ne le voit pas
          if (file.isPrivate) return false;
          
          return true;
        });

      setFolders(folderList);
      setFiles(fileList);
    } catch (error) {
      console.error("Erreur lors de la récupération des dossiers et fichiers:", error);
    }
  };

  const handleFolderClick = async (folderId: string, folderName: string) => {
    try {
      // Vérifier si le dossier existe et est accessible
      const folderDoc = await getDoc(doc(db, "Folders", folderId));
      if (!folderDoc.exists()) {
        console.error("Dossier non trouvé");
        return;
      }

      const folderData = folderDoc.data();
      
      // Vérifier que le dossier appartient bien au projet actuel
      if (folderData.projectId !== projectId) {
        console.error("Ce dossier n'appartient pas au projet actuel");
        return;
      }

      // Mettre à jour le chemin et le dossier parent
      setParentFolderId(folderId);
      setCurrentPath([...currentPath, folderName]);
      
      // Rafraîchir la liste des dossiers et fichiers pour le nouveau dossier parent
      await fetchFoldersAndFiles();
    } catch (error) {
      console.error("Erreur lors de l'accès au dossier:", error);
    }
  };

  const handleBackClick = async () => {
    if (currentPath.length > 0) {
      try {
        const newPath = [...currentPath];
        newPath.pop();
        setCurrentPath(newPath);

        // Si on revient à la racine
        if (newPath.length === 0) {
          setParentFolderId(projectId);
        } else {
          // Sinon, on récupère l'ID du dossier parent
          const parentFolderSnapshot = await getDocs(
            query(collection(db, "Folders"),
              where("projectId", "==", projectId),
              where("name", "==", newPath[newPath.length - 1])
            )
          );

          if (!parentFolderSnapshot.empty) {
            setParentFolderId(parentFolderSnapshot.docs[0].id);
          }
        }

        // Rafraîchir la liste des dossiers et fichiers
        await fetchFoldersAndFiles();
      } catch (error) {
        console.error("Erreur lors du retour au dossier parent:", error);
      }
    }
  };

  const handleFileClick = (fileId: string) => {
    // Logique pour gérer le clic sur un fichier
    console.log("File clicked:", fileId);
  };

  const renderBreadcrumbs = () => {
    return (
      <div className="mb-4 flex items-center text-sm text-gray-500">
        <span
          className="cursor-pointer hover:text-gray-700"
          onClick={() => handleFolderClick(projectId, "Root")}
        >
          Root
        </span>
        {currentPath.map((folder, index) => (
          <React.Fragment key={index}>
            <span className="mx-2">/</span>
            <span
              className="cursor-pointer hover:text-gray-700"
              onClick={() => handleFolderClick(folders[index].id, folder)}
            >
              {folder}
            </span>
          </React.Fragment>
        ))}
      </div>
    );
  };

  // Ajoutez cette fonction pour rafraîchir les dossiers et fichiers
  const handleFolderUpdated = async () => {
    console.log("Rafraîchissement des dossiers et fichiers...");
    await fetchFoldersAndFiles();
  };

  if (loading) {
    return <p>Chargement des informations du projet...</p>;
  }

  if (!hasAccess) {
    return <p>Vous n'avez pas les accès pour consulter ce projet.</p>;
  }

  if (!projectData) {
    return <p>Projet non trouvé</p>;
  }

  return (
    <>
      <Breadcrumb pageName="Information du projet" />
      <div className="mt-5 overflow-hidden rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="relative flex h-35 bg-[#46adb6] md:h-65">
          <div className="absolute bottom-0 right-0">
            {isUserAdmin && (
              <Button
                onClick={modal.onOpen}
                variant="solid"
                color="primary"
                className="px-2 py-2 bg-white text-primary md:px-4 md:py-4 m-3"
                onPress={() => handleOpen(size)}
              >
                <Image
                  src="/images/icon/client.svg"
                  className="bg-primary rounded-full"
                  width={15}
                  height={15}
                  alt=""
                />
                Ajouter un client{" "}
              </Button>
            )}
          </div>
          <div className="absolute left-0 right-0 top-0 md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2">
            <h3 className="text-center text-xl font-light text-white md:text-4xl">
              Informations sur le projet
            </h3>
          </div>
        </div>
        <div className="px-4 pb-6 text-center lg:pb-8 xl:pb-11.5">
          <div className="relative z-30 mx-auto -mt-22 h-30 w-full max-w-30 rounded-full bg-white/20 p-1 backdrop-blur sm:h-44 sm:max-w-[176px] sm:p-3">
            <div className="relative drop-shadow-2">
              <Image
                src="/images/logo-datalys-rvb.jpg"
                width={160}
                height={160}
                className="overflow-hidden rounded-full"
                alt="profile"
              />
            </div>
          </div>
          <div className="mt-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Intitulé */}
              <div className="rounded-xl bg-gray-50 p-6 dark:bg-gray-800">
                <h4 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Intitulé du projet
                </h4>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {projectData.intitule}
                </p>
              </div>

              {/* Entreprise */}
              <div className="rounded-xl bg-gray-50 p-6 dark:bg-gray-800">
                <h4 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Entreprise
                </h4>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {projectData.societe}
                </p>
              </div>

              {/* Chef de projet */}
              <div className="rounded-xl bg-gray-50 p-6 dark:bg-gray-800">
                <h4 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Chef de projet
                </h4>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {projectData.chefDeProjet}
                </p>
              </div>

              {/* Domaine */}
              <div className="rounded-xl bg-gray-50 p-6 dark:bg-gray-800">
                <h4 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Domaine du projet
                </h4>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {Array.isArray(projectData.domaine)
                    ? projectData.domaine.join(", ")
                    : projectData.domaine || "Non spécifié"}
                </p>
              </div>

              {/* Date de création */}
              <div className="rounded-xl bg-gray-50 p-6 dark:bg-gray-800">
                <h4 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Date de création
                </h4>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {projectData.createdAt.toDate().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Explorateur de fichiers */}
      <div className="mt-5 w-full max-w-full rounded-[10px]">
        <div className="mt-8 rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
          <div className="max-w-screen w-full p-2">
            <div className="flex w-full flex-col items-center justify-between gap-6 md:flex-row">
              <h3 className="w-full pt-2 text-[22px] font-medium text-dark dark:text-white md:text-[27px]">
                Explorateur de fichiers
              </h3>
              <div className="mb-2 flex items-center gap-1 md:gap-2">
                {isUserAdmin && (
                  <>
                    <CreateFolderModal
                      onFolderCreated={fetchFoldersAndFiles}
                      parentFolderId={parentFolderId}
                      projectId={projectId}
                    />
                    <Button
                      size="md"
                      color="primary"
                      onPress={() => setIsUploadModalOpen(true)}
                    >
                      Charger le fichier
                    </Button>
                  </>
                )}
                <Button
                  size="md"
                  color="secondary"
                  onPress={() => setIsGridView(!isGridView)}
                >
                  {isGridView ? "Vue en liste" : "Vue en grille"}
                </Button>
                {currentPath.length > 0 && (
                  <Button size="md" color="success" onPress={handleBackClick}>
                    Retour
                  </Button>
                )}
              </div>
            </div>

            {renderBreadcrumbs()}

            <div className="file-folder-list mt-6">
              {isGridView ? (
                <div className="flex flex-wrap">
                  {folders.map((folder) => (
                    <FolderItem
                      key={folder.id}
                      folder={folder}
                      onClick={() => handleFolderClick(folder.id, folder.name)}
                      onFolderUpdated={handleFolderUpdated}
                    />
                  ))}
                  {files.map((file) => (
                    <FileItemXL
                      key={file.id}
                      file={file}
                      onFileClick={handleFileClick}
                    />
                  ))}
                </div>
              ) : (
                <>
                  {folders.length > 0 && (
                    <>
                      <h3 className="mb-4 text-lg font-medium text-dark dark:text-white">
                        Dossiers
                      </h3>
                      {folders.map((folder) => (
                        <FolderItemSmall
                          key={folder.id}
                          folder={folder}
                          onClick={() =>
                            handleFolderClick(folder.id, folder.name)
                          }
                          onFolderUpdated={handleFolderUpdated}
                        />
                      ))}
                    </>
                  )}
                  {files.length > 0 && (
                    <>
                      <h3 className="mt-4 text-lg font-medium text-dark dark:text-white">
                        Fichiers
                      </h3>
                      <FileList
                        files={files}
                        onFileDeleted={fetchFoldersAndFiles}
                      />
                    </>
                  )}
                  {folders.length === 0 && files.length === 0 && (
                    <p>Aucun dossier ou fichier trouvé dans ce répertoire.</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'upload */}
      <UploadFileModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onFileUploaded={fetchFoldersAndFiles}
        parentFolderId={parentFolderId}
        projectId={projectId}
      />
      {/* Modal pour valider un client */}
      <Modal
        size={size}
        isOpen={modal.isOpen}
        onClose={modal.onClose}
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        className="bg-white shadow-1 dark:bg-gray-dark dark:shadow-card"
      >
        <ModalContent>
          <ModalHeader className="text-[22px] font-medium text-dark dark:text-white">
            Sélectionner les clients
          </ModalHeader>
          <ModalBody>
            <Input
              type="text"
              placeholder="Rechercher un client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-4"
            />
            <CheckboxGroup
              label="Sélectionner les clients"
              value={groupSelected}
              onChange={setGroupSelected}
              classNames={{
                base: "w-full max-w-screen h-[250px] overflow-y-auto scrollbar-hide",
              }}
            >
              {filteredUsers.map((user) => (
                <CustomCheckbox
                  key={user.id}
                  value={user.id}
                  user={{
                    name: user.name,
                    username: user.username,
                    url: user.profileImage,
                    role: user.function,
                  }}
                  className={authorizedUsers.includes(user.id) ? "active-class" : ""}
                />
              ))}
            </CheckboxGroup>
            <p className="ml-1 mt-4 text-default-500">
              Sélectionné : {groupSelected.length} client(s)
            </p>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={modal.onClose}>
              Fermer
            </Button>
            <Button color="primary" onPress={handleValidate}>
              Valider
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default VoirProjet;