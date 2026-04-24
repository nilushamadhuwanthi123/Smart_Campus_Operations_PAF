import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  deleteNotification as deleteNotificationRequest,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead
} from '../api/notifications';
import { useAuth } from './AuthContext';

const NotificationsContext = createContext(null);

const POLL_INTERVAL_MS = 30000;
const NOTIFICATION_LIMIT = 200;

export function NotificationsProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const refreshNotifications = useCallback(
    async ({ silent = false } = {}) => {
      if (!isAuthenticated) {
        setNotifications([]);
        setErrorMessage('');
        setIsLoading(false);
        return;
      }

      if (!silent) {
        setIsLoading(true);
      }

      try {
        const response = await getNotifications({ limit: NOTIFICATION_LIMIT });
        setNotifications(Array.isArray(response) ? response : []);
        setErrorMessage('');
      } catch (error) {
        setErrorMessage(error.message || 'Failed to load notifications.');
      } finally {
        if (!silent) {
          setIsLoading(false);
        }
      }
    },
    [isAuthenticated]
  );

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications, user?.id]);

  useEffect(() => {
    if (!isAuthenticated) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      refreshNotifications({ silent: true });
    }, POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isAuthenticated, refreshNotifications]);

  const markAsRead = useCallback(
    async (id) => {
      const readAt = new Date().toISOString();
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id ? { ...notification, read: true, readAt: notification.readAt || readAt } : notification
        )
      );

      try {
        const updated = await markNotificationAsRead(id);
        if (updated?.id) {
          setNotifications((current) =>
            current.map((notification) => (notification.id === updated.id ? updated : notification))
          );
        }
        setErrorMessage('');
      } catch (error) {
        setErrorMessage(error.message || 'Failed to update notification.');
        refreshNotifications({ silent: true });
      }
    },
    [refreshNotifications]
  );

  const markAllAsRead = useCallback(async () => {
    const readAt = new Date().toISOString();

    setNotifications((current) =>
      current.map((notification) =>
        notification.read ? notification : { ...notification, read: true, readAt: notification.readAt || readAt }
      )
    );

    try {
      await markAllNotificationsAsRead();
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.message || 'Failed to update notifications.');
      refreshNotifications({ silent: true });
    }
  }, [refreshNotifications]);

  const deleteById = useCallback(
    async (id) => {
      setNotifications((current) => current.filter((notification) => notification.id !== id));

      try {
        await deleteNotificationRequest(id);
        setErrorMessage('');
      } catch (error) {
        setErrorMessage(error.message || 'Failed to delete notification.');
        refreshNotifications({ silent: true });
      }
    },
    [refreshNotifications]
  );

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      isLoading,
      errorMessage,
      refreshNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification: deleteById
    }),
    [notifications, unreadCount, isLoading, errorMessage, refreshNotifications, markAsRead, markAllAsRead, deleteById]
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationsContext);

  if (!context) {
    throw new Error('useNotifications must be used within NotificationsProvider');
  }

  return context;
}
