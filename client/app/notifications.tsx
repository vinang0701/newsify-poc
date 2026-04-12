import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';

import NotificationTabs from '@/components/notifications/NotificationTabs';
import NotificationList from '@/components/notifications/NotificationList';
import InvitationList from '@/components/notifications/InvitationList';
import { useNotifications } from '@/hooks/useNotifications';

export default function NotificationsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'notifications' | 'invitations'>(
    'notifications'
  );

  const {
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
  } = useNotifications();

  const handleNotificationPress = async (item: any) => {
    try {
      if (!item.is_read) {
        await markAsRead(item.id);
      }

      if (item.metadata?.route) {
        router.push(item.metadata.route);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to open notification');
    }
  };

  const handleRespond = async (id: string, action: 'accepted' | 'declined') => {
    try {
      await respondToInvitation(id, action);
      Alert.alert('Success', `Invitation ${action}.`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to respond');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={18} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}> </Text>

        {activeTab === 'notifications' ? (
          <TouchableOpacity onPress={markAllAsRead} style={styles.headerRight}>
            <Text style={styles.readAllText}> </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerRight} />
        )}
      </View>

      <NotificationTabs activeTab={activeTab} onChange={setActiveTab} />

      {loading ? (
        <View style={styles.centerWrap}>
          <ActivityIndicator size="small" color="#2563EB" />
        </View>
      ) : error ? (
        <View style={styles.centerWrap}>
          <Text style={styles.errorTitle}>Unable to load</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refresh}>
            <Text style={styles.retryButtonText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : activeTab === 'notifications' ? (
        <NotificationList
          data={notifications}
          refreshing={refreshing}
          onRefresh={refresh}
          onPressItem={handleNotificationPress}
        />
      ) : (
        <InvitationList
          data={invitations}
          refreshing={refreshing}
          onRefresh={refresh}
          onRespond={handleRespond}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  topHeader: {
    height: 44,
    backgroundColor: '#0B5FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  backButton: {
    width: 28,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  readAllText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  centerWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#F3F4F6',
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  errorText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});