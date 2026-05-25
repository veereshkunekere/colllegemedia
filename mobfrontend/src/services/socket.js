import {
  io,
} from "socket.io-client";
import API from "./api";


const SOCKET_URL = API.defaults.baseURL.replace("/api","");
console.log("Socket URL:", SOCKET_URL);
let socket = null;

export const connectSocket = ({token}) => {

    if ( socket?.connected ) {
      return socket;
    }

    socket = io(
      SOCKET_URL,

      {
        auth: {
          token,
        },

        transports: [
          "websocket",
        ],
      }
    );


    return socket;
  };

export const getSocket = () => socket;

export const disconnectSocket = () => {
    if (socket) {
      socket.disconnect();

      socket = null;
    }
  };