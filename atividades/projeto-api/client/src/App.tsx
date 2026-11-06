//import { useState } from "react";
import "./index.css";
import Login from "./pages/Login";
import Profile from "./pages/Profile"
import { Routes, Route } from "react-router-dom";

function App() {

  return (
    <Routes>
      <Route path="/" element={<Login />}></Route>
      <Route path="/Profile" element={<Profile />}></Route>
    </Routes>
  );
}

export default App;
