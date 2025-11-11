import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home, Resize } from "./pages";

const App = () => {
    return (
        <BrowserRouter basename="/All_Files_Viewer">
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/resize" element={<Resize />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
