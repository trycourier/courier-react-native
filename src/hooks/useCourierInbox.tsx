import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { CourierInboxListener } from 'src/models/CourierInboxListener';
import { InboxMessage } from 'src/models/InboxMessage';
import Courier from '..';

let inboxListener: CourierInboxListener | undefined = undefined

interface CourierInboxContextType {
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

const CourierInboxContext = createContext<CourierInboxContextType | undefined>(undefined);

export const CourierInboxProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [unreadMessageCount, setUnreadMessageCount] = useState<number>(0);
  const [totalMessageCount, setTotalMessageCount] = useState<number>(0);
  const [canPaginate, setCanPaginate] = useState<boolean>(false);

  useEffect(() => {

    inboxListener?.remove()

    inboxListener = Courier.shared.addInboxListener({
      onInitialLoad: () => {
        setIsLoading(true);
        setError(undefined);
      },
      onError: (error) => {
        setIsLoading(false);
        setError(error);
      },
      onMessagesChanged: (messages, unreadMessageCount, totalMessageCount, canPaginate) => {
        setIsLoading(false);
        setError(undefined);
        setMessages(messages);
        setUnreadMessageCount(unreadMessageCount);
        setTotalMessageCount(totalMessageCount);
        setCanPaginate(canPaginate);
      }
    });

    return () => {
      inboxListener?.remove();
    }

  }, []);

  const setPaginationLimit = (limit: number) => {
    Courier.shared.setInboxPaginationLimit({ limit });
  };

  const fetchNextPageOfMessages = (): Promise<InboxMessage[]> => {
    return Courier.shared.fetchNextPageOfMessages();
  };

  const refresh = async () => {
    setIsRefreshing(true);
    await Courier.shared.refreshInbox();
    setIsRefreshing(false);
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
    <CourierInboxContext.Provider value={{
      isLoading,
      error,
      messages,
      unreadMessageCount,
      totalMessageCount,
      canPaginate,
      setPaginationLimit,
      fetchNextPageOfMessages,
      refresh,
      isRefreshing,
      readAllMessages,
      readMessage,
      unreadMessage,
    }}>
      {children}
    </CourierInboxContext.Provider>
  );
  
};

interface UseCourierInboxProps {
  paginationLimit?: number;
}

export const useCourierInbox = ({ paginationLimit }: UseCourierInboxProps = {}): CourierInboxContextType => {

  const context = useContext(CourierInboxContext);

  if (!context) {
    throw new Error('useCourierInbox must be used within an CourierInboxProvider');
  }

  // Set the initial pagination limit if needed
  if (paginationLimit) {
    context.setPaginationLimit(paginationLimit)
  }

  return context;

};
