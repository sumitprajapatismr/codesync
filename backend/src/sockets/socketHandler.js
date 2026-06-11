const Room = require('../models/Room');
const Message = require('../models/Message');
const Session = require('../models/Session');
const User = require('../models/User');

// Keep track of active users in rooms
// roomId -> Map(socketId -> userObject)
const activeRoomUsers = new Map();

// Helper to log activities in interview sessions
const logInterviewActivity = async (sessionId, action, userId, details) => {
  try {
    if (sessionId) {
      await Session.findByIdAndUpdate(sessionId, {
        $push: {
          activityLog: {
            action,
            user: userId,
            details,
            timestamp: new Date(),
          },
        },
      });
    }
  } catch (err) {
    console.error('Error logging interview activity:', err);
  }
};

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // JOIN ROOM
    socket.on('join-room', async ({ roomId, user }) => {
      if (!roomId || !user) return;

      socket.join(roomId);
      console.log(`User ${user.name} (${user._id}) joined room ${roomId}`);

      // Track active users
      if (!activeRoomUsers.has(roomId)) {
        activeRoomUsers.set(roomId, new Map());
      }
      activeRoomUsers.get(roomId).set(socket.id, user);

      // Fetch current room state from DB
      const room = await Room.findOne({ roomId }).populate('problem');
      let currentCode = {};
      let selectedLanguage = 'javascript';
      let interviewSessionId = null;

      if (room) {
        currentCode = Object.fromEntries(room.currentCode || new Map());
        selectedLanguage = room.selectedLanguage;
        interviewSessionId = room.interviewSession;

        // Log join action for interview mode
        if (room.isInterview && room.interviewSession) {
          await logInterviewActivity(
            room.interviewSession,
            'join',
            user._id,
            `${user.name} joined the room`
          );
        }
      }

      // Send current state to the joining user
      socket.emit('room-state', {
        currentCode,
        selectedLanguage,
        users: Array.from(activeRoomUsers.get(roomId).values()),
      });

      // Broadcast user joined to other room members
      socket.to(roomId).emit('user-joined', {
        user,
        users: Array.from(activeRoomUsers.get(roomId).values()),
      });
    });

    // CODE CHANGE
    socket.on('code-change', async ({ roomId, code, language, user }) => {
      if (!roomId || !user) return;

      // Broadcast changes immediately to others in the room
      socket.to(roomId).emit('code-update', { code, language });

      // Throttle DB saves (save periodically or keep active in memory. For simplicity, save directly to Room)
      try {
        const updateField = `currentCode.${language}`;
        await Room.findOneAndUpdate(
          { roomId },
          { 
            $set: { [updateField]: code, selectedLanguage: language }
          },
          { new: true, upsert: true }
        );
      } catch (err) {
        console.error('Error updating code in database:', err);
      }
    });

    // CURSOR POSITION MOVE
    socket.on('cursor-move', ({ roomId, position, user }) => {
      if (!roomId || !user) return;

      // Broadcast cursor changes
      socket.to(roomId).emit('cursor-update', {
        userId: user._id,
        name: user.name,
        position, // { lineNumber, column }
      });
    });

    // TYPING INDICATOR
    socket.on('typing', ({ roomId, isTyping, user }) => {
      if (!roomId || !user) return;
      socket.to(roomId).emit('user-typing', {
        userId: user._id,
        name: user.name,
        isTyping,
      });
    });

    // CHAT MESSAGE
    socket.on('chat-message', async ({ roomId, message, user }) => {
      if (!roomId || !message || !user) return;

      try {
        // Save chat message
        const chatMsg = await Message.create({
          roomId,
          sender: user._id,
          message,
        });

        const formattedMsg = {
          _id: chatMsg._id,
          roomId,
          message: chatMsg.message,
          sender: {
            _id: user._id,
            name: user.name,
            avatar: user.avatar,
          },
          timestamp: chatMsg.timestamp,
        };

        // Emit to all users in the room (including sender)
        io.to(roomId).emit('new-chat-message', formattedMsg);

        // Log activity if interview
        const room = await Room.findOne({ roomId });
        if (room && room.isInterview && room.interviewSession) {
          await logInterviewActivity(
            room.interviewSession,
            'chat',
            user._id,
            `${user.name} sent message: "${message.substring(0, 30)}..."`
          );
        }
      } catch (err) {
        console.error('Error sending chat message:', err);
      }
    });

    // SAVE VERSION SNAPSHOT
    socket.on('save-version', async ({ roomId, code, language, user }) => {
      if (!roomId || !user) return;

      try {
        const room = await Room.findOne({ roomId });
        if (room) {
          room.versionHistory.push({
            code,
            language,
            timestamp: new Date(),
            user: user._id,
          });
          await room.save();

          // Fetch updated versions and notify all room members
          const updatedRoom = await Room.findOne({ roomId }).populate('versionHistory.user', 'name avatar');
          io.to(roomId).emit('version-saved', updatedRoom.versionHistory);

          if (room.isInterview && room.interviewSession) {
            await logInterviewActivity(
              room.interviewSession,
              'code_save',
              user._id,
              `${user.name} saved a new code version snapshot`
            );
          }
        }
      } catch (err) {
        console.error('Error saving code snapshot:', err);
      }
    });

    // RUN CODE SYNC STATUS
    socket.on('executing-code', ({ roomId, status, user }) => {
      if (!roomId) return;
      socket.to(roomId).emit('execution-status', { status, user });
    });

    socket.on('execution-finished', ({ roomId, result, user }) => {
      if (!roomId) return;
      socket.to(roomId).emit('execution-result', { result, user });
    });

    // DISCONNECT
    socket.on('disconnecting', async () => {
      const rooms = socket.rooms;
      for (const roomId of rooms) {
        if (activeRoomUsers.has(roomId) && activeRoomUsers.get(roomId).has(socket.id)) {
          const user = activeRoomUsers.get(roomId).get(socket.id);
          activeRoomUsers.get(roomId).delete(socket.id);

          // Notify others in room
          socket.to(roomId).emit('user-left', {
            user,
            users: Array.from(activeRoomUsers.get(roomId).values()),
          });

          // Log in interview logs if applicable
          const room = await Room.findOne({ roomId });
          if (room && room.isInterview && room.interviewSession) {
            await logInterviewActivity(
              room.interviewSession,
              'leave',
              user._id,
              `${user.name} disconnected/left the room`
            );
          }

          if (activeRoomUsers.get(roomId).size === 0) {
            activeRoomUsers.delete(roomId);
          }
        }
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};
