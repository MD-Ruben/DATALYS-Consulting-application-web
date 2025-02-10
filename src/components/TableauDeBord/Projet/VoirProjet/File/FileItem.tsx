"use client";
import { deleteDoc, doc, getFirestore, updateDoc } from "firebase/firestore";
import moment from "moment/moment";
import Image from "next/image";
import React, { useContext, useState, useEffect } from "react";
import { app } from "@/firebase/firebaseConfig";
import { ShowToastContext } from "@/context/ShowToastContext";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";
import { getAuth } from "firebase/auth";
import { getDoc } from "firebase/firestore";
import RenameModal from "../Common/RenameModal";
import MoveModal from "../Common/MoveModal";
import { createNotification } from "@/firebase/firebaseConfig";
import { getDocs, query, collection, where } from "firebase/firestore";

interface FileItemProps {
  file: {
    id: string;
    name: string;
    type: string;
    size: number;
    modifiedAt: number;
    imageUrl: string;
    projectId: string;
    isPrivate?: boolean;
  };
  onFileDeleted: () => void;
}

const FileItem: React.FC<FileItemProps> = ({ file, onFileDeleted }) => {
  const db = getFirestore(app);
  const context = useContext(ShowToastContext);
  const setShowToastMsg = context ? context.setShowToastMsg : () => {};
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);

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
      const fileRef = doc(db, "files", file.id);
      await updateDoc(fileRef, { name: newName });
      onFileDeleted(); // Rafraîchir la liste
    } catch (error) {
      console.error("Erreur lors du renommage du fichier:", error);
      throw new Error("Erreur lors du renommage du fichier");
    }
  };

  const handleMove = async (newParentId: string) => {
    try {
      const fileRef = doc(db, "files", file.id);
      await updateDoc(fileRef, { parentFolderId: newParentId });
      onFileDeleted(); // Rafraîchir la liste
    } catch (error) {
      console.error("Erreur lors du déplacement du fichier:", error);
      throw new Error("Erreur lors du déplacement du fichier");
    }
  };

  const togglePrivate = async () => {
    try {
      const fileRef = doc(db, "files", file.id);
      await updateDoc(fileRef, { isPrivate: !file.isPrivate });
      onFileDeleted(); // Rafraîchir la liste
    } catch (error) {
      console.error("Erreur lors du changement de statut privé:", error);
      throw new Error("Erreur lors du changement de statut privé");
    }
  };

  const deleteFile = async () => {
    try {
      await deleteDoc(doc(db, "files", file.id));
      setShowToastMsg("Fichier supprimé !");
      onFileDeleted();
      onClose();

      // Notifier les administrateurs
      const adminsSnapshot = await getDocs(
        query(collection(db, "users"), where("isAdmin", "==", true))
      );

      adminsSnapshot.docs.forEach(async (adminDoc) => {
        await createNotification(adminDoc.id, {
          title: "Fichier supprimé",
          body: `Le fichier "${file.name}" a été supprimé du projet`,
          link: `/tableaudebord/projet/pageprojet/${file.projectId}`
        });
      });

    } catch (error) {
      console.error("Erreur lors de la suppression du fichier: ", error);
      setShowToastMsg("Erreur lors de la suppression du fichier");
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

  return (
    <>
      <div className="cursor-pointer rounded-md p-3">
        <div className="max-w-screen grid w-full grid-cols-4 overflow-x-scroll text-xs scrollbar-hide md:text-base">
          <div
            className="flex items-center gap-2"
            onClick={() => window.open(file.imageUrl)}
          >
            <Image
              src={getFileIcon(file.name)}
              alt="file-icon"
              width={26}
              height={20}
            />
            <h2 className="truncate">
              {file.name}
              {file.isPrivate && " 🔒"}
            </h2>
          </div>
          <h2>{moment(file.modifiedAt).format("MMMM DD, YYYY")}</h2>
          <h2>{(file.size / 1024 ** 2).toFixed(2) + " MB"}</h2>
          {isUserAdmin && (
            <div className="flex gap-2">
              <Button
                size="sm"
                color="primary"
                onPress={() => setShowRenameModal(true)}
              >
                Renommer
              </Button>
              <Button
                size="sm"
                color="secondary"
                onPress={() => setShowMoveModal(true)}
              >
                Déplacer
              </Button>
              <Button
                size="sm"
                color="warning"
                onPress={togglePrivate}
              >
                {file.isPrivate ? "Rendre public" : "Rendre privé"}
              </Button>
              <Button
                size="sm"
                color="danger"
                onPress={onOpen}
              >
                Supprimer
              </Button>
            </div>
          )}
        </div>
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

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        className="bg-white shadow-1 dark:bg-gray-dark dark:shadow-card"
      >
        <ModalContent>
          <ModalHeader className="text-dark dark:text-white">
            Confirmer la suppression
          </ModalHeader>
          <ModalBody>
            <p>Êtes-vous sûr de vouloir supprimer le fichier "{file.name}" ?</p>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" onPress={deleteFile}>
              Supprimer
            </Button>
            <Button onPress={onClose}>Annuler</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default FileItem;
