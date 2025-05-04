import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  List,
  ListItem,
  Divider,
  Grid,
  Paper,
  Stack,
} from "@mui/material";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";


import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
import { useEffect, useState } from "react";
import axios from "axios";
import { Production_URL } from "../ApiURL";

const Details = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const agent = location.state;

  const [wallet, setWallet] = useState(0);
  const [amountToDeduct, setAmountToDeduct] = useState("");
  const [tags, setTags] = useState([]);
  const [walletHistory, setWalletHistory] = useState([]);
  const [openModal, setOpenModal] = useState(false);
const [deductAmount, setDeductAmount] = useState("");
const [deductReason, setDeductReason] = useState("");


  useEffect(() => {
    if (agent?._id) {
   
      fetchAssignedTags();
      fetchWalletHistory();
    }
  }, [agent]);



  const fetchAssignedTags = async () => {
    try {
      const res = await axios.get(`${Production_URL}/tags/agent/${agent._id}`);
      console.log("tags",res.data)
      setTags(res.data || []);
    } catch (err) {
      console.error("Error fetching tags:", err);
    }
  };

  const fetchWalletHistory = async () => {
    try {
      const res = await axios.get(`https://api.aktollpark.com/wallet-details/${agent._id}`);
      setWalletHistory(res.data.transactions || []);
      setWallet(res.data.balance)
    } catch (err) {
      console.error("Error fetching wallet history:", err);
    }
  };


  const createdDaysAgo = moment().diff(moment(agent.createdAt), "days");

  if (!agent) {
    return <Typography variant="h6">No agent data found!</Typography>;
  }

  return (
    <Box m={4}>
        <Box mt={4} textAlign="start">
        <Button variant="outlined" onClick={() => navigate(-1)}>
          Back
        </Button>
      </Box>
      <Grid container spacing={3}>
        {/* LEFT COLUMN - AGENT DETAILS */}
        <Grid item xs={12} md={7}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h4" color="primary" gutterBottom>
              Agent Details
            </Typography>
            <Stack spacing={1}>
              <Typography><strong>Name:</strong> {agent.name}</Typography>
              <Typography><strong>Phone:</strong> {agent.number}</Typography>
              <Typography><strong>Email:</strong> {agent.email}</Typography>
              <Typography><strong>City:</strong> {agent.city}</Typography>
              <Typography><strong>State:</strong> {agent.state}</Typography>
              <Typography><strong>Status:</strong> {agent.status}</Typography>
              <Typography><strong>Created By:</strong> {agent.createdBy}</Typography>
              <Typography>
                <strong>Created At:</strong> {moment(agent.createdAt).format("DD-MM-YYYY")} ({createdDaysAgo} days ago)
              </Typography>
            </Stack>
            <Button
  variant="outlined"
  color={agent.agentStatus === "blocked" ? "success" : "error"}
  onClick={async () => {
    try {
      await axios.put(`${Production_URL}/agent/block/${agent._id}`);
      alert(`Agent ${agent.agentStatus === "blocked" ? "unblocked" : "blocked"} successfully.`);
      agent.agentStatus = agent.agentStatus === "blocked" ? "active" : "blocked"; 
      navigate('/agents'); 
    } catch (error) {
      console.error("Error blocking/unblocking agent:", error);
      alert("Failed to update agent status.");
    }
  }}
>
  {agent.agentStatus === "blocked" ? "Unblock Agent" : "Block Agent"}
</Button>
<Typography><strong>Status:</strong> {agent.agentStatus}</Typography>


            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>Assigned Tags:</Typography>
            <List dense>
              {tags.length > 0 ? (
                tags.map((tag, index) => (
                  <ListItem key={index}>
                    <Typography>
                      <strong>Tag ID:</strong> {tag.kitNo } &nbsp; | &nbsp;
                      <strong>Tag Class:</strong> {tag.tagClass } &nbsp; | &nbsp;

                      <strong>Date:</strong> {moment(tag.updatedAt).format("DD-MM-YYYY")} ({moment().diff(moment(tag.updatedAt), "days")} days)
                      <strong>Status:</strong>  Pending
                   
                    </Typography>
                  </ListItem>
                ))
              ) : (
                <Typography>No tags assigned.</Typography>
              )}
            </List>
          </Card>
        </Grid>

        {/* RIGHT COLUMN - WALLET */}
        <Grid item xs={12} md={5}>
          <Paper elevation={4} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h5" color="primary">Wallet Info</Typography>
            <Typography variant="h6" mt={1}>Balance: ₹{wallet}</Typography>

            <Stack direction="row" spacing={2} alignItems="center" mt={2}>
             
              <Button variant="contained" onClick={() => setOpenModal(true)}>
  Deduct
</Button>

            </Stack>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>Recent Wallet Activity</Typography>
            <TableContainer component={Paper} sx={{ mt: 2 }}>
  <Table size="small">
    <TableHead>
      <TableRow>
        <TableCell><strong>Date</strong></TableCell>
        <TableCell><strong>Amount (₹)</strong></TableCell>
        <TableCell><strong>Status</strong></TableCell>
        <TableCell><strong>Reason</strong></TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {walletHistory.length > 0 ? (
        walletHistory.map((entry, idx) => (
          <TableRow key={idx}>
            <TableCell>{moment(entry.createdAt).format("DD-MM-YYYY HH:mm")}</TableCell>
            <TableCell>₹{entry.amount}</TableCell>
            <TableCell>{entry.status}</TableCell>
            <TableCell>{entry.reason || "-"}</TableCell>

          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={3} align="center">
            No recent transactions.
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
</TableContainer>

          </Paper>
        </Grid>
      </Grid>

      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
  <DialogTitle>Deduct Amount from Wallet</DialogTitle>
  <DialogContent sx={{ minWidth: 400 }}>
    <TextField
      fullWidth
      label="Amount"
      type="number"
      value={deductAmount}
      onChange={(e) => setDeductAmount(e.target.value)}
      margin="normal"
    />
    <TextField
      fullWidth
      label="Reason"
      value={deductReason}
      onChange={(e) => setDeductReason(e.target.value)}
      margin="normal"
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenModal(false)}>Cancel</Button>
    <Button
      variant="contained"
      onClick={async () => {
        if (!deductAmount || isNaN(deductAmount) || deductAmount <= 0) {
          alert("Please enter a valid amount");
          return;
        }

        try {
          await axios.post(
            `${Production_URL}/agent/deductWallet/${agent._id}/${deductAmount}`,
            { reason: deductReason || "Manual deduction" }
          );
          fetchWalletHistory();
          setOpenModal(false);
          setDeductAmount("");
          setDeductReason("");
          alert("Amount deducted successfully!");
        } catch (err) {
          console.error("Error deducting wallet:", err);
          alert("Failed to deduct amount");
        }
      }}
    >
      Submit
    </Button>
  </DialogActions>
</Dialog>

    </Box>
  );
};

export default Details;
