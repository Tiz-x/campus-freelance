import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { FiMessageSquare, FiUser, FiBriefcase } from "react-icons/fi";

interface ChatListProps {
  userId: string;
  userRole: 'sme' | 'student';
  onSelectConversation: (conversation: any) => void;
  selectedConversationId: string | null;
}

const ChatList = ({ userId, onSelectConversation, selectedConversationId }: ChatListProps) => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
    
    // Subscribe to new messages
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, 
        () => fetchConversations()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  const fetchConversations = async () => {
    setLoading(true);
    
    // Get unique conversations
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:sender_id(id, email, full_name, avatar_url, role),
        receiver:receiver_id(id, email, full_name, avatar_url, role),
        jobs(id, title)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (!error && messages) {
      // Group by conversation partner
      const conversationMap = new Map();
      
      messages.forEach((msg: any) => {
        const otherUser = msg.sender_id === userId ? msg.receiver : msg.sender;
        const key = otherUser.id;
        
        if (!conversationMap.has(key)) {
          conversationMap.set(key, {
            user: otherUser,
            lastMessage: msg.message,
            lastMessageTime: msg.created_at,
            job: msg.jobs,
            unreadCount: msg.receiver_id === userId && !msg.is_read ? 1 : 0
          });
        } else if (msg.receiver_id === userId && !msg.is_read) {
          const existing = conversationMap.get(key);
          existing.unreadCount += 1;
          conversationMap.set(key, existing);
        }
      });
      
      setConversations(Array.from(conversationMap.values()));
    }
    
    setLoading(false);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);
    
    if (hours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="chat-list">
      <div className="chat-list-header">
        <h3>Messages</h3>
      </div>
      
      {loading ? (
        <div className="chat-list-loading">Loading conversations...</div>
      ) : conversations.length === 0 ? (
        <div className="chat-list-empty">
          <FiMessageSquare />
          <p>No messages yet</p>
          <small>When you start a conversation, it will appear here</small>
        </div>
      ) : (
        <div className="chat-list-items">
          {conversations.map((conv) => (
            <div
              key={conv.user.id}
              className={`chat-list-item ${selectedConversationId === conv.user.id ? 'active' : ''}`}
              onClick={() => onSelectConversation(conv)}
            >
              <div className="chat-avatar">
                {conv.user.avatar_url ? (
                  <img src={conv.user.avatar_url} alt={conv.user.full_name} />
                ) : (
                  <div className="avatar-placeholder">
                    {conv.user.full_name?.charAt(0).toUpperCase() || <FiUser />}
                  </div>
                )}
                {conv.unreadCount > 0 && <span className="unread-badge">{conv.unreadCount}</span>}
              </div>
              <div className="chat-info">
                <div className="chat-name">{conv.user.full_name || 'User'}</div>
                <div className="chat-last-message">{conv.lastMessage?.substring(0, 40)}...</div>
                {conv.job && (
                  <div className="chat-job">
                    <FiBriefcase size={10} /> {conv.job.title}
                  </div>
                )}
              </div>
              <div className="chat-time">{formatTime(conv.lastMessageTime)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatList;