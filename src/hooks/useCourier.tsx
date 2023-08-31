import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { InboxMessage } from 'src/models/InboxMessage';
import Courier, { CourierPushListener, CourierInboxListener, CourierAuthenticationListener } from '..';

let authListener: CourierAuthenticationListener | undefined = undefined
let pushListener: CourierPushListener | undefined = undefined
let inboxListener: CourierInboxListener | undefined = undefined

interface CourierContextType {
  auth?: {
    isLoading: boolean;
    error?: string;
    userId?: string;
    signIn: (props: { accessToken: string, clientKey?: string, userId: string }) => Promise<void>;
    signOut: () => Promise<void>;
  }
  push?: {
    delivered: any;
    clicked: any;
    tokens: {
      apns?: string,
      fcm?: string;
    },
    notificationPermissionStatus?: string;
    requestNotificationPermission: () => Promise<void>;
  }
  inbox?: {
    isLoading: boolean;
    error?: string;
    messages: InboxMessage[];
    unreadMessageCount: number;
    totalMessageCount: number;
    canPaginate: boolean;
    setPaginationLimit: (limit: number) => void;
    fetchNextPageOfMessages: () => Promise<InboxMessage[]>;
    refresh: () => Promise<void>;
    isRefreshing: boolean;
    readAllMessages: () => Promise<void>;
    readMessage: (messageId: string) => Promise<void>;
    unreadMessage: (messageId: string) => Promise<void>;
  }
}

const CourierContext = createContext<CourierContextType | undefined>(undefined);

