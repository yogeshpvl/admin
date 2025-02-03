import React, { useState } from "react";
import { Box, Button, TextField, Typography, Paper, useTheme } from "@mui/material";
import { styled } from "@mui/system";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Production_URL } from "../ApiURL";

// Move LoginContainer and other styled components outside the functional component
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

const Login = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ email: "", password: "" });

  // Handle input change
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
        navigate("/dashboard");
      }
    } catch (error) {
      console.log(error);
      const errorMessage =
      error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : "Login failed. Please try again.";
    alert(errorMessage); // Display the error message in an alert
      
    }
  };

  return (
    <Box>
      <LoginContainer style={{ backgroundColor: theme.palette.background.paper }}>
        <Title style={{ color: theme.palette.primary.main }}>Welcome</Title>
        <Typography variant="body2" color="textSecondary" mb={4}>
          Please enter your login details
        </Typography>

        {/* Email Field */}
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

        {/* Password Field */}
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

        <StyledButton variant="contained" color="primary" onClick={handleLogin}>
          Login
        </StyledButton>
      </LoginContainer>
    </Box>
  );
};

export default Login;
