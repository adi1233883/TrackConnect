
require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const { Server } = require("socket.io");

const { connectDB } = require("./config/db");
const { verifyToken } = require("./utils/jwt");
const User = require("./models/User");

const authRoutes = require("./routes/authRoutes");
const contactRoutes = require("./routes/contactRoutes");
const requestRoutes = require("./routes/requestRoutes");
const locationRoutes = require("./routes/locationRoutes");
const profileRoutes = require("./routes/profileRoutes");

const {
  errorHandler,
  notFound,
} = require("./middleware/errorMiddleware");

const app = express();
const server = http.createServer(app);

app.set("trust proxy", 1);

const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "http://3467-2401-4900-88eb-16c-4165-d666-48c3-2a2b.ngrok-free.app.1.2:5500"
].filter(Boolean);

// ---------------- CORS ----------------

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("Blocked Origin:", origin);

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// ---------------- Security ----------------

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

// ---------------- Body Parser ----------------

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ---------------- Static ----------------

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// ---------------- Rate Limit ----------------

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
});

app.use(limiter);

// ---------------- Socket.IO ----------------

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.set("io", io);

// ---------------- Routes ----------------

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/profile", profileRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "TrackConnect API is running",
  });
});

// ---------------- Socket Authentication ----------------

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    const decoded = verifyToken(token);

    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new Error("User not found"));
    }

    socket.userId = user.id;
    socket.user = user;

    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

// ---------------- Socket Events ----------------

io.on("connection", (socket) => {
  console.log("User connected:", socket.userId);

  socket.join(`user_${socket.userId}`);

  socket.emit("connected", {
    success: true,
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.userId);
  });
});

// ---------------- Error Middleware ----------------

app.use(notFound);
app.use(errorHandler);

// ---------------- Start Server ----------------

async function startServer() {
  try {
    await connectDB();

    server.listen(PORT, "0.0.0.0", () => {
      console.log("================================");
      console.log("✅ MySQL Connected");
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(
        `🌐 Health Check: http://localhost:${PORT}/api/health`
      );
      console.log("================================");
    });
  } catch (err) {
    console.error("Startup Error:", err);
    process.exit(1);
  }
}

startServer();

// ---------------- Process Handlers ----------------

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});

