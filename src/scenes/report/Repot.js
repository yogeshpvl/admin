import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Typography,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import axios from 'axios';
import { Production_URL } from '../ApiURL';
import { saveAs } from 'file-saver';
function Report() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [subpartners, setSubpartners] = useState([]);
  const [selectedSubpartner, setSelectedSubpartner] = useState('');
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);



    useEffect(() => {
      getSubpartners();
    }, []);
  
    const getSubpartners = () => {
      axios
        .get(Production_URL + "/subpartner/getSubpartners")
        .then((response) => {
          setSubpartners(response.data.data);
        })
        .catch((error) => {
          console.log(error);
        });
    };
  useEffect(() => {
    if (selectedSubpartner) {
      axios.get(Production_URL +`/agent/particulrSubpartnerAgents/${selectedSubpartner}`)
        .then(res => setAgents(res.data.data))
        .catch(err => console.error(err));
    } else {
      setAgents([]);
      setSelectedAgent('');
    }
  }, [selectedSubpartner]);

  const generateReport = async () => {
    if (!fromDate || !toDate) {
      alert("Please select both From and To dates");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(Production_URL+'/admin/report/generate', {
        startDate: fromDate,
        endDate: toDate,
        subpartnerId: selectedSubpartner || undefined,
        agentId: selectedAgent || undefined
      });

      setReportData(response.data.data || []);
    } catch (error) {
      console.error(error);
      alert("Failed to generate report.");
    }

    setLoading(false);
  };

  const downloadCSV = () => {
    if (reportData.length === 0) {
      alert("No report data available to download.");
      return;
    }
  
    // Build CSV Header
    let csv = "Agent Name,Tags Assigned,Wallet Added,Wallet Used,Min KYC,Full KYC,Tag Classes\n";
  
    // Build CSV Rows
    reportData.forEach(item => {
      const tagClasses = Object.entries(item.tagClassSummary || {})
        .map(([cls, count]) => `${cls}: ${count}`)
        .join(" | ");
  
      csv += `${item.agentName || ''},${item.tagsAssigned || 0},${item.walletAdded || 0},${item.walletUtilized || 0},${item.kycSummary?.minKYC || 0},${item.kycSummary?.fullKYC || 0},"${tagClasses}"\n`;
    });
  
    // Create Blob and trigger download
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `Admin_Report_${fromDate}_to_${toDate}.csv`);
  };

  return (
    <Box sx={{ p: 4, maxWidth: '1300px', mx: 'auto' }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        📈 Admin Report
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
            gap: 2,
          }}
        >
          <TextField
            label="From Date"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <TextField
            label="To Date"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <FormControl fullWidth>
            <InputLabel>Subpartner</InputLabel>
            <Select
              value={selectedSubpartner}
              label="Subpartner"
              onChange={(e) => setSelectedSubpartner(e.target.value)}
            >
              <MenuItem value="">Select Subpartner</MenuItem>
              {subpartners?.map((sp) => (
                <MenuItem key={sp._id} value={sp._id}>
                  {sp?.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth disabled={!selectedSubpartner}>
            <InputLabel>Agent</InputLabel>
            <Select
              value={selectedAgent}
              label="Agent"
              onChange={(e) => setSelectedAgent(e.target.value)}
            >
              <MenuItem value="">Select Agent</MenuItem>
              {agents?.map((agent) => (
                <MenuItem key={agent._id} value={agent._id}>
                  {agent.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box textAlign="right" mt={3} display="flex" justifyContent="flex-end" gap={2}>
  <Button
    variant="contained"
    onClick={generateReport}
    disabled={loading}
    sx={{ borderRadius: '8px', px: 4 }}
  >
    {loading ? <CircularProgress size={24} color="inherit" /> : "Generate Report"}
  </Button>

  {reportData.length > 0 && (
    <Button
      variant="outlined"
      onClick={downloadCSV}
      sx={{ borderRadius: '8px', px: 4 }}
    >
      Download Report
    </Button>
  )}
</Box>

      </Paper>

      {/* Table */}
      {reportData.length > 0 && (
        <Paper elevation={3}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#1976d2' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Agent Name</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Subpartner</TableCell>

                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tags Assigned</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Wallet Added</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Wallet Used</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>KYC (Min/Full)</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tag Classes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.map((item, idx) => (
                  <TableRow key={idx} hover>
                    <TableCell>{item.agentName}</TableCell>
                    <TableCell>{item.subpartnerName}</TableCell>

                    <TableCell>{item.tagsAssigned}</TableCell>
                    <TableCell sx={{ color: 'green' }}>₹{item.walletAdded}</TableCell>
                    <TableCell sx={{ color: 'red' }}>₹{item.walletUtilized}</TableCell>
                    <TableCell>{item.kycSummary.minKYC} / {item.kycSummary.fullKYC}</TableCell>
                    <TableCell>
                      {Object.entries(item.tagClassSummary).map(([cls, count]) => (
                        <Typography key={cls} variant="body2">{cls}: {count}</Typography>
                      ))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {!loading && reportData.length === 0 && fromDate && toDate && (
        <Typography textAlign="center" mt={6} color="text.secondary">
          No data found for the selected filters.
        </Typography>
      )}
    </Box>
  );
}

export default Report;
