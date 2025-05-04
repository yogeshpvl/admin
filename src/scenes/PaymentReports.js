import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TextField, Button, MenuItem, Pagination, Stack, Box
} from '@mui/material';

function PaymentReports() {
  const [walletHistory, setWalletHistory] = useState([]);
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const rowsPerPage = 25;

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    fetchWalletHistory();
  }, [currentPage]);

  const fetchAgents = async () => {
    try {
      const res = await axios.get(`http://localhost:8500/agents-list`);
      setAgents(res.data.agents || []);
    } catch (err) {
      console.error("Error fetching agents:", err);
    }
  };

  const fetchWalletHistory = async () => {
    try {
      let query = `?page=${currentPage}&limit=${rowsPerPage}`;
      if (startDate && endDate) {
        query += `&startDate=${new Date(startDate).toISOString()}&endDate=${new Date(endDate).toISOString()}`;
      }
      if (selectedAgent) {
        query += `&agentId=${selectedAgent}`;
      }
      const res = await axios.get(`http://localhost:8500/payments-details${query}`);
      setWalletHistory(res.data.transactions || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching wallet history:", err);
    }
  };

  const handleFilter = () => {
    setCurrentPage(1);
    fetchWalletHistory();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Payment Reports</h1>

      {/* Filters */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
          gap: 2,
          marginBottom: 3,
        }}
      >
        <TextField
          label="From Date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
        <TextField
          label="To Date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
        <TextField
          select
          label="Select Agent"
          value={selectedAgent}
          onChange={(e) => setSelectedAgent(e.target.value)}
          fullWidth
        >
          <MenuItem value="">All Agents</MenuItem>
          {agents.map((agent) => (
            <MenuItem key={agent._id} value={agent._id}>
              {agent.name}
            </MenuItem>
          ))}
        </TextField>
        <Button
          variant="contained"
          onClick={handleFilter}
          fullWidth
          sx={{ height: '56px' }}
        >
          Apply Filters
        </Button>
      </Box>

      {/* Payment Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Payment ID</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Agent Name</TableCell>
              <TableCell>Payment Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {walletHistory.map((entry) => (
              <TableRow key={entry._id}>
                <TableCell>{entry.orderId}</TableCell>
                <TableCell>{entry.paymentId}</TableCell>
                <TableCell>₹{entry.amount}</TableCell>
                <TableCell>{entry.status}</TableCell>
                <TableCell>{entry.agentId?.name || "N/A"}</TableCell>
                <TableCell>{formatDate(entry.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Stack spacing={2} direction="row" justifyContent="center" marginTop={3}>
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={(e, value) => setCurrentPage(value)}
          color="primary"
        />
      </Stack>
    </div>
  );
}

export default PaymentReports;
