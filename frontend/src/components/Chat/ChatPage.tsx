import { useState } from "react";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";

interface ChatPageProps {
  userId: string;
  userRole: 'sme' | 'student';
}

const ChatPage = ({ userId, userRole }: ChatPageProps) => {
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshConversations = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="chat-page">
      <ChatList
        key={refreshKey}
        userId={userId}
        userRole={userRole}
        onSelectConversation={setSelectedConversation}
        selectedConversationId={selectedConversation?.user?.id}
      />
      <ChatWindow
        currentUserId={userId}
        otherUser={selectedConversation?.user}
        job={selectedConversation?.job}
        onMessageSent={refreshConversations}
      />
    </div>
  );
};

export default ChatPage;