import { useState, useEffect, useMemo, useRef } from 'react';
import API from '../../api/axios';
import Sidebar from '../../components/common/Sidebar';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Check, CheckCheck, Send, Calendar, Pill, MapPin, Clock, Users, MessageSquare, User } from 'lucide-react';

const sidebarLinks = [
  { to: '/doctor', icon: Calendar, label: 'Dashboard' },
  { to: '/doctor/appointments', icon: Calendar, label: 'Appointments' },
  { to: '/doctor/prescriptions', icon: Pill, label: 'Prescriptions' },
  { to: '/doctor/clinics', icon: MapPin, label: 'Clinics' },
  { to: '/doctor/schedules', icon: Clock, label: 'Schedules' },
  { to: '/doctor/assistants', icon: Users, label: 'Assistants' },
  { to: '/doctor/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/doctor/profile', icon: User, label: 'Profile' },
];

export default function DoctorMessages() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingMessages, setPendingMessages] = useState([]);
  const bottomRef = useRef();

  const fetch = () => API.get('/messages').then(r => setMessages(r.data.data || [])).catch(() => {});

  useEffect(() => {
    fetch();
    API.get('/appointments/doctor').then(r => {
      const appts = (r.data.data || []).filter(a => ['confirmed','completed'].includes(a.status));
      const unique = [...new Map(appts
        .filter(a => a.patient_user_id)
        .map(a => [a.patient_user_id, { id: a.patient_user_id, name: a.patient_name }])
      ).values()];
      setPatients(unique);
    }).catch(() => {});
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, selected]);

  const contactMap = Object.fromEntries(patients.map((patient) => [patient.id, patient.name]));
  messages.forEach(m => {
    const other = m.sender_id === user?.id ? m.receiver_id : m.sender_id;
    const name = m.sender_id === user?.id ? m.receiver_name : m.sender_name;
    if (!contactMap[other]) contactMap[other] = name;
  });

  const savedThread = useMemo(() => selected ? messages.filter(m =>
    (m.sender_id === user?.id && m.receiver_id === selected) ||
    (m.receiver_id === user?.id && m.sender_id === selected)
  ) : [], [messages, selected, user?.id]);
  const thread = selected ? [...savedThread, ...pendingMessages.filter(m => m.receiver_id === selected)] : [];

  useEffect(() => {
    if (!selected || savedThread.length === 0) return;
    const hasUnread = savedThread.some((m) => m.sender_id === selected && m.receiver_id === user?.id && !m.is_read);
    if (!hasUnread) return;

    API.patch('/messages/read', { other_user_id: selected }).then(() => {
      setMessages((current) => current.map((m) => (
        m.sender_id === selected && m.receiver_id === user?.id ? { ...m, is_read: true } : m
      )));
    }).catch(() => {});
  }, [selected, savedThread, user?.id]);

  const send = async (e) => {
    e.preventDefault();
    if (!body.trim() || !selected) return;
    setLoading(true);
    const text = body.trim();
    const tempId = `pending-${Date.now()}`;
    setPendingMessages((current) => [...current, {
      id: tempId,
      sender_id: user?.id,
      receiver_id: selected,
      message_body: text,
      created_at: new Date().toISOString(),
      pending: true,
    }]);
    setBody('');
    try {
      await API.post('/messages', { receiver_id: selected, message_body: text });
      setPendingMessages((current) => current.filter((m) => m.id !== tempId));
      fetch();
    } catch (err) {
      setPendingMessages((current) => current.filter((m) => m.id !== tempId));
      setBody(text);
      toast.error(err.response?.data?.message || 'Cannot send');
    }
    finally { setLoading(false); }
  };

  const contacts = Object.entries(contactMap).map(([id, name]) => ({ id, name }));

  const MessageTicks = ({ message }) => {
    if (message.sender_id !== user?.id) return null;
    if (message.pending) return <Check size={15} className="message-ticks" />;
    return <CheckCheck size={16} className={`message-ticks ${message.is_read ? 'seen' : ''}`} />;
  };

  return (
    <div className="dashboard-layout">
      <Sidebar links={sidebarLinks} />
      <main className="dashboard-main">
        <div className="dashboard-header"><h1>Patient Messages</h1></div>
        <div className="messages-layout">
          <div className="contacts-panel">
            <h3>Conversations</h3>
            {contacts.length === 0 ? (
              <div className="contact-empty">
                <p className="muted">Confirmed patients will appear here so you can start a conversation.</p>
              </div>
            ) : (
              contacts.map(c => (
                <div key={c.id} className={`contact-item ${selected === c.id ? 'active' : ''}`}
                  onClick={() => setSelected(c.id)}>
                  <div className="contact-avatar">{c.name?.charAt(0)}</div>
                  <span>{c.name}</span>
                </div>
              ))
            )}
          </div>
          <div className="chat-panel">
            {selected ? (
              <>
                <div className="chat-header">
                  <div className="contact-avatar">{contactMap[selected]?.charAt(0)}</div>
                  <strong>{contactMap[selected]}</strong>
                </div>
                <div className="chat-messages">
                  {thread.map(m => (
                    <div key={m.id} className={`message-bubble ${m.sender_id === user?.id ? 'sent' : 'received'}`}>
                      <p>{m.message_body}</p>
                      <span className="message-meta">
                        {new Date(m.created_at).toLocaleTimeString()}
                        <MessageTicks message={m} />
                      </span>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>
                <form className="chat-input" onSubmit={send}>
                  <input value={body} onChange={e => setBody(e.target.value)} placeholder="Type a reply..." maxLength={2000} />
                  <button type="submit" disabled={loading || !body.trim()}><Send size={18} /></button>
                </form>
              </>
            ) : (
              <div className="empty-state"><MessageSquare size={48} /><p>Select a patient to send a message.</p></div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
