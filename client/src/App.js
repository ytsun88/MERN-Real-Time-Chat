import Home from "./components/Home/Home";
import Login from "./components/Login/Login";
import SignUp from "./components/Login/SignUp";
import ToggleColorMode from "./components/ToggleColorMode";
import { Routes, Route } from "react-router-dom";
import UserContext from "./context/userContext";
import socket from "./socket";

function App() {
  socket.connect();
  return (
    <>
      <UserContext>
        <ToggleColorMode />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<SignUp />} />
        </Routes>
      </UserContext>
    </>
  );
}

export default App;
