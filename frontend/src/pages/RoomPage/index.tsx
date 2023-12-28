import React, { useEffect, useRef, useState } from "react";
import Chat from "../../components/ChatBar";
import WhiteBoard from "../../components/Whiteboard";

interface User {
  name: string;
  userId: string;
  roomId: string;
  host: boolean;
  presenter: boolean;
  socketId: string;
}

interface RoomPageProps {
  user: User | null;
  socket: SocketIOClient.Socket;
  users: User[];
}

const RoomPage: React.FC<RoomPageProps> = ({ user, socket, users }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const [tool, setTool] = useState("pencil");
  const [color, setColor] = useState("black");
  const [brush, setBrush] = useState(2);
  const [elements, setElements] = useState<Element[]>([]);
  const [history, setHistory] = useState<History[]>([]);
  const [openedUserTab, setOpenedUserTab] = useState(false);
  const [openedChatTab, setOpenedChatTab] = useState(false);

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setElements([]);
    }
  };

  const undo = () => {
    setHistory((prevHistory) => [...prevHistory, elements[elements.length - 1]]);
    setElements((prevElements) => prevElements.slice(0, prevElements.length - 1));
  };

  const redo = () => {
    setElements((prevElements) => [...prevElements, history[history.length - 1]]);
    setHistory((prevHistory) => prevHistory.slice(0, prevHistory.length - 1));
  };

  return (
    <div className="row">
      {/* Buttons for opening user and chat tabs */}
      <button
        type="button"
        onClick={() => setOpenedUserTab(true)}
        className="btn btn-dark"
        style={{ display: "block", position: "absolute", top: "5%", left: "5%", height: "40px", width: "100px" }}
      >
        Users
      </button>
      <button
        type="button"
        onClick={() => setOpenedChatTab(true)}
        className="btn btn-primary"
        style={{ display: "block", position: "absolute", top: "5%", left: "10%", height: "40px", width: "100px" }}
      >
        Chat
      </button>

      {/* User tab */}
      {openedUserTab && (
        <div className="position-fixed top=0 left-0 h-100 text-white bg-dark" style={{ width: "250px", left: "0%" }}>
          <button type="button" onClick={() => setOpenedUserTab(false)} className="btn btn-light btn-block w-100 mt-5">
            Close
          </button>
          <div className="w-100 mt-5 pt-5">
            {users.map((usr, index) => (
              <p key={index * 999} className="my-2 text-center w-100">
                {usr.name} {user && user.userId === usr.userId && "(You)"}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Chat tab */}
      {openedChatTab && <Chat setOpenedChatTab={setOpenedChatTab} socket={socket} />}

      {/* Heading */}
      <h1 className="text-center py-5">
        white board sharing app <span className="text-primary">[Users Online: {users.length}]</span>
      </h1>

      {/* Drawing tools */}
      {user?.presenter && (
        <div className="col-md-10 mx-auto gap-3 px-md-5 mb-5 d-flex flex-column flex-md-row align-items-md-center justify-content-between">
          {/* Radio buttons */}
          <div className="d-flex col-md-2 justify-content-between gap-1 mb-3">
            <div className="d-flex gap-1 align-items-center">
              <label htmlFor="pencil">Pencil</label>
              <input
                type="radio"
                name="tool"
                id="pencil"
                checked={tool === "pencil"}
                value="pencil"
                className="mt-1"
                onChange={(e) => setTool(e.target.value)}
              ></input>
            </div>
            <div className="d-flex gap-1 align-items-center">
              <label htmlFor="line">Line</label>
              <input
                type="radio"
                name="tool"
                id="line"
                checked={tool === "line"}
                value="line"
                className="mt-1"
                onChange={(e) => setTool(e.target.value)}
              ></input>
            </div>
            <div className="d-flex gap-1 align-items-center">
              <label htmlFor="rect">Rectangle</label>
              <input
                type="radio"
                name="tool"
                id="rect"
                checked={tool === "rect"}
                value="rect"
                className="mt-1"
                onChange={(e) => setTool(e.target.value)}
              ></input>
            </div>
          </div>

          {/* Select color */}
          <div className="col-md-2 mb-3">
            <div className="d-flex align-items-center">
              <label htmlFor="color">Select Color:</label>
              <input type="color" id="color" className="mt-1 mx-2" value={color} onChange={(e) => setColor(e.target.value)}></input>
            </div>
          </div>

          {/* Brush size */}
          <div className="col-md-2 mb-3">
            <div className="d-flex">
              <label htmlFor="brush">Select size:</label>
              <input
                type="range"
                id="brush"
                className="mt-1 ms-2"
                min="1"
                max="20"
                value={brush}
                onChange={(e) => setBrush(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Undo and redo buttons */}
          <div className="col-md-1 d-flex gap-2 mb-3">
            <button
              className="btn btn-primary mt-1"
              disabled={elements.length === 0}
              onClick={() => undo()}
            >
              Undo
            </button>
            <button
              className="btn btn-outline-primary mt-1"
              disabled={history.length < 1}
              onClick={() => redo()}
            >
              Redo
            </button>
          </div>

          {/* Clear button */}
          <div className="col-md-1 d-flex mb-3">
            <button className="btn btn-danger" onClick={handleClearCanvas}>
              Clear Canvas
            </button>
          </div>
        </div>
      )}

      {/* Whiteboard */}
      <div className="col-md-10 mx-auto mt-4 canvas-box">
        <WhiteBoard
          canvasRef={canvasRef}
          ctxRef={ctxRef}
          elements={elements}
          setElements={setElements}
          tool={tool}
          brushSize={brush}
          color={color}
          user={user}
          socket={socket}
        />
      </div>
    </div>
  );
};

export default RoomPage;
