import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { FiSend, FiUser, FiBriefcase, FiMessageSquare } from "react-icons/fi";

interface ChatWindowProps {
  currentUserId: string;
  otherUser: any;
  job: any;
  onMessageSent?: () => void;
}

const ChatWindow = ({ currentUserId, otherUser, job, onMessageSent }: ChatWindowProps) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentUserId && otherUser?.id) {
      fetchMessages();
      
      const subscription = supabase
        .channel(`chat-${currentUserId}-${otherUser.id}`)
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'messages' }, 
          () => { fetchMessages(); }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [currentUserId, otherUser?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    if (!currentUserId || !otherUser?.id) return;
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUser.id}),and(sender_id.eq.${otherUser.id},receiver_id.eq.${currentUserId})`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
      } else {
        setMessages(data || []);
        
        // Mark unread messages as read
        const unreadMessages = (data || []).filter(m => m.receiver_id === currentUserId && !m.is_read);
        if (unreadMessages.length > 0) {
          await supabase
            .from('messages')
            .update({ is_read: true })
            .in('id', unreadMessages.map(m => m.id));
          
          if (onMessageSent) onMessageSent();
        }
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending || !currentUserId || !otherUser?.id) return;
    
    setSending(true);
    
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: currentUserId,
          receiver_id: otherUser.id,
          job_id: job?.id || null,
          message: newMessage.trim(),
          is_read: false
        });

      if (error) {
        console.error("Error sending message:", error);
        alert("Failed to send message: " + error.message);
      } else {
        setNewMessage("");
        await fetchMessages();
        if (onMessageSent) onMessageSent();
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!otherUser) {
    return (
      <div className="chat-window-empty">
        <FiMessageSquare />
        <p>Select a conversation to start chatting</p>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-window-header">
        <div className="chat-user-info">
          <div className="chat-avatar">
            <div className="avatar-placeholder">
              {otherUser.full_name?.charAt(0).toUpperCase() || <FiUser />}
            </div>
          </div>
          <div>
            <div className="chat-user-name">{otherUser.full_name || 'User'}</div>
            {job?.title && (
              <div className="chat-job-info">
                <FiBriefcase size={12} /> {job.title}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="chat-messages">
        {loading ? (
          <div className="chat-loading">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="chat-empty">
            <p>No messages yet</p>
            <small>Send a message to start the conversation!</small>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`message ${msg.sender_id === currentUserId ? 'message-sent' : 'message-received'}`}
            >
              <div className="message-bubble">
                <p>{msg.message}</p>
                <span className="message-time">{formatTime(msg.created_at)}</span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          rows={1}
        />
        <button onClick={sendMessage} disabled={sending || !newMessage.trim()}>
          <FiSend />
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;