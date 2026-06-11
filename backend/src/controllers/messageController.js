const supabase = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const AppointmentModel = require('../models/Appointment');
const PatientModel = require('../models/Patient');
const DoctorModel = require('../models/Doctor');
const UserModel = require('../models/User');
const { success, error } = require('../utils/responseHandler');

const sendMessage = async (req, res) => {
  try {
    const { receiver_id, message_body } = req.body;
    if (!receiver_id || !message_body) return error(res, 'receiver_id and message_body are required', 422);
    if (message_body.length < 1 || message_body.length > 2000) return error(res, 'Message body must be 1-2000 characters', 422);
    const sender = await UserModel.findById(req.user.id);
    const receiver = await UserModel.findById(receiver_id);
    if (!receiver) return error(res, 'Receiver not found', 404);
    if (sender.role === 'patient') {
      const patient = await PatientModel.findByUserId(req.user.id);
      const receiverDoc = await DoctorModel.findByUserId(receiver_id);
      if (!receiverDoc || !patient) return error(res, 'Invalid receiver', 400);
      const confirmed = await AppointmentModel.hasConfirmedAppointment(patient.id, receiverDoc.id);
      if (!confirmed) return error(res, 'Messaging is only available after a confirmed consultation', 403);
    }
    const id = uuidv4();
    await supabase.from('messages').insert({ id, sender_id: req.user.id, receiver_id, message_body });
    return success(res, { id }, 'Message sent', 201);
  } catch (e) {
    console.error(e);
    return error(res, 'Failed to send message', 500);
  }
};

const getMyMessages = async (req, res) => {
  const { data } = await supabase
    .from('messages')
    .select(`*, sender:users!messages_sender_id_fkey(full_name), receiver:users!messages_receiver_id_fkey(full_name)`)
    .or(`sender_id.eq.${req.user.id},receiver_id.eq.${req.user.id}`)
    .order('created_at', { ascending: true });
  const messages = (data || []).map(m => ({
    ...m,
    sender_name: m.sender?.full_name,
    receiver_name: m.receiver?.full_name,
    sender: undefined,
    receiver: undefined
  }));
  return success(res, messages);
};

const getThreads = async (req, res) => {
  const { data } = await supabase
    .from('messages')
    .select(`*, sender:users!messages_sender_id_fkey(full_name), receiver:users!messages_receiver_id_fkey(full_name)`)
    .or(`sender_id.eq.${req.user.id},receiver_id.eq.${req.user.id}`)
    .order('created_at', { ascending: false });
  const messages = (data || []).map(m => ({
    ...m,
    sender_name: m.sender?.full_name,
    receiver_name: m.receiver?.full_name,
    sender: undefined,
    receiver: undefined
  }));
  return success(res, messages);
};

const markThreadRead = async (req, res) => {
  try {
    const { other_user_id } = req.body;
    if (!other_user_id) return error(res, 'other_user_id is required', 422);
    const otherUser = await UserModel.findById(other_user_id);
    if (!otherUser) return error(res, 'User not found', 404);

    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('sender_id', other_user_id)
      .eq('receiver_id', req.user.id)
      .eq('is_read', false);

    return success(res, {}, 'Messages marked as read');
  } catch (e) {
    console.error(e);
    return error(res, 'Failed to mark messages as read', 500);
  }
};

module.exports = { sendMessage, getMyMessages, getThreads, markThreadRead };
