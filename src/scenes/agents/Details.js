import { Box, Card, CardContent, Typography, Button } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";

const Details = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const agent = location.state; 

  if (!agent) {
    return <Typography variant="h6">No agent data found!</Typography>;
  }

  return (
    <Box m="20px">
      <Card sx={{ maxWidth: 500, mx: "auto", p: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h4" color="primary" gutterBottom>
            {agent.name}
          </Typography>
          <Typography variant="body1">
            <strong>Phone:</strong> {agent.number}
          </Typography>
          <Typography variant="body1">
            <strong>Email:</strong> {agent.email}
          </Typography>
          <Typography variant="body1">
            <strong>City:</strong> {agent.city}
          </Typography>
          <Typography variant="body1">
            <strong>State:</strong> {agent.state}
          </Typography>
          <Typography variant="body1">
            <strong>Created By:</strong> {agent.createdBy}
          </Typography>
          <Typography variant="body1">
            <strong>Status:</strong> {agent.status}
          </Typography>
          <Typography variant="body1">
            <strong>Created At:</strong> {moment(agent.createdAt).format("DD-MM-YYYY")}
          </Typography>
        </CardContent>

        <Button
          variant="contained"
          color="secondary"
          sx={{ mt: 2 }}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
      </Card>
    </Box>
  );
};

export default Details;
