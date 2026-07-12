const axios = require('axios');
const PushToken = require('../models/PushToken');

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const isExpoToken = (token) => /^ExponentPushToken\[[^\]]+\]$/.test(token) || /^ExpoPushToken\[[^\]]+\]$/.test(token);

async function sendPushMessages(messages) {
  const validMessages = messages.filter((message) => isExpoToken(message.to));
  for (let index = 0; index < validMessages.length; index += 100) {
    const chunk = validMessages.slice(index, index + 100);
    try {
      const response = await axios.post(EXPO_PUSH_URL, chunk, {
        headers: { Accept: 'application/json', 'Accept-Encoding': 'gzip, deflate', 'Content-Type': 'application/json' },
        timeout: 10000,
      });
      const tickets = Array.isArray(response.data?.data) ? response.data.data : [response.data?.data];
      const invalidTokens = tickets.map((ticket, i) => ticket?.details?.error === 'DeviceNotRegistered' ? chunk[i]?.to : null).filter(Boolean);
      if (invalidTokens.length) await PushToken.updateMany({ token: { $in: invalidTokens } }, { $set: { isActive: false } });
    } catch (error) {
      console.error('Expo push request failed:', error.response?.data || error.message);
    }
  }
}

async function sendToUsers(userIds, notification) {
  const tokens = await PushToken.find({ userId: { $in: userIds }, isActive: true }).select('token');
  return sendPushMessages(tokens.map(({ token }) => ({ to: token, sound: 'default', priority: 'high', channelId: 'default', ...notification })));
}

module.exports = { sendPushMessages, sendToUsers };
