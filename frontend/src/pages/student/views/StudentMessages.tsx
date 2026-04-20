import { useState } from 'react'
import { FiSearch, FiSend, FiPaperclip } from 'react-icons/fi'

const conversations = [
  {
    id: 1,
    name: 'Temi Fashion',
    avatar: 'TF',
    lastMessage: 'When can you start?',
    time: '5m ago',
    unread: 1,
    active: true,
  },
  {
    id: 2,
    name: 'Bola Adeyemi',
    avatar: 'BA',
    lastMessage: 'Please send me your portfolio',
    time: '2h ago',
    unread: 0,
    active: false,
  },
  {
    id: 3,
    name: 'Kunle Ventures',
    avatar: 'KV',
    lastMessage: 'Great work! Payment released.',
    time: '1d ago',
    unread: 0,
    active: false,
  },
]

const messages = [
  { id: 1, sender: 'them', text: 'Hi! I saw your bid on my social media job.', time: '9:00 AM' },
  { id: 2, sender: 'me', text: 'Hello! Yes, I am very interested in managing your Instagram page.', time: '9:02 AM' },
  { id: 3, sender: 'them', text: 'Great! Can you show me some of your previous work?', time: '9:05 AM' },
  { id: 4, sender: 'me', text: 'Sure! I have managed pages with over 10k followers. I will send my portfolio now.', time: '9:07 AM' },
  { id: 5, sender: 'them', text: 'When can you start?', time: '9:10 AM' },
]

const StudentMessages = () => {
  const [activeConvo, setActiveConvo] = useState(conversations[0])
  const [message, setMessage] = useState('')
  const [search, setSearch] = useState('')

  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h1 className="view-title">Messages</h1>
          <p className="view-sub">Chat with your clients</p>
        </div>
      </div>

      <div className="chat-layout">
        <div className="chat-sidebar">
          <div className="chat-search">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="conversations-list">
            {conversations
              .filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
              .map(convo => (
                <div
                  key={convo.id}
                  className={`conversation-item ${activeConvo.id === convo.id ? 'convo-active' : ''}`}
                  onClick={() => setActiveConvo(convo)}
                >
                  <div className="convo-avatar">{convo.avatar}</div>
                  <div className="convo-info">
                    <div className="convo-top">
                      <p className="convo-name">{convo.name}</p>
                      <span className="convo-time">{convo.time}</span>
                    </div>
                    <p className="convo-last">{convo.lastMessage}</p>
                  </div>
                  {convo.unread > 0 && (
                    <span className="convo-unread">{convo.unread}</span>
                  )}
                </div>
              ))}
          </div>
        </div>

        <div className="chat-window">
          <div className="chat-window-header">
            <div className="convo-avatar">{activeConvo.avatar}</div>
            <div>
              <p className="chat-window-name">{activeConvo.name}</p>
              <p className="chat-window-status">
                <span className={`status-dot ${activeConvo.active ? 'online' : ''}`}></span>
                {activeConvo.active ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>

          <div className="chat-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`message ${msg.sender === 'me' ? 'message-me' : 'message-them'}`}>
                <div className="message-bubble">{msg.text}</div>
                <span className="message-time">{msg.time}</span>
              </div>
            ))}
          </div>

          <div className="chat-input-wrap">
            <button className="chat-attach"><FiPaperclip /></button>
            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && setMessage('')}
            />
            <button className="chat-send" onClick={() => setMessage('')}>
              <FiSend />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentMessages