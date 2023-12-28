interface User {
    name: string;
    userId: string;
    roomId: string;
    host: boolean;
    presenter: boolean;
    socketId: string;
  }
  
  const users: User[] = [];
  
  const addUser = ({ name, userId, roomId, host, presenter, socketId }: User) => {
    const user: User = { name, userId, roomId, host, presenter, socketId };
    users.push(user);
    return users.filter((user) => user.roomId === roomId);
  };
  
  const removeUser = (id: string) => {
    const index = users.findIndex((user) => user.socketId === id);
    if (index !== -1) {
      return users.splice(index, 1)[0];
    }
  };
  
  const getUser = (id: string) => {
    return users.find((user) => user.socketId === id);
  };
  
  const getUserInRoom = (roomId: string) => {
    return users.filter((user) => user.roomId === roomId);
  };
  
  export {
    addUser,
    removeUser,
    getUser,
    getUserInRoom
  };
  