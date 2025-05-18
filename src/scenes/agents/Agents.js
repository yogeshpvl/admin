import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  MenuItem,
  IconButton,
  FormControl,
  InputLabel,
  Select
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import axios from "axios";
import { Production_URL } from "../ApiURL";
import moment from "moment";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";
import { RemoveRedEyeRounded } from "@mui/icons-material";

const Agents = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [open, setOpen] = useState(false);
  const [data, setData] = useState([]);
  const [admins, setAdmins] = useState([]); // State for admins list
  const admin = JSON.parse(localStorage.getItem('FTadmin'));

  console.log("admins",admins)
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState(null);
  const [filterName, setFilterName] = useState("");
  const [filterCreatedBy, setFilterCreatedBy] = useState("");

  const [newAgent, setNewAgent] = useState({
    name: "",
    state: "",
    city: "",
    number: "",
    email: "",
    password: "",
    createdBy: admin.name,
    adminID: admin._id
  });

  const columns = [
    {
      field: "createdAt", headerName: "Created At", flex: 1, renderCell: (params) => (
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
    { field: "createdBy", headerName: "TL name" },
    { field: "status", headerName: "Status" },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <>
          <IconButton color="primary" onClick={() => handleEdit(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton color="secondary" onClick={() => navigate(`/agentDetails/${params.row._id}`, { state: params.row })}>
            <RemoveRedEyeRounded />
          </IconButton>
          <IconButton color="secondary" onClick={() => handleDelete(params.row._id)}>
            <DeleteIcon />
          </IconButton>
        </>
      ),
      sortable: false,
    }
  ];

  useEffect(() => {
    getAgents();
    getAdmins(); // Fetch admins on component mount
  }, []);

  const getAgents = () => {
    axios.get(
      Production_URL + (admin.role === "admin"
        ? "/agent/getAllAgents"
        : `/agent/particulrSubpartnerAgents/${admin._id}`)
    )
      .then((response) => {
        setData(response.data.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getAdmins = () => {
    // Replace with your actual API endpoint for fetching admins
    axios.get(`${Production_URL}/subpartner/getSubpartners`)
      .then((response) => {
        setAdmins(response.data.data || []); // Assuming response.data.data contains admins
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!newAgent.name) newErrors.name = "Name is required";
    if (!newAgent.number) newErrors.number = "Phone Number is required";
    if (!newAgent.email) newErrors.email = "Email is required";
    if (!newAgent.password && !isEditing) newErrors.password = "Password is required";
    if (!newAgent.city) newErrors.city = "City is required";
    if (!newAgent.state) newErrors.state = "State is required";
    if (!newAgent.createdBy) newErrors.createdBy = "TL name is required";
    if (!newAgent.adminID) newErrors.adminID = "TL ID is required";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const config = {
        url: isEditing ? `/agent/editAgent/${selectedAgentId}` : "/agent/agentSignUp",
        method: isEditing ? "put" : "post",
        baseURL: Production_URL,
        headers: { "content-type": "application/json" },
        data: newAgent,
      };
      const res = await axios(config);
      if (res.status === 200 || res.status === 201) {
        setOpen(false);
        setIsEditing(false);
        setSelectedAgentId(null);
        getAgents();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed. Please try again.";
      alert(errorMessage);
    }
  };

  const handleEdit = (agent) => {
    setNewAgent({
      name: agent.name,
      state: agent.state,
      city: agent.city,
      number: agent.number,
      email: agent.email,
      password: "",
      createdBy: agent.createdBy,
      adminID: agent.adminID
    });
    setSelectedAgentId(agent._id);
    setIsEditing(true);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this agent?");
    if (!confirmDelete) return;
    try {
      await axios.delete(`${Production_URL}/agent/deleteAgent/${id}`);
      getAgents();
    } catch (error) {
      alert("Failed to delete agent. Please try again.");
    }
  };

  const handleOpen = () => {
    setNewAgent({
      name: "",
      state: "",
      city: "",
      number: "",
      email: "",
      password: "",
      createdBy: admin.name,
      adminID: admin._id
    });
    setErrors({});
    setIsEditing(false);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "adminID") {
      const selectedAdmin = admins.find(admin => admin._id === value);
      setNewAgent((prev) => ({
        ...prev,
        adminID: value,
        createdBy: selectedAdmin ? selectedAdmin.name : prev.createdBy
      }));
    } else {
      setNewAgent((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <Box m="20px">
      <Header title="Agent" subtitle="List of Agents" />

      <Button variant="contained" color="primary" onClick={handleOpen}>
        {isEditing ? "Edit Agent" : "Create Agent"}
      </Button>

      {/* Filter Inputs */}
      <Box display="flex" gap="20px" my={2}>
        <TextField
          label="Filter by Agent Name"
          variant="outlined"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          size="small"
        />
        <TextField
          label="Filter by TL Name"
          variant="outlined"
          value={filterCreatedBy}
          onChange={(e) => setFilterCreatedBy(e.target.value)}
          size="small"
        />
      </Box>

      {/* Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? "Edit Agent" : "Create New Agent"}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap="20px" mt="10px">
            <TextField
              name="name"
              label="Name"
              fullWidth
              required
              value={newAgent.name}
              onChange={handleInputChange}
              error={!!errors.name}
              helperText={errors.name}
            />
            <TextField
              name="number"
              label="Phone Number"
              fullWidth
              required
              value={newAgent.number}
              onChange={handleInputChange}
              error={!!errors.number}
              helperText={errors.number}
            />
            <TextField
              name="email"
              label="Email"
              fullWidth
              required
              value={newAgent.email}
              onChange={handleInputChange}
              error={!!errors.email}
              helperText={errors.email}
            />
            <TextField
              name="password"
              label="Password"
              fullWidth
              type="password"
              value={newAgent.password}
              onChange={handleInputChange}
              error={!!errors.password}
              helperText={errors.password}
            />
             <TextField
              name="city"
              label="City"
              fullWidth
              type="city"
              value={newAgent.city}
              onChange={handleInputChange}
              error={!!errors.city}
              helperText={errors.city}
            />
           <TextField
              name="state"
              label="state"
              fullWidth
              type="state"
              value={newAgent.state}
              onChange={handleInputChange}
              error={!!errors.state}
              helperText={errors.state}
            />
          
            <FormControl fullWidth  error={!!errors.adminID}>
              <InputLabel>TL Name</InputLabel>
              <Select
                name="adminID"
                label="TL Name"
                value={newAgent.adminID}
                onChange={handleInputChange}
              >
                {admin.role === "admin"  ?
                 admins.map((admin) => (
                  <MenuItem key={admin._id} value={admin._id}>
                    {admin.name}
                  </MenuItem>
                ))
                :
                 
                  <MenuItem  value={admin._id}>
                    {admin.name}
                  </MenuItem>
               
              }
               
              </Select>
              {errors.adminID && <Typography color="error" variant="caption">{errors.adminID}</Typography>}
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleRegister}>
            {isEditing ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DataGrid */}
      <Box m="40px 0 0 0" height="75vh"
        sx={{
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-cell": { borderBottom: "none" },
          "& .name-column--cell": { color: colors.greenAccent[300] },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.grey[100]} !important`,
          },
        }}
      >
        <DataGrid
          checkboxSelection
          rows={data.filter(agent =>
            agent.name.toLowerCase().includes(filterName.toLowerCase()) &&
            agent.createdBy.toLowerCase().includes(filterCreatedBy.toLowerCase())
          )}
          columns={columns}
          getRowId={(row) => row._id}
        />
      </Box>
    </Box>
  );
};

export default Agents;