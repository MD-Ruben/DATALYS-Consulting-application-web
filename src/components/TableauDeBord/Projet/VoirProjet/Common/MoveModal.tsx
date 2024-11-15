import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";

interface MoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMove: (newParentId: string) => Promise<void>;
  currentParentId: string;
  projectId: string;
  itemType: 'folder' | 'file';
  currentItemId: string;
  itemName: string;
}

interface Folder {
  id: string;
  name: string;
  parentFolderId: string | null;
}

const MoveModal: React.FC<MoveModalProps> = ({
  isOpen,
  onClose,
  onMove,
  currentParentId,
  projectId,
  itemType,
  currentItemId,
  itemName
}) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>(currentParentId);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const foldersRef = collection(db, "Folders");
        const q = query(foldersRef, where("projectId", "==", projectId));
        const querySnapshot = await getDocs(q);
        
        const allFolders: Folder[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          parentFolderId: doc.data().parentFolderId || null,
        }));

        const getSubFolderIds = (folderId: string, accumulator = new Set<string>()): Set<string> => {
          accumulator.add(folderId);
          allFolders
            .filter(folder => folder.parentFolderId === folderId)
            .forEach(subFolder => getSubFolderIds(subFolder.id, accumulator));
          return accumulator;
        };

        const excludedIds = currentItemId ? getSubFolderIds(currentItemId) : new Set<string>();

        const availableFolders = allFolders.filter(folder => !excludedIds.has(folder.id));

        if (projectId !== currentItemId) {
          availableFolders.unshift({ id: projectId, name: "Root", parentFolderId: null });
        }

        setFolders(availableFolders);
        
        if (currentParentId && availableFolders.some(f => f.id === currentParentId)) {
          setSelectedFolder(currentParentId);
        } else {
          setSelectedFolder(projectId);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des dossiers:", error);
        setError("Erreur lors de la récupération des dossiers");
      }
    };

    if (isOpen) {
      fetchFolders();
    }
  }, [isOpen, projectId, currentItemId, currentParentId]);

  const handleMove = async () => {
    try {
      setError(null);
      setLoading(true);
      await onMove(selectedFolder);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              Déplacer {itemType === 'folder' ? 'le dossier' : 'le fichier'} {itemName}
            </ModalHeader>
            <ModalBody>
              {error && (
                <div className="text-red-500 mb-4">
                  {error}
                </div>
              )}
              <Select
                label="Sélectionner le dossier de destination"
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
                className="w-full"
              >
                {folders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {folder.name}
                  </SelectItem>
                ))}
              </Select>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Annuler
              </Button>
              <Button 
                color="primary" 
                onPress={handleMove}
                isLoading={loading}
              >
                Déplacer
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default MoveModal;