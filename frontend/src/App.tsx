// App.tsx

import React, { useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Forms from './components/Forms';
import RoomPage from './pages/RoomPage';
import AuthForm from './components/AuthForm';

// Define User type/interface
interface User {
  name: string;
  userId: string;
  roomId: string;
  host: boolean;
  presenter: boolean;
}

const server = 'http://localhost:5000';
const connectionOptions = {
  'force new connection': true,
  reconnectionAttempts: 'Infinity',
  timeout: 10000,
  transports: ['websocket'],
};

const socket = io(server, connectionOptions);

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    socket.on('userIsJoined', (data) => {
      if (data.success) {
        console.log('userJoined');
        setUsers(data.users);
      } else {
        console.log('userJoined error');
      }
    });

    socket.on('allUsers', (data) => {
      setUsers(data);
    });

    socket.on('userJoinedMessageBroadcasted', (data) => {
      toast.success(`${data} joined the room`);
    });

    socket.on('userLeftMessageBroadcasted', (data) => {
      toast.info(`${data} left the room`);
    });

    return () => {
      // Clean up event listeners when component unmounts
      socket.off('userIsJoined');
      socket.off('allUsers');
      socket.off('userJoinedMessageBroadcasted');
      socket.off('userLeftMessageBroadcasted');
    };
  }, []);

  const uuid = () => {
    const S4 = () => (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    return S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4();
  };

  const handleRegisterClick = () => {
    navigate('/auth-form');
  };

  return (
    <div className="container">
      <ToastContainer />
      <Routes>
        <Route
          path="/"
          element={<Forms uuid={uuid} socket={socket} setUser={setUser}></Forms>}
        ></Route>

        <Route path="/auth-form" element={<AuthForm />}></Route>

        <Route
          path="/:roomId"
          element={<RoomPage user={user} socket={socket} users={users}></RoomPage>}
        ></Route>
      </Routes>
      <div className="registration-container">
        <div className="glowing-text">
          Please register to start using the whiteboard
        </div>
        <a href="#" className="register-button" onClick={handleRegisterClick}>
          Register
        </a>
      </div>
    </div>
  );
};

export default App;
