import { create, StateCreator } from "zustand";
import { Conversation } from "@/hooks/use-workspace-conversations";

interface UseChatStore {
  selectedConversation: Conversation | null;
  showProfileSheet: boolean;
  setSelectedConversation: (conversation: Conversation | null) => void;
  setShowProfileSheet: (value: boolean) => void;
  toggleProfileSheet: (value: boolean) => void;
}

const chatStore: StateCreator<UseChatStore> = (set) => ({
  selectedConversation: null,
  showProfileSheet: false,
  setSelectedConversation: (conversation) => set(() => ({ selectedConversation: conversation })),
  setShowProfileSheet: (value) => set({ showProfileSheet: value }),
  toggleProfileSheet: (value) => set({ showProfileSheet: value })
});

const useChatStore = create(chatStore);

export default useChatStore;
