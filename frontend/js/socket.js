/* ============================================================
   TrackConnect — Socket.IO Client Wrapper
   ============================================================ */

let _socket = null;

const SocketClient = {
  connect() {
    if (_socket && _socket.connected) return _socket;

    const token = Auth.getToken();
    if (!token) return null;

    _socket = io("https://3467-2401-4900-88eb-16c-4165-d666-48c3-2a2b.https://trackconnect.onrender.com-free.app", {(
      "https://himself-finder-pace-placed.trycloudflare.com",
      {
        auth: {
          token: token,
        },
        transports: ["websocket", "polling"],
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      }
    );

    _socket.on("connect", () => {
      console.log("Socket connected:", _socket.id);
    });

    _socket.on("connect_error", (err) => {
      console.error("Socket error:", err.message);
    });

    _socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    return _socket;
  },

  get() {
    return _socket;
  },

  on(event, handler) {
    if (_socket) _socket.on(event, handler);
  },

  off(event, handler) {
    if (_socket) _socket.off(event, handler);
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