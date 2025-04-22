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
  InputBase
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import axios from "axios";
import { Production_URL } from "../ApiURL";
import moment from "moment";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import Header from "../../components/Header";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";

const Subpartners = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [open, setOpen] = useState(false);
  const [data, setData] = useState([]);
  const [errors, setErrors] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubpartner, setSelectedSubpartner] = useState(null);

  const initialSubpartnerState = {
    name: "",
    state: "",
    city: "",
    number: "",
    email: "",
    password: "",
    accessLevel: "",
    role:"",
    type:""
  };
  
  const [newSubpartner, setNewSubpartner] = useState(initialSubpartnerState);

  const columns = [
    {
      field: "createdAt",
      headerName: "Created At",
      renderCell: (params) => (
        <Typography color={colors.grey[100]} sx={{ ml: "5px" }}>
          {moment(params.value).format("DD-MM-YYYY")}
        </Typography>
      ),
      flex: 1,
    },
    { field: "name", headerName: "Name", flex: 1, cellClassName: "name-column--cell" },
    { field: "number", headerName: "Phone Number", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "city", headerName: "City" },
    { field: "state", headerName: "State" },
    { field: "type", headerName: "Type" },

    {
      field: "role",
      headerName: "Role",
      flex: 1,
      renderCell: (params) => (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          p="5px"
          bgcolor={params.value === "admin" ? colors.greenAccent[600] : colors.greenAccent[700]}
          borderRadius="4px"
        >
          {params.value === "admin" ? <AdminPanelSettingsOutlinedIcon /> : <SecurityOutlinedIcon />}
          <Typography color={colors.grey[100]} sx={{ ml: "5px" }}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.5,
      renderCell: (params) => (
        <Box>
          <IconButton color="primary" onClick={() => handleEditClick(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton color="secondary" onClick={() => handleDelete(params.row._id)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    }
  ];

  useEffect(() => {
    getSubpartners();
  }, []);

  const getSubpartners = () => {
    axios
      .get(Production_URL + "/subpartner/getSubpartners")
      .then((response) => {
        setData(response.data.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Validation
    const newErrors = {};
    if (!newSubpartner.name) newErrors.name = "Name is required";
    if (!newSubpartner.number) newErrors.number = "Phone Number is required";
    if (!newSubpartner.email) newErrors.email = "Email is required";
    if (!newSubpartner.password) newErrors.password = "Password is required";
    if (!newSubpartner.city) newErrors.city = "City is required";
    if (!newSubpartner.state) newErrors.state = "State is required";
    if (!newSubpartner.role) newErrors.role = "Access Level is required";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const config = {
        url: editMode ? `/subpartner/adminUpdate/${selectedSubpartner._id}` : "/subpartner/adminSignUp",
        method: editMode ? "put" : "post",
        baseURL: Production_URL,
        headers: { "content-type": "application/json" },
        data: newSubpartner,
      };
      let res = await axios(config);
      if (res.status === 201 || res.status === 200) {
        getSubpartners();
        handleClose();
      }
    } catch (error) {
      const errorMessage =
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : "Failed. Please try again.";
      alert(errorMessage);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this subpartner?");
    if (!confirmDelete) return;
  
    try {
      await axios.delete(`${Production_URL}/subpartner/delete/${id}`);
      getSubpartners();
    } catch (error) {
      console.error("Failed to delete subpartner", error);
    }
  };
  

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
    setSelectedSubpartner(null);
    setNewSubpartner(initialSubpartnerState);
  };

  const handleEditClick = (subpartner) => {
    setSelectedSubpartner(subpartner);
    setNewSubpartner(subpartner);
    setEditMode(true);
    setOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSubpartner((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const filteredData = data.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box m="20px">
      <Header title="Subpartners" subtitle="Subpartners" />

      <Box display="flex" justifyContent="space-between" mb="20px">
        <Button variant="contained" color="primary" onClick={handleOpen}>
          Create Subpartner
        </Button>
        <Box display="flex" alignItems="center">
          <InputBase
            placeholder="Search by name"
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{ ml: 1, flex: 1 }}
          />
          <IconButton type="submit" sx={{ p: 1 }}>
            <SearchIcon />
          </IconButton>
        </Box>
      </Box>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? "Edit Subpartner" : "Create New Subpartner"}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap="20px" mt="10px">
            <TextField
              name="name"
              label="Name"
              fullWidth
              required
              value={newSubpartner.name}
              onChange={handleInputChange}
              error={!!errors.name}
              helperText={errors.name}
            />
            <TextField
              name="number"
              label="Phone Number"
              fullWidth
              required
              value={newSubpartner.number}
              onChange={handleInputChange}
              error={!!errors.number}
              helperText={errors.number}
            />
            <TextField
              name="email"
              label="Email"
              fullWidth
              required
              value={newSubpartner.email}
              onChange={handleInputChange}
              error={!!errors.email}
              helperText={errors.email}
            />
            <TextField
              name="password"
              label="Password"
              fullWidth
              required
              type="password"
              value={newSubpartner.password}
              onChange={handleInputChange}
              error={!!errors.password}
              helperText={errors.password}
            />
            <TextField
              name="city"
              label="City"
              select
              fullWidth
              required
              value={newSubpartner.city}
              onChange={handleInputChange}
              error={!!errors.city}
              helperText={errors.city}
            >
              <MenuItem value="Bengaluru">Bengaluru</MenuItem>
              <MenuItem value="Hyderabad">Hyderabad</MenuItem>
              <MenuItem value="Chennai">Chennai</MenuItem>
            </TextField>
            <TextField
              name="state"
              label="State"
              select
              fullWidth
              required
              value={newSubpartner.state}
              onChange={handleInputChange}
              error={!!errors.state}
              helperText={errors.state}
            >
              <MenuItem value="Karnataka">Karnataka</MenuItem>
            </TextField>
            <TextField
              name="role"
              label="Access Level"
              select
              fullWidth
              required
              value={newSubpartner.role}
              onChange={handleInputChange}
              error={!!errors.role}
              helperText={errors.role}
            >
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="subpartner">Subpartner</MenuItem>
            </TextField>
            <TextField
              name="type"
              label="Activation Type"
              select
              fullWidth
              required
              value={newSubpartner.type}
              onChange={handleInputChange}
              error={!!errors.type}
              helperText={errors.type}
            >
              <MenuItem value="Prepaid">Prepaid</MenuItem>
              <MenuItem value="Postpaid">Postpaid</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleRegister}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

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
          rows={filteredData}
          columns={columns}
          getRowId={(row) => row._id}
        />
      </Box>
    </Box>
  );
};

export default Subpartners;
