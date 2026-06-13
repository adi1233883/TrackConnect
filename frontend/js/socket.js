```javascript
/* ============================================================
   TrackConnect — Socket.IO Client Wrapper
   ============================================================ */

let _socket = null;

const SocketClient = {
  connect() {
    // Return existing connection if already connected
    if (_socket && _socket.connected) {
      return _socket;
    }

    const token = Auth.getToken();

    if (!token) {
      console.warn("No authentication token found.");
      return null;
    }

    // Connect to Render backend
  _socket = io("https://trackconnect-backend.onrender.com", {
      auth: {
        token: token,
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      timeout: 10000,
    });

    _socket.on("connect", () => {
      console.log("✅ Socket connected:", _socket.id);
    });

    _socket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err.message);
    });

    _socket.on("disconnect", (reason) => {
      console.log("⚠️ Socket disconnected:", reason);
    });

    return _socket;
  },

  get() {
    return _socket;
  },

  on(event, handler) {
    if (_socket) {
      _socket.on(event, handler);
    }
  },

  off(event, handler) {
    if (_socket) {
      _socket.off(event, handler);
    }
  },

  emit(event, data) {
    if (_socket && _socket.connected) {
      _socket.emit(event, data);
    }
  },

  disconnect() {
    if (_socket) {
      _socket.disconnect();
      _socket = null;
    }
  },
};
```
