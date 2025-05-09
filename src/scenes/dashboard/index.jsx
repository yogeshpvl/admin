import { Box, Button, IconButton, MenuItem, TextField, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import { mockTransactions } from "../../data/mockData";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import EmailIcon from "@mui/icons-material/Email";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import TrafficIcon from "@mui/icons-material/Traffic";
import Header from "../../components/Header";
import LineChart from "../../components/LineChart";
import StatBox from "../../components/StatBox";
import { Wallet } from "@mui/icons-material";
import axios from "axios";
import { useEffect, useState } from "react";
import moment from "moment";


const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [TotalAmount, setTotalAmount] = useState(0)
  const [WalletHistory, setWalletHistory] = useState([]);
  const [TotalTags, setTotalTags] = useState(0)


  useEffect(() => {
    
    fetchWalletHistory();
    fetchTotalAmount();
    fetchTagsCounts ();
    fetchAgentCounts();
    fetchSubpartnerCounts()
  }, [])
  

    const fetchWalletHistory = async () => {
      try {
        const res = await axios.get(`https://api.aktollpark.com/payments-details`);
        setWalletHistory(res.data.transactions || []);
       
      } catch (err) {
        console.error("Error fetching wallet history:", err);
      }
    };


    const fetchTotalAmount = async () => {
      try {
        const res = await axios.get(`https://api.aktollpark.com/total-amount-success`);

        setTotalAmount(res.data.totalAmount || []);
       
      } catch (err) {
        console.error("Error fetching wallet history:", err);
      }
    };

   
    const fetchTagsCounts = async () => {
      try {
        const res = await axios.get(`https://api.aktollpark.com/api/tags/counts`);

        console.log("res--",res.data)
        setTotalTags(res.data.totalTags || 0);
       
      } catch (err) {
        console.error("Error fetching wallet history:", err);
      }
    };

    const [TotalAgents, setTotalAgents] = useState(0)

    const fetchAgentCounts = async () => {
      try {
        const res = await axios.get(`https://api.aktollpark.com/api/agent/counts`);

        console.log("res--",res.data.count)
        setTotalAgents(res.data.count || 0);
       
      } catch (err) {
        console.error("Error fetching wallet history:", err);
      }
    };

    const [TotalSubpartner, setTotalSubpartner] = useState(0)

    const fetchSubpartnerCounts = async () => {
      try {
        const res = await axios.get(`https://api.aktollpark.com/api/subpartner/subpartnerCount`);

        console.log("res--",res.data.count)
        setTotalSubpartner(res.data.count || 0);
       
      } catch (err) {
        console.error("Error fetching wallet history:", err);
      }
    };
  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />

        <TextField
  name="Bank"
  label="Bank"

  select
  style={{ width: '100px', float: 'right' }}
>
  <MenuItem value="LQQICK">LQQICK</MenuItem>
  <MenuItem value="AXIOS">AXIOS</MenuItem>
  <MenuItem value="IDFC">IDFC</MenuItem>
</TextField>
      </Box>

 

      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="140px"
        gap="20px"
      >
        {/* ROW 1 */}
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={TotalAmount}
            subtitle="Amount"
            progress="0.75"
            
            icon={
              <Wallet
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={TotalAgents}
            subtitle="Agents"
            progress="0.50"
           
            icon={
              <PointOfSaleIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={TotalSubpartner}
            subtitle="Subpartners"
            progress="0.30"
       
            icon={
              <PersonAddIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={TotalTags}
            subtitle="Fast Tags"
            progress="0.80"
           
            icon={
              <TrafficIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>

        {/* ROW 2 */}
         {/* <Box
          gridColumn="span 8"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Box
            mt="25px"
            p="0 30px"
            display="flex "
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography
                variant="h5"
                fontWeight="600"
                color={colors.grey[100]}
              >
                Revenue Generated
              </Typography>
              <Typography
                variant="h3"
                fontWeight="bold"
                color={colors.greenAccent[500]}
              >
                $59,342.32
              </Typography>
            </Box>
           
          </Box>
          <Box height="250px" m="-20px 0 0 0">
            <LineChart isDashboard={true} />
          </Box>
        </Box> */}
     <Box
  width="100%"  // Set width to 100% for full width
   gridColumn="span 8"
  gridRow="span 2"
  backgroundColor={colors.primary[400]}
  overflow="auto"
>
  <Box
    display="flex"
    justifyContent="space-between"
    alignItems="center"
    borderBottom={`4px solid ${colors.primary[500]}`}
    colors={colors.grey[100]}
    p="15px"
  >
    <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
      Recent Transactions
    </Typography>
  </Box>
  {WalletHistory.map((transaction, i) => (
    <Box
      key={`${transaction.orderId}-${i}`}
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      borderBottom={`4px solid ${colors.primary[500]}`}
      p="15px"
    >
      <Box>
        <Typography
          color={colors.grey[500]}
          variant="h5"
          fontWeight="600"
        >
          {transaction.orderId}
        </Typography>
      </Box>
      <Box color={colors.grey[100]}>
        {moment(transaction.createdAt).format("DD-MM-YYYY HH:mm")}
      </Box>
      <Box
        backgroundColor={colors.greenAccent[500]}
        p="5px 10px"
        borderRadius="4px"
      >
        {transaction.amount}.Rs
      </Box>
    </Box>
  ))}
</Box>


       
      </Box>
    </Box>
  );
};

export default Dashboard;
