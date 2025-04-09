import { io } from "socket.io-client";
import config from "../config";

class SocketService {
  constructor() {
    this.socket = null;
    this.handlers = new Set();
  }

  connect() {
    if (this.socket) return;

    this.socket = io(config.API_URL, {
      transports: ["websocket"],
      autoConnect: true
    });

    this.socket.on("contactUpdated", (contact) => {
      this.handlers.forEach((handler) => handler(contact));
    });
  }

  // // emited an event to the server
  // emit(event, data) {
  //   this.socket.emit(event, data);
  // }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  subscribe(handler) {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }
}

export const socketService = new SocketService();
