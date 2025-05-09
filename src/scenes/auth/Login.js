import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { styled } from "@mui/system";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Production_URL } from "../ApiURL";

const LoginContainer = styled(Paper)({
  padding: "40px",
  maxWidth: "400px",
  margin: "80px auto",
  textAlign: "center",
  borderRadius: "12px",
  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
});

const Title = styled(Typography)({
  marginBottom: "20px",
  fontSize: "24px",
  fontWeight: 600,
});

const StyledButton = styled(Button)({
  marginTop: "20px",
  padding: "10px",
  fontSize: "16px",
  fontWeight: "bold",
  width: "100%",
});

const ForgotPasswordLink = styled(Typography)({
  marginTop: "10px",
  cursor: "pointer",
  color: "#1976d2",
  "&:hover": {
    textDecoration: "underline",
  },
});

const Login = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotError, setForgotError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const config = {
        url: "/subpartner/adminLogin",
        method: "post",
        baseURL: Production_URL,
        headers: { "content-type": "application/json" },
        data: loginData,
      };
      let res = await axios(config);
      if (res.status === 200) {
        localStorage.setItem("FTadmin", JSON.stringify(res.data.data));
        localStorage.setItem("token", res.data.token);
        console.log("User Data:", res.data.data);
        console.log("Role:", res.data.data.role);
  
        if (res.data.data.role === "admin") {
          navigate("/dashboard");
        } else if (res.data.data.role === "subpartner") {
          navigate("/dashboard1");
        } else {
         
          navigate("/ fasttags");
          // console.error("Unknown role:", res.data.data.role);
          // alert("Invalid role. Please contact support.");
        }
      }
    } catch (error) {
      const errorMessage =
        error.response && error.response.data && error.response.data.error
          ? error.response.data.error
          : "Login failed. Please try again.";
      alert(errorMessage);
    }
  };

  const handleForgotPasswordOpen = () => setForgotPasswordOpen(true);
  const handleForgotPasswordClose = () => {
    setForgotPasswordOpen(false);
    setForgotEmail("");
    setForgotError("");
  };

  const handleForgotEmailChange = (e) => {
    setForgotEmail(e.target.value);
    setForgotError("");
  };

  const handleForgotPasswordSubmit = async () => {
    if (!forgotEmail) {
      setForgotError("Email is required");
      return;
    }
    try {
      const config = {
        url: "/subpartner/reset-password-request",
        method: "post",
        baseURL: Production_URL,
        headers: { "content-type": "application/json" },
        data: { email: forgotEmail },
      };
      const res = await axios(config);
      if (res.status === 200) {
        alert("Password reset link sent to your email.");
        handleForgotPasswordClose();
      }
    } catch (error) {
      const errorMessage =
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : "Failed to send reset link. Please try again.";
      setForgotError(errorMessage);
    }
  };

  return (
    <Box>
      <LoginContainer style={{ backgroundColor: theme.palette.background.paper }}>
        <Title style={{ color: theme.palette.primary.main }}>Welcome</Title>
        <Typography variant="body2" color="textSecondary" mb={4}>
          Please enter your login details
        </Typography>

        <TextField
          label="Email"
          name="email"
          variant="outlined"
          fullWidth
          margin="normal"
          value={loginData.email}
          onChange={handleChange}
          autoComplete="off"
        />

        <TextField
          label="Password"
          name="password"
          type="password"
          variant="outlined"
          fullWidth
          margin="normal"
          value={loginData.password}
          onChange={handleChange}
          autoComplete="off"
        />

        <ForgotPasswordLink onClick={handleForgotPasswordOpen}>
          Forgot Password?
        </ForgotPasswordLink>

        <StyledButton variant="contained" color="primary" onClick={handleLogin}>
          Login
        </StyledButton>
      </LoginContainer>

      <Dialog open={forgotPasswordOpen} onClose={handleForgotPasswordClose} maxWidth="sm" fullWidth>
        <DialogTitle>Forgot Password</DialogTitle>
        <DialogContent>
          <Typography mb={2}>Enter your email to receive a password reset link.</Typography>
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            value={forgotEmail}
            onChange={handleForgotEmailChange}
            error={!!forgotError}
            helperText={forgotError}
            autoComplete="off"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleForgotPasswordClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleForgotPasswordSubmit} variant="contained" color="primary">
            Send Reset Link
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Login;