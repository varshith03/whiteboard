import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuid } from "uuid";

interface User {
  name: string;
  roomId: string;
  userId: string;
  host: boolean;
  presenter: boolean;
}

interface JoinRoomFormProps {
  uuid: () => string;
  socket: SocketIOClient.Socket; 
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const JoinRoomForm: React.FC<JoinRoomFormProps> = ({ uuid, socket, setUser }) => {
  const [roomId, setRoomId] = useState<string>("");
  const [name, setName] = useState<string>("");

  const navigate = useNavigate();

  const handleRoomJoin = (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const roomData: User = {
      name,
      roomId,
      userId: uuid(),
      host: true,
      presenter: false,
    };
    setUser(roomData);
    navigate(`/${roomId}`);
    console.log(roomData);
    socket.emit("userJoined", roomData);
  };

  return (
    <form className="form col-md-12 mt-5">
      <div className="form-group">
        <input
          type="text"
          className="form-control my-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
        />
      </div>
      <div className="form-group">
        <div className="input-group d-flex">
          <input
            type="text"
            className="form-control my-2"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Generate room code"
          />
        </div>
      </div>
      <button
        type="submit"
        onClick={handleRoomJoin}
        className="mt-3 btn btn-primary btn-block form-control"
      >
        Join Room
      </button>
    </form>
  );
};

export default JoinRoomForm;
