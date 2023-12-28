import express, { Application, Request, Response } from "express";
import { createServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { addUser, removeUser, getUser } from "./utils/users";

const app: Application = express();
const server = createServer(app);
const io: SocketIOServer = new SocketIOServer(server);

app.get("/", (req: Request, res: Response) => {
    res.send("This is MERN real-time sharing app official server by Varshith");
});

let roomIdGlobal: string | undefined;
let imgURLGlobal: string | undefined;

io.on("connection", (socket: Socket) => {
    socket.on("userJoined", (data) => {
        const { name, userId, roomId, host, presenter } = data;
        roomIdGlobal = roomId;
        socket.join(roomId);
        const users = addUser({ name, userId, roomId, host, presenter, socketId: socket.id });
        socket.emit("userIsJoined", { success: true, users });

        socket.broadcast.to(roomId).emit("userJoinedMessageBroadcasted", name);
        socket.broadcast.to(roomId).emit("allUsers", users);
        socket.broadcast.to(roomId).emit("whiteBoardDataResponse", {
            imgURL: imgURLGlobal,
        });
    });

    socket.on("whiteboardData", (data) => {
        imgURLGlobal = data;
        socket.broadcast.to(roomIdGlobal).emit("whiteBoardDataResponse", {
            imgURL: data,
        });
    });

    socket.on("message", (data) => {
        const { message } = data;
        const user = getUser(socket.id);
        if (user) {
            removeUser(socket.id);
            socket.broadcast.to(roomIdGlobal).emit("messageResponse", { message, name: user.name });
        }
    });

    socket.on("disconnect", () => {
        const user = getUser(socket.id);
        if (user) {
            removeUser(socket.id);
            socket.broadcast.to(roomIdGlobal).emit("userLeftMessageBroadcasted", user.name);
        }
    });
});

const port: number = parseInt(process.env.PORT || "5000", 10);
server.listen(port, () => console.log(`Server is running on http://localhost:${port}`));
