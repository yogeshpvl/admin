import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/system";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Production_URL } from "./ApiURL";


const ResetContainer = styled(Paper)({
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

const ResetPassword = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { token } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const userType = queryParams.get("type"); // subpartner or agent

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { newPassword, confirmPassword } = formData;

    // Validate inputs
    if (!newPassword || !confirmPassword) {
      setError("Both fields are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    // Determine the reset endpoint based on userType
    const endpoint =
      userType === "subpartners"
        ? "/subpartner/reset-password"
        : userType === "agent"
        ? "/agent/reset-password"
        : null;

    if (!endpoint) {
      setError("Invalid user type. Please use a valid reset link.");
      return;
    }

    try {
      const config = {
        url: endpoint,
        method: "post",
        baseURL: Production_URL,
        headers: { "content-type": "application/json" },
        data: {
          resetToken: token,
          newPassword,
        },
      };

      const res = await axios(config);
      if (res.status === 200) {
        setSuccess("Password reset successfully. Redirecting to login...");
        setTimeout(() => {
          navigate(userType === "subpartner" ? "/" : "/agent-login");
        }, 2000);
      }
    } catch (error) {
      const errorMessage =
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : "Failed to reset password. Please try again.";
      setError(errorMessage);
    }
  };

  return (
    <Box>
      <ResetContainer style={{ backgroundColor: theme.palette.background.paper }}>
        <Title style={{ color: theme.palette.primary.main }}>
          Reset Password
        </Title>
        <Typography variant="body2" color="textSecondary" mb={4}>
          Enter your new password below.
        </Typography>

        <TextField
          label="New Password"
          name="newPassword"
          type="password"
          variant="outlined"
          fullWidth
          margin="normal"
          value={formData.newPassword}
          onChange={handleChange}
          error={!!error}
          autoComplete="new-password"
        />

        <TextField
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          variant="outlined"
          fullWidth
          margin="normal"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={!!error}
          helperText={error}
          autoComplete="new-password"
        />

        {success && (
          <Typography color="success.main" mt={2}>
            {success}
          </Typography>
        )}

        <StyledButton
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={success}
        >
          Reset Password
        </StyledButton>
      </ResetContainer>
    </Box>
  );
};

export default ResetPassword;