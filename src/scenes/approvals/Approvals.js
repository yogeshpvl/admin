import { Box, IconButton, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import { Production_URL } from "../ApiURL";
import moment from "moment";
import EditIcon from "@mui/icons-material/Edit";

const Approvals = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [data, setData] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null); // Holds data of the agent to approve
  const [openModal, setOpenModal] = useState(false); // Modal visibility state

  const columns = [
    { field: "createdAt", headerName: "Created At", flex: 1, renderCell: (params) => (
        <Typography color={colors.grey[100]} sx={{ ml: "5px" }}>
          {moment(params.value).format("DD-MM-YYYY")}
        </Typography>
      )
    },
    { field: "name", headerName: "Name", flex: 1, cellClassName: "name-column--cell" },
    { field: "number", headerName: "Phone Number", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "city", headerName: "City" },
    { field: "state", headerName: "State" },
    { field: "createdBy", headerName: "Created By" },  
    { field: "status", headerName: "Status" },
    {
      field: "actions",
      headerName: "Actions",
      renderCell: (params) => (
        <IconButton color="primary" onClick={() => handleEditClick(params.row)}>
          <EditIcon />
        </IconButton>
      ),
      sortable: false,
      flex: 0.5
    }
  ];

  useEffect(() => {
    getAgents();
  }, []);

  const getAgents = () => {
    axios
      .get(Production_URL + "/agent/pendingStatus")
      .then((response) => {
        setData(response.data.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // Handle edit button click to open modal with agent data
  const handleEditClick = (agent) => {
    setSelectedAgent(agent);
    setOpenModal(true);
  };

  // Handle close modal
  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedAgent(null);
  };

  // Handle approve agent
  const handleApprove = async () => {
    try {
      const response = await axios.put(`${Production_URL}/agent/updateAgentStatus/${selectedAgent._id}`, {
        status: "approved",
      });
      
      if (response.status === 200) {
        getAgents(); // Refresh the agent list
        handleCloseModal(); // Close modal after successful update
      }
    } catch (error) {
      console.error("Error approving agent:", error);
    }
  };

  return (
    <Box m="20px">
      <Header title="Approvals" subtitle="List of pending agents" />
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-cell": { borderBottom: "none" },
          "& .name-column--cell": { color: colors.greenAccent[300] },
          "& .MuiDataGrid-columnHeaders": { backgroundColor: colors.blueAccent[700], borderBottom: "none" },
          "& .MuiDataGrid-virtualScroller": { backgroundColor: colors.primary[400] },
          "& .MuiDataGrid-footerContainer": { borderTop: "none", backgroundColor: colors.blueAccent[700] },
          "& .MuiCheckbox-root": { color: `${colors.greenAccent[200]} !important` },
        }}
      >
        <DataGrid
          checkboxSelection
          rows={data}
          columns={columns}
          getRowId={(row) => row._id}
        />
      </Box>

      {/* Approve Modal */}
      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>Approve Agent</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to approve this agent?</Typography>
          <Typography>Name: {selectedAgent?.name}</Typography>
          <Typography>Email: {selectedAgent?.email}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="secondary">Cancel</Button>
          <Button onClick={handleApprove} color="primary" variant="contained">Approve</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Approvals;
