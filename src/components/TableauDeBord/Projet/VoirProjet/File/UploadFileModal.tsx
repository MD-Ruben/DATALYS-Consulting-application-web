"use client"
import React, { useState, useContext } from "react";
import { ShowToastContext } from "@/context/ShowToastContext";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, getFirestore, setDoc, getDocs, query, collection, where, getDoc } from "firebase/firestore";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } from "@nextui-org/react";
import Toast from "@/components/TableauDeBord/Projet/VoirProjet/Toast";
import { createNotification } from "@/firebase/firebaseConfig";

interface UploadFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileUploaded: () => void;
  parentFolderId: string | null;
  projectId: string;
}

const UploadFileModal: React.FC<UploadFileModalProps> = ({ isOpen, onClose, onFileUploaded, parentFolderId, projectId }) => {
  const context = useContext(ShowToastContext);
  const setShowToastMsg = context?.setShowToastMsg;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  const db = getFirestore();
  const storage = getStorage();

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setError("Veuillez sélectionner un fichier avant de l'uploader.");
      setShowToast(true);
      return;
    }

    try {
      const fileRef = ref(storage, `file/${selectedFile.name}`);
      await uploadBytes(fileRef, selectedFile);
      const downloadURL = await getDownloadURL(fileRef);

      await setDoc(doc(db, "files", Date.now().toString()), {
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size,
        modifiedAt: selectedFile.lastModified,
        parentFolderId,
        projectId,
        imageUrl: downloadURL,
        createdAt: new Date().toISOString(),
      });

      // Récupérer les informations du projet
      const projectDoc = await getDoc(doc(db, "projects", projectId));
      const projectData = projectDoc.data();

      if (projectData?.authorizedUsers) {
        // Notifier les administrateurs
        const adminsSnapshot = await getDocs(
          query(collection(db, "users"), where("isAdmin", "==", true))
        );

        adminsSnapshot.docs.forEach(async (adminDoc) => {
          await createNotification(
            adminDoc.id,
            {
              title: "Nouveau fichier uploadé",
              body: `Un nouveau fichier "${selectedFile.name}" a été uploadé dans le projet`,
              link: `/tableaudebord/projet/pageprojet/${projectId}`
            },
            auth.currentUser?.uid || ""
          );
        });

        // Notifier les clients autorisés
        projectData.authorizedUsers.forEach(async (userId: string) => {
          // Ne pas notifier l'utilisateur qui upload le fichier
          if (userId !== auth.currentUser?.uid) {
            await createNotification(
              userId,
              {
                title: "Nouveau fichier disponible",
                body: `Un nouveau fichier "${selectedFile.name}" a été ajouté au projet`,
                link: `/tableaudebord/projet/pageprojet/${projectId}`
              },
              auth.currentUser?.uid || ""
            );
          }
        });
      }

      onFileUploaded();
      onClose();
      if (setShowToastMsg) {
        setShowToastMsg("Fichier téléchargé avec succès !");
      }

    } catch (error) {
      console.error("Erreur de téléchargement du fichier :", error);
      setError("Erreur lors de l'upload du fichier.");
      setShowToast(true);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Charger le fichier</ModalHeader>
          <ModalBody>
            <Input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
            />
            {error && <p className="text-red-500">{error}</p>}
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Annuler
            </Button>
            <Button color="primary" onPress={handleFileUpload}>
              Charger
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {showToast && <Toast msg={error || "Une erreur est survenue"} />}
    </>
  );
}

export default UploadFileModal;