export const CourierProvider: React.FC<{ listeners: ('auth' | 'push' | 'inbox')[], children: ReactNode }> = ({ listeners, children }) => {

  // Auth
  const [auth_userId, auth_setUserId] = useState<string | undefined>(undefined);
  const [auth_isLoading, auth_setIsLoading] = useState<boolean>(false);
  const [auth_error, auth_setError] = useState<string | undefined>(undefined);

  // Push
  const [push_pushNotificationDelivered, inbox_setPushNotificationDelivered] = useState<any>(undefined);
  const [push_pushNotificationClicked, inbox_setPushNotificationClicked] = useState<any>(undefined);
  const [push_apnsToken, push_setApnsToken] = useState<string | undefined>(undefined);
  const [push_fcmToken, push_setFcmToken] = useState<string | undefined>(undefined);
  const [push_notificationPermission, push_setNotificationPermission] = useState<string | undefined>(undefined);

  // Inbox
  const [inbox_isLoading, inbox_setIsLoading] = useState<boolean>(false);
  const [inbox_isRefreshing, inbox_setIsRefreshing] = useState<boolean>(false);
  const [inbox_error, inbox_setError] = useState<string | undefined>(undefined);
  const [inbox_messages, inbox_setMessages] = useState<InboxMessage[]>([]);
  const [inbox_unreadMessageCount, inbox_setUnreadMessageCount] = useState<number>(0);
  const [inbox_totalMessageCount, inbox_setTotalMessageCount] = useState<number>(0);
  const [inbox_canPaginate, inbox_setCanPaginate] = useState<boolean>(false);

  useEffect(() => {

    // Get the initial values
    const userId = Courier.shared.userId;
    auth_setUserId(userId);

    // Permissions
    syncNotificationPermissions();

    // Push tokens
    syncTokens();

  }, [])

  useEffect(() => {

    authListener?.remove();
    pushListener?.remove();
    inboxListener?.remove();

    // Push
    if (listeners.includes('auth')) {

      authListener = Courier.shared.addAuthenticationListener({
        onUserChanged: (userId) => {
          auth_setUserId(userId);
        }
      })

    }

    // Push
    if (listeners.includes('push')) {

      pushListener = Courier.shared.addPushNotificationListener({
        onPushNotificationDelivered: (push) => inbox_setPushNotificationDelivered(push),
        onPushNotificationClicked: (push) => inbox_setPushNotificationClicked(push)
      });

    }

    // Inbox
    if (listeners.includes('inbox')) {

      inboxListener = Courier.shared.addInboxListener({
        onInitialLoad: () => {
          inbox_setIsLoading(true);
          inbox_setError(undefined);
        },
        onError: (error) => {
          inbox_setIsLoading(false);
          inbox_setError(error);
        },
        onMessagesChanged: (messages, unreadMessageCount, totalMessageCount, canPaginate) => {
          inbox_setIsLoading(false);
          inbox_setError(undefined);
          inbox_setMessages(messages);
          inbox_setUnreadMessageCount(unreadMessageCount);
          inbox_setTotalMessageCount(totalMessageCount);
          inbox_setCanPaginate(canPaginate);
        }
      });

    }

    return () => {
      authListener?.remove();
      pushListener?.remove();
      inboxListener?.remove();
    }

  }, [listeners]);

  const signIn = async (props: { accessToken: string, clientKey?: string, userId: string }): Promise<void> => {
    
    auth_setIsLoading(true);
    auth_setError(undefined);

    try {
      await Courier.shared.signIn(props)
    } catch (error) {
      auth_setError(error as string);
    }

    auth_setIsLoading(false);

  };

  const signOut = async (): Promise<void> => {
    
    auth_setIsLoading(true);
    auth_setError(undefined);

    try {
      await Courier.shared.signOut();
    } catch (error) {
      auth_setError(error as string);
    }

    auth_setIsLoading(false);

  };

  const syncNotificationPermissions = async () => {

    const status = await Courier.shared.getNotificationPermissionStatus();
    push_setNotificationPermission(status);

  }

  const syncTokens = () => {

    // APNS
    const apnsToken = Courier.shared.apnsToken;
    push_setApnsToken(apnsToken);

    const fcmToken = Courier.shared.fcmToken;
    push_setFcmToken(fcmToken);

  }

  const requestNotificationPermission = async () => {
    const status = await Courier.shared.requestNotificationPermission();
    push_setNotificationPermission(status);
  };

  const setPaginationLimit = (limit: number) => {
    Courier.shared.setInboxPaginationLimit({ limit });
  };

  const fetchNextPageOfMessages = (): Promise<InboxMessage[]> => {
    return Courier.shared.fetchNextPageOfMessages();
  };

  const refresh = async () => {
    inbox_setIsRefreshing(true);
    await Courier.shared.refreshInbox();
    inbox_setIsRefreshing(false);
  };

  const readAllMessages = () => {

    // Skip if no user is found
    if (!Courier.shared.userId) {
      return Promise.resolve();
    }

    // Read the messages
    return Courier.shared.readAllInboxMessages();

  };

  const readMessage = (messageId: string) => {
    return Courier.shared.readMessage({ messageId });
  };

  const unreadMessage = (messageId: string) => {
    return Courier.shared.unreadMessage({ messageId });
  };

  return (
    <CourierContext.Provider value={{
      auth: {
        isLoading: auth_isLoading,
        error: auth_error,
        userId: auth_userId,
        signIn,
        signOut
      },
      push: {
        delivered: push_pushNotificationDelivered,
        clicked: push_pushNotificationClicked,
        tokens: {
          fcm: push_fcmToken,
          apns: push_apnsToken,
        },
        notificationPermissionStatus: push_notificationPermission,
        requestNotificationPermission,
      },
      inbox: {
        isLoading: inbox_isLoading,
        error: inbox_error,
        messages: inbox_messages,
        unreadMessageCount: inbox_unreadMessageCount,
        totalMessageCount: inbox_totalMessageCount,
        canPaginate: inbox_canPaginate,
        setPaginationLimit,
        fetchNextPageOfMessages,
        refresh,
        isRefreshing: inbox_isRefreshing,
        readAllMessages,
        readMessage,
        unreadMessage,
      }
    }}>
      {children}
    </CourierContext.Provider>
  );
  
};

interface UseCourierProps {
  inbox?: {
    paginationLimit?: number;
  }
}

export const useCourier = (props: UseCourierProps = {}): CourierContextType => {

  const context = useContext(CourierContext);

  if (!context) {
    throw new Error('useCourier must be used within an CourierProvider');
  }

  // Set the initial pagination limit if needed
  if (props.inbox?.paginationLimit) {
    context.inbox?.setPaginationLimit(props.inbox?.paginationLimit)
  }

  return context;

};
