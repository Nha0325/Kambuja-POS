let io;

module.exports = {
  // ចាប់ផ្តើម Socket (ហៅចេញពី server.js នៅពេល Server ចាប់ផ្តើមរត់)
  init: (server) => {
    const { Server } = require("socket.io");
    io = new Server(server, {
      cors: {
        origin: "*", // អនុញ្ញាតឲ្យ Frontend ពីគ្រប់ Port អាចតភ្ជាប់បាន
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"]
      }
    });

    // ពេលមាន Client (Frontend) តភ្ជាប់ចូលមក
    io.on("connection", (socket) => {
      console.log("🟢 ភ្ជាប់ Socket ជោគជ័យ (Client ID: " + socket.id + ")");

      // ពេល Client សុំចូលបន្ទប់ (ឧទាហរណ៍៖ បន្ទប់ ADMIN_MANAGER ឬ CASHIER)
      socket.on("joinRoom", (room) => {
        socket.join(room);
        console.log(`🏠 Socket ${socket.id} បានចូលបន្ទប់ (Room): ${room}`);
      });

      // ពេល Client បិទ Browser ឬផ្តាច់ការតភ្ជាប់
      socket.on("disconnect", () => {
        console.log("🔴 Socket បានផ្តាច់ការភ្ជាប់ (Client ID: " + socket.id + ")");
      });
    });

    return io;
  },
  
  // ទាញយក Socket ទៅប្រើនៅកន្លែងផ្សេង (ដូចជាពេលចង់បញ្ជូន Notification)
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io អត់ទាន់ដំណើរការទេ! សូមឆែកមើល Server។");
    }
    return io;
  }
};
