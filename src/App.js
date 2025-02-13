import { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard";
import Form from "./scenes/form";

import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";

import Subpartners from "./scenes/subpartners/Subpartners";
import Approvals from "./scenes/approvals/Approvals";

import FTags from "./scenes/fastTags/FTags";
import Agents from "./scenes/agents/Agents";
import Login from "./scenes/auth/Login";
import Banner from "./scenes/banner/Banner";
import Details from "./scenes/agents/Details";

function App() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);
  const location = useLocation();

  // Check if the current path is the login page
  const isLoginPage = location.pathname === "/";

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          {/* Render Sidebar only if it's not the login page */}
          {!isLoginPage && <Sidebar isSidebar={isSidebar} />}
          <main className="content">
            {/* Render Topbar only if it's not the login page */}
            {!isLoginPage && <Topbar setIsSidebar={setIsSidebar} />}
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/subpartners" element={<Subpartners />} />
              <Route path="/approvals" element={<Approvals />} />
              <Route path="/agents" element={<Agents />} />
              <Route path="/form" element={<Form />} />
              <Route path="/fasttags" element={<FTags />} />
              <Route path="/banner" element={<Banner />} />
              <Route path="/agentDetails/:id" element={<Details />} />


            </Routes>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
