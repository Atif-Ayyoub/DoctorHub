const supabase = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const NotificationService = {
  create: async (user_id, title, message) => {
    const id = uuidv4();
    await supabase.from('notifications').insert({ id, user_id, title, message });
  },
  getForUser: async (user_id) => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(50);
    return data || [];
  },
  markRead: async (id, user_id) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id).eq('user_id', user_id);
  },
  markAllRead: async (user_id) => {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user_id);
  },
  getUnreadCount: async (user_id) => {
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user_id)
      .eq('is_read', false);
    return count || 0;
  }
};

module.exports = NotificationService;
