import { useCallback, useEffect, useState } from 'react';
import { API_BASE_URL } from '@/constants/api';
import { supabase } from '@/lib/supabase';

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  created_at: string;
  is_read: boolean;
  actor_name?: string | null;
  actor_avatar_url?: string | null;
  metadata?: Record<string, any> | null;
};

export type InvitationItem = {
  id: string;
  community_id: string;
  community_name: string;
  inviter_name?: string | null;
  inviter_avatar_url?: string | null;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
};

type NotificationResponse = {
  notifications: NotificationItem[];
  invitations: InvitationItem[];
  unread_count: number;
};

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [invitations, setInvitations] = useState<InvitationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAccessToken = async (): Promise<string | null> => {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      throw new Error(error.message || 'Failed to get session');
    }

    return data.session?.access_token ?? null;
  };

  const fetchNotifications = useCallback(async () => {
    try {
      setError(null);

      const token = await getAccessToken();

      if (!token) {
        setNotifications([]);
        setInvitations([]);
        setUnreadCount(0);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/notifications`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detail || 'Failed to fetch notifications');
      }

      const typedData = data as NotificationResponse;

      setNotifications(typedData.notifications || []);
      setInvitations(typedData.invitations || []);
      setUnreadCount(typedData.unread_count || 0);
    } catch (err: any) {
      setError(err?.message || 'Failed to load notifications');
      setNotifications([]);
      setInvitations([]);
      setUnreadCount(0);
      console.error('fetchNotifications error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const refresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
  };

  const markAsRead = async (notificationId: string) => {
    const token = await getAccessToken();

    if (!token) {
      throw new Error('No active session found');
    }

    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.detail || 'Failed to mark notification as read');
    }

    setNotifications((prev) =>
      prev.map((item) =>
        item.id === notificationId ? { ...item, is_read: true } : item
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    const token = await getAccessToken();

    if (!token) {
      throw new Error('No active session found');
    }

    const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.detail || 'Failed to mark all as read');
    }

    setNotifications((prev) =>
      prev.map((item) => ({ ...item, is_read: true }))
    );
    setUnreadCount(0);
  };

  const respondToInvitation = async (
    invitationId: string,
    action: 'accepted' | 'declined'
  ) => {
    const token = await getAccessToken();

    if (!token) {
      throw new Error('No active session found');
    }

    const response = await fetch(
      `${API_BASE_URL}/notifications/invitations/${invitationId}/respond`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.detail || 'Failed to respond to invitation');
    }

    setInvitations((prev) =>
      prev.map((item) =>
        item.id === invitationId ? { ...item, status: action } : item
      )
    );
  };

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    invitations,
    unreadCount,
    loading,
    refreshing,
    error,
    refresh,
    markAsRead,
    markAllAsRead,
    respondToInvitation,
  };
}