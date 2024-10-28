"use client";
import React, { useEffect, useState, useContext } from "react";
import { Chip, Button } from "@nextui-org/react";
import Breadcrumb from "@/components/TableauDeBord/Breadcrumbs/Breadcrumb";
import { CustomCheckbox } from "./CustomCheckbox";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/modal";
import { CheckboxGroup } from "@nextui-org/react";
import {
  collection,
  getDoc,
  getDocs,
  doc,
  Timestamp,
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

// Définir les interfaces pour Folder et File
interface Folder {
  id: string;
  parentFolderId: string | null;
  name: string;
  type: "folder";
  // Ajoutez d'autres propriétés si nécessaire
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
}

interface Project {
  intitule: string;
  societe: string;
  chefDeProjet: string;
  domaine: string[] | string;
  createdAt: Timestamp;
}

const VoirProjet: React.FC<{ id: string }> = ({ id }) => {
  // Modal pour ajouter un client
  const [groupSelected, setGroupSelected] = React.useState([]);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const modal = useDisclosure();
  const [size, setSize] = React.useState("2xl");
  const sizes = "2xl";

  const handleOpen = (size) => {
    setSize(size);
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
    console.log(
      "Fetching folders and files. parentFolderId:",
      parentFolderId,
      "projectId:",
      projectId,
    );
    try {
      const folderCollection = collection(db, "Folders");
      const fileCollection = collection(db, "files");

      const folderSnapshot = await getDocs(folderCollection);
      const fileSnapshot = await getDocs(fileCollection);

      console.log(
        "All folders before filtering:",
        folderSnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })),
      );
      console.log("parentFolderId used for filtering:", parentFolderId);

      const folderList = folderSnapshot.docs
        .map((doc) => ({ ...doc.data(), type: "folder", id: doc.id }) as Folder)
        .filter(
          (folder) =>
            folder.parentFolderId === parentFolderId &&
            folder.projectId === projectId,
        );

      const fileList = fileSnapshot.docs
        .map((doc) => ({ ...doc.data(), type: "file", id: doc.id }) as File)
        .filter(
          (file) =>
            file.parentFolderId === parentFolderId &&
            file.projectId === projectId,
        );

      console.log("Filtered folders:", folderList);
      console.log(
        "All files:",
        fileSnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })),
      );
      console.log("Filtered files:", fileList);

      setFolders(folderList);
      setFiles(fileList);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des dossiers et fichiers :",
        error,
      );
    }
  };

  const handleFolderClick = (folderId: string, folderName: string) => {
    setParentFolderId(folderId);
    setCurrentPath([...currentPath, folderName]);
  };

  const handleBackClick = () => {
    if (currentPath.length > 0) {
      const newPath = [...currentPath];
      newPath.pop();
      setCurrentPath(newPath);
      setParentFolderId(newPath.length === 0 ? projectId : parentFolderId);
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

  if (loading) {
    return <p>Chargement des informations du projet...</p>;
  }

  if (!project) {
    return <p>Projet non trouvé</p>;
  }

  return (
    <>
      <Breadcrumb pageName="Page de projet" />
      <div className="mt-5 w-full max-w-full rounded-[10px]">
        <div className="mt-8 rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
          <div className="w-full max-w-full p-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <h3 className="pt-2 text-xl font-medium text-dark dark:text-white md:text-[22px]">
                  Informations sur le projet
                </h3>
              </div>
              <div className="mt-2 flex items-center md:mt-0">
                <Button
                  onClick={modal.onOpen}
                  size="md"
                  variant="solid"
                  color="primary"
                  className="text-white"
                  onPress={() => handleOpen(size)}
                >
                  Ajouter un client{" "}
                  <Image
                    src="/images/icon/client.svg"
                    width={15}
                    height={15}
                    alt=""
                  />
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-4 rounded-lg px-2 py-6 shadow-sm md:py-4">
            <div className="w-full max-w-[720px]">
              <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
                <div className="mb-4 flex items-center gap-2">
                  <h1 className="text-[18px] font-normal text-dark dark:text-white">
                    Intitulé de projet:
                  </h1>
                  <Chip color="default" variant="bordered">
                    <span className="text-sm font-bold md:text-base">
                      {project.intitule}
                    </span>
                  </Chip>
                </div>
                <div className="mb-4 flex items-center gap-2">
                  <h1 className="text-[18px] font-normal text-dark dark:text-white">
                    Entreprise:
                  </h1>
                  <Chip color="default" variant="bordered">
                    <span className="text-sm font-bold md:text-base">
                      {project.societe}
                    </span>
                  </Chip>
                </div>
                <div className="mb-4 flex items-center gap-2">
                  <h1 className="text-[18px] font-normal text-dark dark:text-white">
                    Chef de projet:
                  </h1>
                  <Chip color="default" variant="bordered">
                    <span className="text-sm font-bold md:text-base">
                      {project.chefDeProjet}
                    </span>
                  </Chip>
                </div>
                <div className="mb-4 flex items-center gap-2">
                  <h1 className="text-[18px] font-normal text-dark dark:text-white">
                    Domaine du projet:
                  </h1>
                  <Chip color="default" variant="bordered">
                    <span className="text-sm font-bold md:text-base">
                      {Array.isArray(project.domaine)
                        ? project.domaine.join(", ")
                        : project.domaine || "Non spécifié"}
                    </span>
                  </Chip>
                </div>
                <div className="mb-4 flex items-center gap-2">
                  <h1 className="text-[18px] font-normal text-dark dark:text-white">
                    Date de création du projet:
                  </h1>
                  <Chip color="default" variant="bordered">
                    <span className="text-sm font-bold md:text-base">
                      {project.createdAt.toDate().toLocaleDateString()}
                    </span>
                  </Chip>
                </div>
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
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-[22px] font-medium text-dark dark:text-white md:text-[27px]">
                Tableau de validation
              </ModalHeader>
              <ModalBody>
                <div className="max-w-screen w-full gap-1">
                  <CheckboxGroup
                    label="Sélectionner les clients"
                    value={groupSelected}
                    onChange={setGroupSelected}
                    classNames={{
                      base: "w-full max-w-screen h-[250px] overflow-y-auto scrollbar-hide",
                    }}
                  >
                    <CustomCheckbox
                      value="junior"
                      user={{
                        name: "Junior Garcia",
                        // avatar:
                        //   "https://avatars.githubusercontent.com/u/30373425?v=4",
                        username: "jrgarciadev",
                        url: "https://twitter.com/jrgarciadev",
                        role: "Software Developer",
                      }}
                    />
                    <CustomCheckbox
                      value="johndoe"
                      user={{
                        name: "John Doe",
                        username: "johndoe",
                        url: "#",
                        role: "Product Designer",
                      }}
                    />
                    <CustomCheckbox
                      value="zoeylang"
                      user={{
                        name: "Zoey Lang",
                        username: "zoeylang",
                        url: "#",
                        role: "Technical Writer",
                      }}
                    />
                    <CustomCheckbox
                      value="zoeylang"
                      user={{
                        name: "Zoey Lang",
                        username: "zoeylang",
                        url: "#",
                        role: "Technical Writer",
                      }}
                    />
                    <CustomCheckbox
                      value="zoeylang"
                      user={{
                        name: "Zoey Lang",
                        username: "zoeylang",
                        url: "#",
                        role: "Technical Writer",
                      }}
                    />
                  </CheckboxGroup>
                  <p className="ml-1 mt-4 text-default-500">
                    Sélectionné : {groupSelected.join(", ")}
                  </p>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Fermer
                </Button>
                <Button color="primary" onPress={onClose}>
                  Valider
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default VoirProjet;
