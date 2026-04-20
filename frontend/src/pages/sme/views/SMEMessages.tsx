import { useState } from 'react'
import { FiSearch, FiSend, FiPaperclip } from 'react-icons/fi'

const conversations = [
  {
    id: 1,
    name: 'Adeola Okonkwo',
    avatar: 'AO',
    lastMessage: 'I can deliver the logo in 3 days',
    time: '2m ago',
    unread: 2,
    active: true,
  },
  {
    id: 2,
    name: 'Chidi Nwosu',
    avatar: 'CN',
    lastMessage: 'Thank you for the opportunity!',
    time: '1h ago',
    unread: 0,
    active: false,
  },
  {
    id: 3,
    name: 'Funmi Bello',
    avatar: 'FB',
    lastMessage: 'Can we discuss the project scope?',
    time: '3h ago',
    unread: 1,
    active: false,
  },
]

const messages = [
  { id: 1, sender: 'them', text: 'Hello! I saw your job post for logo design.', time: '10:00 AM' },
  { id: 2, sender: 'me', text: 'Hi Adeola! Yes, I need a modern logo for my bakery.', time: '10:02 AM' },
  { id: 3, sender: 'them', text: 'I have experience in brand identity and logo design. I can deliver in 3 days.', time: '10:05 AM' },
  { id: 4, sender: 'me', text: 'That sounds great! What is your rate?', time: '10:07 AM' },
  { id: 5, sender: 'them', text: 'I can deliver the logo in 3 days for ₦12,000. This includes 3 concepts and 2 revisions.', time: '10:10 AM' },
]

const SMEMessages = () => {
  const [activeConvo, setActiveConvo] = useState(conversations[0])
  const [message, setMessage] = useState('')
  const [search, setSearch] = useState('')

  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h1 className="view-title">Messages</h1>
          <p className="view-sub">Chat with students about your jobs</p>
        </div>
      </div>

      <div className="chat-layout">
        {/* CONVERSATIONS LIST */}
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

        {/* CHAT WINDOW */}
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
            <button
              className="chat-send"
              onClick={() => setMessage('')}
            >
              <FiSend />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SMEMessages