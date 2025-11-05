// src/components/NotificationsWrapper.jsx
import { useEffect, useState } from "react";
import { socket } from "../socket"; // singleton socket
import NotificationBell from "./NotificationBell";
import "./NotificationsWrapper.css";

export default function NotificationsWrapper() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const handleBellClick = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    const handleNewEntry = (entry) => {
        console.log("Listener triggered with:", entry);
      setNotifications((prev) => [entry, ...prev]);
    };

    console.log("Registering listener...");
    socket.on("new-adjusting-entry", handleNewEntry);

    console.log("Notifications array:", notifications);
console.log("Notifications length:", notifications.length);


    return () => {
    console.log("Removing listener...");
      socket.off("new-adjusting-entry", handleNewEntry);
    };
  }, []);

  return (
    <div className="notifications-wrapper">
      <NotificationBell count={notifications.length} onClick={handleBellClick} />

      {isOpen && (
        <div className="notifications-dropdown">
          {notifications.length === 0 ? (
            <div className="notification-item no-notifications">
              No notifications
            </div>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="notification-item">
                <strong>{n.createdBy}</strong> submitted: <br />
                {n.description}
                <div className="notification-date">
                  {new Date(n.date).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}