import { useContext, useEffect } from "react";
import socket from "../../socket";
import { AccountContext } from "../../context/userContext";

const useSocketSetup = (setFriendList, setMessages) => {
  const { setUser } = useContext(AccountContext);
  useEffect(() => {
    socket.connect();
    socket.on("friends", (friendList) => {
      setFriendList(friendList);
    });
    socket.on("messages", (messages) => {
      setMessages(messages);
    });
    socket.on("connected", (status, username) => {
      setFriendList((prevFriends) => {
        return [...prevFriends].map((friend) => {
          if (friend.username === username) {
            friend.connected = status;
          }
          return friend;
        });
      });
    });
    socket.on("dm", (message) => {
      setMessages((prevMessages) => [message, ...prevMessages]);
    });
    socket.on("connect_error", () => {
      setUser({});
    });
    return () => {
      socket.off("connect_error");
      socket.off("connected");
      socket.off("friends");
      socket.off("messages");
    };
  }, [setUser, setFriendList]);
};

export default useSocketSetup;
