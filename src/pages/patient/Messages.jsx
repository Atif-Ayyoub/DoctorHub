import { useState, useEffect, useMemo, useRef } from 'react';
import API from '../../api/axios';
import Sidebar from '../../components/common/Sidebar';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Check, CheckCheck, Send, Calendar, FileText, Pill, Search, MessageSquare } from 'lucide-react';

const sidebarLinks = [
  { to: '/patient', icon: Calendar, label: 'Dashboard' },
  { to: '/patient/appointments', icon: Calendar, label: 'Appointments' },
  { to: '/patient/book', icon: Search, label: 'Find & Book Doctor' },
  { to: '/patient/prescriptions', icon: Pill, label: 'Prescriptions' },
  { to: '/patient/history', icon: FileText, label: 'Medical History' },
  { to: '/patient/messages', icon: MessageSquare, label: 'Messages' },
];

export default function Messages() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingMessages, setPendingMessages] = useState([]);
  const bottomRef = useRef();

  const fetchMessages = () => {
    API.get('/messages').then(r => setMessages(r.data.data || [])).catch(() => {});
  };

  useEffect(() => {
    fetchMessages();
    // Fetch appointments to find doctors
    API.get('/appointments/my').then(r => {
      const appts = r.data.data || [];
      const confirmed = appts.filter(a => ['confirmed','completed'].includes(a.status));
      const unique = [...new Map(confirmed
        .filter(a => a.doctor_user_id)
        .map(a => [a.doctor_user_id, { id: a.doctor_user_id, name: a.doctor_name }])
      ).values()];
      setDoctors(unique);
      if (unique.length > 0) setSelectedDoctor((current) => current || unique[0]);
    }).catch(() => {});
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, selectedDoctor]);

  const savedThread = useMemo(() => messages.filter(m =>
    (m.sender_id === user?.id && m.receiver_id === selectedDoctor?.id) ||
    (m.receiver_id === user?.id && m.sender_id === selectedDoctor?.id)
  ), [messages, selectedDoctor?.id, user?.id]);
  const thread = [...savedThread, ...pendingMessages.filter(m => m.receiver_id === selectedDoctor?.id)];

  useEffect(() => {
    if (!selectedDoctor?.id || savedThread.length === 0) return;
    const hasUnread = savedThread.some((m) => m.sender_id === selectedDoctor.id && m.receiver_id === user?.id && !m.is_read);
    if (!hasUnread) return;

    API.patch('/messages/read', { other_user_id: selectedDoctor.id }).then(() => {
      setMessages((current) => current.map((m) => (
        m.sender_id === selectedDoctor.id && m.receiver_id === user?.id ? { ...m, is_read: true } : m
      )));
    }).catch(() => {});
  }, [selectedDoctor?.id, savedThread, user?.id]);

  const send = async (e) => {
    e.preventDefault();
    if (!body.trim() || !selectedDoctor) return;
    setLoading(true);
    const text = body.trim();
    const tempId = `pending-${Date.now()}`;
    setPendingMessages((current) => [...current, {
      id: tempId,
      sender_id: user?.id,
      receiver_id: selectedDoctor.id,
      message_body: text,
      created_at: new Date().toISOString(),
      pending: true,
    }]);
    setBody('');
    try {
      await API.post('/messages', { receiver_id: selectedDoctor.id, message_body: text });
      setPendingMessages((current) => current.filter((m) => m.id !== tempId));
      fetchMessages();
    } catch (err) {
      setPendingMessages((current) => current.filter((m) => m.id !== tempId));
      setBody(text);
      toast.error(err.response?.data?.message || 'Cannot send message');
    }
    finally { setLoading(false); }
  };

  const MessageTicks = ({ message }) => {
    if (message.sender_id !== user?.id) return null;
    if (message.pending) return <Check size={15} className="message-ticks" />;
    return <CheckCheck size={16} className={`message-ticks ${message.is_read ? 'seen' : ''}`} />;
  };

  return (
    <div className="dashboard-layout">
      <Sidebar links={sidebarLinks} />
      <main className="dashboard-main">
        <div className="dashboard-header"><h1>Messages</h1></div>
        <div className="messages-layout">
          <div className="contacts-panel">
            <h3>Your Doctors</h3>
            {doctors.length === 0 ? (
              <div className="contact-empty">
                <p className="muted">Messages open after a confirmed appointment.</p>
              </div>
            ) : (
              doctors.map(d => (
                <div key={d.id} className={`contact-item ${selectedDoctor?.id === d.id ? 'active' : ''}`}
                  onClick={() => setSelectedDoctor(d)}>
                  <div className="contact-avatar">{d.name?.charAt(0)}</div>
                  <span>{d.name}</span>
                </div>
              ))
            )}
          </div>
          <div className="chat-panel">
            {selectedDoctor ? (
              <>
                <div className="chat-header">
                  <div className="contact-avatar">{selectedDoctor.name?.charAt(0)}</div>
                  <strong>{selectedDoctor.name}</strong>
                </div>
                <div className="chat-messages">
                  {thread.length === 0 ? <p className="muted center">No messages yet. Say hello!</p> : (
                    thread.map(m => (
                      <div key={m.id} className={`message-bubble ${m.sender_id === user?.id ? 'sent' : 'received'}`}>
                        <p>{m.message_body}</p>
                        <span className="message-meta">
                          {new Date(m.created_at).toLocaleTimeString()}
                          <MessageTicks message={m} />
                        </span>
                      </div>
                    ))
                  )}
                  <div ref={bottomRef} />
                </div>
                <form className="chat-input" onSubmit={send}>
                  <input value={body} onChange={e => setBody(e.target.value)}
                    placeholder="Type a message..." maxLength={2000} />
                  <button type="submit" disabled={loading || !body.trim()}>
                    <Send size={18} />
                  </button>
                </form>
              </>
            ) : (
              <div className="empty-state"><MessageSquare size={48} /><p>Select a doctor to start chatting after confirmation.</p></div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
