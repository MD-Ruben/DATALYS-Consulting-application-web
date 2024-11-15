import React, { useState, useEffect } from "react";
import Image from "next/image";
import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  Button, 
  useDisclosure,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem
} from "@nextui-org/react";
import { getAuth } from "firebase/auth";
import { doc, getDoc, getFirestore, updateDoc, deleteDoc } from "firebase/firestore";
import RenameModal from "../Common/RenameModal";
import MoveModal from "../Common/MoveModal";

interface FileItemXLProps {
  file: {
    name: string;
    id: string;
    type: string;
    imageUrl: string;
    projectId: string;
    isPrivate?: boolean;
  };
  onFileDeleted: () => void;
}

const FileItemXL: React.FC<FileItemXLProps> = ({ file, onFileDeleted }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const checkUserAdmin = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const db = getFirestore();
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setIsUserAdmin(userDoc.data().isAdmin || false);
        }
      }
    };
    checkUserAdmin();
  }, []);

  const handleRename = async (newName: string) => {
    try {
      const db = getFirestore();
      const fileRef = doc(db, "files", file.id);
      await updateDoc(fileRef, { name: newName });
      onFileDeleted();
    } catch (error) {
      console.error("Erreur lors du renommage du fichier:", error);
      throw new Error("Erreur lors du renommage du fichier");
    }
  };

  const handleMove = async (newParentId: string) => {
    try {
      const db = getFirestore();
      const fileRef = doc(db, "files", file.id);
      await updateDoc(fileRef, { parentFolderId: newParentId });
      onFileDeleted();
    } catch (error) {
      console.error("Erreur lors du déplacement du fichier:", error);
      throw new Error("Erreur lors du déplacement du fichier");
    }
  };

  const handleDelete = async () => {
    try {
      const db = getFirestore();
      await deleteDoc(doc(db, "files", file.id));
      onFileDeleted();
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Erreur lors de la suppression du fichier:", error);
      throw new Error("Erreur lors de la suppression du fichier");
    }
  };

  const togglePrivate = async () => {
    try {
      const db = getFirestore();
      const fileRef = doc(db, "files", file.id);
      await updateDoc(fileRef, { isPrivate: !file.isPrivate });
      onFileDeleted();
    } catch (error) {
      console.error("Erreur lors du changement de statut privé:", error);
      throw new Error("Erreur lors du changement de statut privé");
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    const iconMap: { [key: string]: string } = {
      pdf: "/images/pdf.png",
      png: "/images/png.png",
      jpg: "/images/jpg.png",
      jpeg: "/images/jpg.png",
      pptx: "/images/pptx.png",
      docx: "/images/docx.png",
    };
    return iconMap[extension || ""] || "/images/file-icon.png";
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (file.imageUrl) {
      const link = document.createElement("a");
      link.href = file.imageUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      console.error("Impossible de télécharger le fichier");
    }
  };

  return (
    <>
      <div
        className="flex w-1/4 cursor-pointer flex-col items-center justify-center p-4 hover:bg-gray-100"
        onClick={onOpen}
      >
        <Image
          src={getFileIcon(file.name)}
          alt={file.name}
          width={64}
          height={64}
        />
        <p className="mt-2 w-full truncate text-center text-sm">
          {file.name}
          {file.isPrivate && " 🔒"}
        </p>
        {isUserAdmin && (
          <Dropdown>
            <DropdownTrigger>
              <Button
                size="sm"
                radius="full"
                className="flex items-center justify-center bg-white dark:bg-dark-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 12a1 1 0 1 0 2 0a1 1 0 1 0-2 0m7 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0m7 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0"
                  />
                </svg>
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="File Actions"
              className="bg-white text-dark dark:bg-dark-2 dark:text-white"
            >
              <DropdownItem key="renommer" onPress={() => setShowRenameModal(true)}>
                Renommer
              </DropdownItem>
              <DropdownItem key="deplacer" onPress={() => setShowMoveModal(true)}>
                Déplacer
              </DropdownItem>
              <DropdownItem key="prive" onPress={togglePrivate}>
                {file.isPrivate ? "Rendre public" : "Rendre privé"}
              </DropdownItem>
              <DropdownItem key="supprimer" onPress={() => setShowDeleteModal(true)}>
                Supprimer
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        )}
      </div>

      <RenameModal
        isOpen={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        onRename={handleRename}
        currentName={file.name}
        itemType="file"
      />

      <MoveModal
        isOpen={showMoveModal}
        onClose={() => setShowMoveModal(false)}
        onMove={handleMove}
        currentParentId={file.projectId}
        projectId={file.projectId}
        itemType="file"
        currentItemId={file.id}
        itemName={file.name}
      />

      {/* Modal de prévisualisation */}
      <Modal 
        isOpen={isOpen} 
        onClose={onClose}
        size="2xl"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {file.name}
              </ModalHeader>
              <ModalBody>
                {file.type.startsWith("image/") ? (
                  <Image
                    src={file.imageUrl}
                    alt={file.name}
                    width={800}
                    height={600}
                    style={{ maxWidth: "100%", height: "auto" }}
                  />
                ) : (
                  <iframe
                    src={file.imageUrl}
                    style={{ width: "100%", height: "80vh" }}
                  />
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Fermer
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Modal de confirmation de suppression */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <ModalContent>
          <ModalHeader>Confirmer la suppression</ModalHeader>
          <ModalBody>
            <p>Êtes-vous sûr de vouloir supprimer le fichier "{file.name}" ?</p>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" onPress={handleDelete}>
              Supprimer
            </Button>
            <Button color="primary" variant="light" onPress={() => setShowDeleteModal(false)}>
              Annuler
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default FileItemXL;
