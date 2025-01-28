const WebSocket = require("ws");

const server = new WebSocket.Server({ port: 8080 }); // Signaling server on port 8080
const peers = {}; // Object to keep track of connected peers

server.on("connection", (socket) => {
  console.log("New client connected");

  // Listen for messages from clients
  socket.on("message", (message) => {
    const data = JSON.parse(message);

    switch (data.type) {
      case "register":
        // Register the peer with a unique code
        peers[data.code] = socket;
        socket.peerCode = data.code;
        console.log(`Registered peer: ${data.code}`);
        break;

      case "offer":
      case "answer":
      case "candidate":
        // Forward signaling data to the target peer
        const targetSocket = peers[data.target];
        if (targetSocket) {
          targetSocket.send(JSON.stringify(data));
        }
        break;

      default:
        console.log("Unknown message type:", data.type);
    }
  });

  // Handle client disconnection
  socket.on("close", () => {
    if (socket.peerCode) {
      delete peers[socket.peerCode];
      console.log(`Peer disconnected: ${socket.peerCode}`);
    }
  });
});

console.log("WebSocket signaling server running on ws://localhost:8080");
