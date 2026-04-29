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
    if (userId) {
      fetchConversations();
      
      const subscription = supabase
        .channel('chat-list')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'messages' }, 
          () => { fetchConversations(); }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [userId]);

  const fetchConversations = async () => {
    if (!userId) return;
    
    setLoading(true);
    
    try {
      // Simply get all messages where user is involved
      const { data: allMessages, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching messages:", error);
        setConversations([]);
        setLoading(false);
        return;
      }

      if (!allMessages || allMessages.length === 0) {
        console.log("No messages found");
        setConversations([]);
        setLoading(false);
        return;
      }

      // Get unique user IDs that this user has chatted with
      const otherUserIds = [...new Set(
        allMessages.map(msg => msg.sender_id === userId ? msg.receiver_id : msg.sender_id)
      )];

      console.log("Other user IDs:", otherUserIds);

      // Get profiles for these users
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', otherUserIds);

      const profileMap: Record<string, any> = {};
      profiles?.forEach(p => { profileMap[p.id] = p; });

      // Build conversation list
      const conversationList = [];
      
      for (const otherId of otherUserIds) {
        // Get all messages with this specific user
        const { data: userMessages } = await supabase
          .from('messages')
          .select('*')
          .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${userId})`)
          .order('created_at', { ascending: false });

        if (userMessages && userMessages.length > 0) {
          const lastMessage = userMessages[0];
          const unreadMessages = userMessages.filter(m => m.receiver_id === userId && !m.is_read);
          
          // Get job info if available
          let jobTitle = null;
          if (lastMessage.job_id) {
            const { data: job } = await supabase
              .from('jobs')
              .select('title')
              .eq('id', lastMessage.job_id)
              .single();
            jobTitle = job?.title;
          }

          conversationList.push({
            userId: otherId,
            name: profileMap[otherId]?.full_name || 'User',
            lastMessage: lastMessage.message,
            lastMessageTime: lastMessage.created_at,
            unreadCount: unreadMessages.length,
            jobTitle: jobTitle
          });
        }
      }

      // Sort by most recent message
      conversationList.sort((a, b) => {
        return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
      });

      console.log("Conversations:", conversationList);
      setConversations(conversationList);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);
    
    if (hours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (hours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="chat-list">
        <div className="chat-list-header">
          <h3>Messages</h3>
        </div>
        <div className="chat-list-loading">Loading conversations...</div>
      </div>
    );
  }

  const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);

  return (
    <div className="chat-list">
      <div className="chat-list-header">
        <h3>Messages</h3>
        {totalUnread > 0 && <span className="total-unread-badge">{totalUnread}</span>}
      </div>
      
      {conversations.length === 0 ? (
        <div className="chat-list-empty">
          <FiMessageSquare />
          <p>No messages yet</p>
          <small>When you send or receive a message, it will appear here</small>
        </div>
      ) : (
        <div className="chat-list-items">
          {conversations.map((conv) => (
            <div
              key={conv.userId}
              className={`chat-list-item ${selectedConversationId === conv.userId ? 'active' : ''}`}
              onClick={() => onSelectConversation({
                user: { id: conv.userId, full_name: conv.name },
                job: { title: conv.jobTitle }
              })}
            >
              <div className="chat-avatar">
                <div className="avatar-placeholder">
                  {conv.name?.charAt(0).toUpperCase() || <FiUser />}
                </div>
                {conv.unreadCount > 0 && <span className="unread-badge">{conv.unreadCount}</span>}
              </div>
              <div className="chat-info">
                <div className="chat-name">{conv.name}</div>
                <div className="chat-last-message">
                  {conv.lastMessage.substring(0, 50)}
                </div>
                {conv.jobTitle && (
                  <div className="chat-job">
                    <FiBriefcase size={10} /> {conv.jobTitle}
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