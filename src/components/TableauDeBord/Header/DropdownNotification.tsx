"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  auth,
  db,
  requestFCMToken,
  onMessageListener,
  initializeMessaging,
} from "@/firebase/firebaseConfig";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  Timestamp,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { getMessaging, onMessage } from "firebase/messaging";
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  ScrollShadow,
  Card,
  CardBody,
  Divider,
  cn,
} from "@nextui-org/react";

interface Notification {
  id: string;
  title: string;
  body: string;
  timestamp: Timestamp;
  read: boolean;
  link?: string;
}

const DropdownNotification = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [lastReadTimestamp, setLastReadTimestamp] = useState<number>(0);
  const [unreadCount, setUnreadCount] = useState(0);

  const markAsRead = async (notificationId: string) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const notificationRef = doc(
          db,
          "users",
          user.uid,
          "notifications",
          notificationId,
        );
        await updateDoc(notificationRef, { read: true });

        // Mettre à jour le timestamp de dernière lecture
        const currentTimestamp = Date.now();
        localStorage.setItem(
          "lastReadNotification",
          currentTimestamp.toString(),
        );
        setLastReadTimestamp(currentTimestamp);

        // Mettre à jour l'état notifying
        checkUnreadNotifications();
      } catch (error) {
        console.error("Erreur lors du marquage comme lu:", error);
      }
    }
  };

  const checkUnreadNotifications = (notifs: Notification[]) => {
    const storedTimestamp = parseInt(
      localStorage.getItem("lastReadNotification") || "0",
    );

    const unreadNotifs = notifs.filter((notification) => {
      if (!notification.timestamp) return false;
      const notifTimestamp = notification.timestamp.toDate().getTime();
      return notifTimestamp > storedTimestamp;
    });

    setUnreadCount(unreadNotifs.length);
    setNotifying(unreadNotifs.length > 0);
  };

  const handleDropdownOpen = () => {
    setDropdownOpen(true);
    const currentTimestamp = Date.now();
    localStorage.setItem("lastReadNotification", currentTimestamp.toString());
    setLastReadTimestamp(currentTimestamp);
    setNotifying(false);
  };

  useEffect(() => {
    const initializeNotifications = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          // Initialiser la messagerie de manière sécurisée
          const messaging = await initializeMessaging();
          
          if (messaging) {
            // Continuer avec la logique de notification existante
            onMessage(messaging, (payload) => {
              if (payload.notification) {
                const newNotification = {
                  id: Date.now().toString(),
                  title: payload.notification.title || "",
                  body: payload.notification.body || "",
                  timestamp: Timestamp.now(),
                  read: false,
                  link: payload.data?.link,
                };

                setNotifications((prev) => {
                  const updatedNotifications = [newNotification, ...prev];
                  checkUnreadNotifications(updatedNotifications);
                  return updatedNotifications;
                });
              }
            });
          }

          // Continuer avec le reste de la logique qui ne dépend pas de la messagerie
          const storedTimestamp = parseInt(
            localStorage.getItem("lastReadNotification") || "0"
          );
          setLastReadTimestamp(storedTimestamp);

          const token = await requestFCMToken();
          if (token) {
            setFcmToken(token);
            const userTokensRef = collection(db, "users", user.uid, "tokens");
            await addDoc(userTokensRef, {
              token,
              createdAt: new Date(),
            });
          }

          const notificationsRef = collection(
            db,
            "users",
            user.uid,
            "notifications",
          );
          const notificationsQuery = query(
            notificationsRef,
            orderBy("timestamp", "desc"),
            limit(10),
          );

          const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
            const newNotifications = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as Notification[];

            setNotifications(newNotifications);
            checkUnreadNotifications(newNotifications);
          });

          return () => unsubscribe();
        } catch (err) {
          console.error("Erreur dans l'initialisation des notifications", err);
        }
      }
    };

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        initializeNotifications();
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  const getNotificationTimestamp = (notification: Notification): number => {
    try {
      if (
        notification.timestamp &&
        typeof notification.timestamp.toDate === "function"
      ) {
        return notification.timestamp.toDate().getTime();
      }
      // Si timestamp n'est pas un Timestamp Firestore, retourner 0 ou une autre valeur par défaut
      return 0;
    } catch (error) {
      console.error("Erreur lors de la conversion du timestamp:", error);
      return 0;
    }
  };

  const deleteNotification = async (
    e: React.MouseEvent,
    notificationId: string,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const user = auth.currentUser;
    if (user) {
      try {
        const notificationRef = doc(
          db,
          "users",
          user.uid,
          "notifications",
          notificationId,
        );
        await deleteDoc(notificationRef);

        // Mettre à jour la liste locale des notifications
        const updatedNotifications = notifications.filter(
          (n) => n.id !== notificationId,
        );
        setNotifications(updatedNotifications);

        // Recalculer le nombre de notifications non lues
        checkUnreadNotifications(updatedNotifications);

        console.log("Notification supprimée avec succès");
      } catch (error) {
        console.error(
          "Erreur lors de la suppression de la notification:",
          error,
        );
      }
    }
  };

  return (
    <div className="relative block">
      <Dropdown
        isOpen={dropdownOpen}
        onOpenChange={(open) => {
          if (open) {
            handleDropdownOpen();
          } else {
            setDropdownOpen(false);
          }
        }}
      >
        <DropdownTrigger>
          <Button
            isIconOnly
            radius="full"
            variant="light"
            className={cn(
              "relative h-12 w-12",
              "bg-default-100 hover:bg-default-200",
              "dark:bg-default-50 dark:hover:bg-default-100",
            )}
          >
            <div className="relative">
              <svg
                className="fill-default-500 dark:fill-default-300"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M10.0001 1.0415C6.43321 1.0415 3.54172 3.933 3.54172 7.49984V8.08659C3.54172 8.66736 3.36981 9.23513 3.04766 9.71836L2.09049 11.1541C0.979577 12.8205 1.82767 15.0855 3.75983 15.6125C4.3895 15.7842 5.0245 15.9294 5.66317 16.0482L5.66475 16.0525C6.30558 17.7624 8.01834 18.9582 10 18.9582C11.9817 18.9582 13.6944 17.7624 14.3352 16.0525L14.3368 16.0483C14.9755 15.9295 15.6106 15.7842 16.2403 15.6125C18.1724 15.0855 19.0205 12.8205 17.9096 11.1541L16.9524 9.71836C16.6303 9.23513 16.4584 8.66736 16.4584 8.08659V7.49984C16.4584 3.933 13.5669 1.0415 10.0001 1.0415Z"
                />
              </svg>
              {notifying && (
                <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-danger">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger opacity-75" />
                </span>
              )}
            </div>
          </Button>
        </DropdownTrigger>

        <DropdownMenu
          aria-label="Notifications"
          className="w-[360px] p-0"
          closeOnSelect={false}
        >
          <DropdownItem
            key="header"
            textValue="Notifications"
            className="h-14 gap-2"
          >
            <div className="flex w-full items-center justify-between">
              <span className="text-base font-medium">Notifications</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-danger px-2 py-0.5 text-xs text-white">
                  {unreadCount} nouveau{unreadCount > 1 ? "x" : ""}
                </span>
              )}
            </div>
          </DropdownItem>

          {notifications.map((notification) => (
            <DropdownItem
              key={notification.id}
              textValue={notification.title}
              className={cn(
                "py-3",
                getNotificationTimestamp(notification) > lastReadTimestamp &&
                  "bg-default-100 dark:bg-default-50",
              )}
            >
              <div className="flex w-full items-start justify-between">
                <Link
                  href={notification.link || "#"}
                  className="flex-grow"
                  onClick={() => markAsRead(notification.id)}
                >
                  <Card shadow="none" className="bg-transparent">
                    <CardBody className="gap-1 p-0">
                      <p className="text-small font-medium">
                        {notification.title}
                      </p>
                      <p className="text-tiny text-default-400">
                        {notification.body}
                      </p>
                      <p className="text-tiny text-default-400">
                        {notification.timestamp &&
                        typeof notification.timestamp.toDate === "function"
                          ? notification.timestamp.toDate().toLocaleString()
                          : "Date inconnue"}
                      </p>
                    </CardBody>
                  </Card>
                </Link>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  className="ml-2 self-start"
                  onClick={(e) => deleteNotification(e, notification.id)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    className="text-default-400"
                  >
                    <path
                      fill="currentColor"
                      d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41z"
                    />
                  </svg>
                </Button>
              </div>
            </DropdownItem>
          ))}

          {notifications.length === 0 && (
            <DropdownItem textValue="Aucune notification">
              <p className="text-default-400">Aucune notification</p>
            </DropdownItem>
          )}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};

export default DropdownNotification;
