// import { useState } from "react";
// import { Routes, Route, useLocation } from "react-router-dom";
// import Topbar from "./scenes/global/Topbar";
// import Sidebar from "./scenes/global/Sidebar";
// import Dashboard from "./scenes/dashboard";
// import Form from "./scenes/form";

// import { CssBaseline, ThemeProvider } from "@mui/material";
// import { ColorModeContext, useMode } from "./theme";

// import Subpartners from "./scenes/subpartners/Subpartners";
// import Approvals from "./scenes/approvals/Approvals";

// import FTags from "./scenes/fastTags/FTags";
// import Agents from "./scenes/agents/Agents";
// import Login from "./scenes/auth/Login";
// import Banner from "./scenes/banner/Banner";
// import Details from "./scenes/agents/Details";
// import PaymentReports from "./scenes/PaymentReports";
// import Report from "./scenes/report/Repot";
// import ChangePassword from "./scenes/ChangePassword";
// import SubPartnerReport from "./scenes/SubPartnerReport";
// import ResetPassword from "./scenes/ResetPassword";

// function App() {
//   const [theme, colorMode] = useMode();
//   const [isSidebar, setIsSidebar] = useState(true);
//   const location = useLocation();

//   // Check if the current path is the login page
//   const isLoginPage = location.pathname === "/";

//   return (
//     <ColorModeContext.Provider value={colorMode}>
//       <ThemeProvider theme={theme}>
//         <CssBaseline />
//         <div className="app">
//           {/* Render Sidebar only if it's not the login page */}
//           {!isLoginPage && <Sidebar isSidebar={isSidebar} />}
//           <main className="content">
//             {/* Render Topbar only if it's not the login page */}
//             {!isLoginPage && <Topbar setIsSidebar={setIsSidebar} />}
//             <Routes>
//               <Route path="/" element={<Login />} />
//               <Route path="/reset-password/:token" element={<ResetPassword />} />

//               <Route path="/dashboard" element={<Dashboard />} />
//               <Route path="/subpartners" element={<Subpartners />} />
//               <Route path="/approvals" element={<Approvals />} />
//               <Route path="/agents" element={<Agents />} />
//               <Route path="/form" element={<Form />} />
//               <Route path="/fasttags" element={<FTags />} />
//               <Route path="/banner" element={<Banner />} />
//               <Route path="/paymentreports" element={<PaymentReports />} />
//               <Route path="/reports" element={<Report />} />
//               <Route path="/subreports" element={<SubPartnerReport />} />

//               <Route path="/change-password" element={<ChangePassword />} />


//               <Route path="/agentDetails/:id" element={<Details />} />


//             </Routes>
//           </main>
//         </div>
//       </ThemeProvider>
//     </ColorModeContext.Provider>
//   );
// }

// export default App;
import { useState } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
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
import PaymentReports from "./scenes/PaymentReports";
import Report from "./scenes/report/Repot";
import ChangePassword from "./scenes/ChangePassword";
import SubPartnerReport from "./scenes/SubPartnerReport";
import ResetPassword from "./scenes/ResetPassword";

function App() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);
  const location = useLocation();

  // Define public routes where Sidebar and Topbar should not render
  const isPublicPage =
    location.pathname === "/" ||
    location.pathname === "/agent-login" ||
    location.pathname.startsWith("/reset-password");

  // Get user role from localStorage (admin or agent)
  const admin = JSON.parse(localStorage.getItem("FTadmin")) || { role: null };
  const agent = JSON.parse(localStorage.getItem("FTagent")) || { role: null };
  const userRole = admin.role || agent.role;

  // Define role-based permissions
  const rolePermissions = {
    admin: [
      "/dashboard",
      "/subpartners",
      "/approvals",
      "/agents",
      "/form",
      "/fasttags",
      "/banner",
      "/paymentreports",
      "/reports",
      "/change-password",
      "/agentDetails/:id",
    ],
    subpartner: [
      "/dashboard",
      "/agents",
      "/fasttags",
      "/subreports",
      "/change-password",
      "/agentDetails/:id",
    ],
    manager: [
      "/dashboard",
      "/fasttags",
      "/reports",
      "/change-password",
      "/agentDetails/:id",
    ],
    agent: [
      "/dashboard",
      "/fasttags",
      "/reports",
      "/change-password",
    ],
  };

  // Check if the current route is allowed for the user's role
  const isRouteAllowed = (path) => {
    if (!userRole || !rolePermissions[userRole]) return false;
    if (path.includes(":id")) {
      return rolePermissions[userRole].some((allowedPath) =>
        allowedPath.includes(":id") && path.startsWith(allowedPath.split(":")[0])
      );
    }
    return rolePermissions[userRole].includes(path);
  };

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          {!isPublicPage && <Sidebar isSidebar={isSidebar} />}
          <main className="content">
            {!isPublicPage && <Topbar setIsSidebar={setIsSidebar} />}
            <Routes>
              <Route path="/" element={<Login />} />
            
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route
                path="/dashboard"
                element={
                  userRole && isRouteAllowed("/dashboard") ? (
                    <Dashboard />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              <Route
                path="/subpartners"
                element={
                  userRole && isRouteAllowed("/subpartners") ? (
                    <Subpartners />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              <Route
                path="/approvals"
                element={
                  userRole && isRouteAllowed("/approvals") ? (
                    <Approvals />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              <Route
                path="/agents"
                element={
                  userRole && isRouteAllowed("/agents") ? (
                    <Agents />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              <Route
                path="/form"
                element={
                  userRole && isRouteAllowed("/form") ? (
                    <Form />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              <Route
                path="/fasttags"
                element={
                  userRole && isRouteAllowed("/fasttags") ? (
                    <FTags />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              <Route
                path="/banner"
                element={
                  userRole && isRouteAllowed("/banner") ? (
                    <Banner />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              <Route
                path="/paymentreports"
                element={
                  userRole && isRouteAllowed("/paymentreports") ? (
                    <PaymentReports />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              <Route
                path="/reports"
                element={
                  userRole && isRouteAllowed("/reports") ? (
                    <Report />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              <Route
                path="/subreports"
                element={
                  userRole && isRouteAllowed("/subreports") ? (
                    <SubPartnerReport />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              <Route
                path="/change-password"
                element={
                  userRole && isRouteAllowed("/change-password") ? (
                    <ChangePassword />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              <Route
                path="/agentDetails/:id"
                element={
                  userRole && isRouteAllowed("/agentDetails/:id") ? (
                    <Details />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;