import { useState } from "react";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";

interface ChatPageProps {
  userId: string;
  userRole: 'sme' | 'student';
}

const ChatPage = ({ userId, userRole }: ChatPageProps) => {
  const [selectedConversation, setSelectedConversation] = useState<any>(null);

  return (
    <div className="chat-page">
      <ChatList
        userId={userId}
        userRole={userRole}
        onSelectConversation={setSelectedConversation}
        selectedConversationId={selectedConversation?.user?.id}
      />
      <ChatWindow
        currentUserId={userId}
        otherUser={selectedConversation?.user}
        job={selectedConversation?.job}
      />
    </div>
  );
};

export default ChatPage;