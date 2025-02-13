import { useState, useEffect } from "react";
import { 
  Box, Button,  useTheme, Dialog, DialogTitle, DialogContent, 
  TextField, DialogActions, IconButton, MenuItem, Select
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import axios from "axios";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import moment from "moment/moment";

const FTags = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [open, setOpen] = useState(false);
  const [fastTags, setFastTags] = useState([]);
  const [newFastTags, setNewFastTags] = useState([{ kitNo: "", status: "" }]);
  const [agents, setAgents] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const admin = JSON.parse(localStorage.getItem("FTadmin")); // Parse JSON string
console.log("Admin Name: " + admin?.name); // Use optional chaining to prevent errors



  useEffect(() => {
    fetchFastTags();
    fetchAgents();
  }, []);

  const fetchFastTags = async () => {
    try {
      const response = await axios.get("http://localhost:8500/api/tags");
      setFastTags(response.data);
    } catch (error) {
      console.error("Error fetching FastTags:", error);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await axios.get("http://localhost:8500/api/agent/getAllAgents");
      console.log(response.data.data,"Agent")
      setAgents(response.data.data);
    } catch (error) {
      console.error("Error fetching agents:", error);
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleAddOpen = () => setAddOpen(true);
  const handleAddClose = () => setAddOpen(false);
  console.log("selectedTags",selectedTags)

  const handleAssign = async () => {
    const selectedObjects = fastTags.filter(tag => selectedTags.includes(tag._id));
    const selectedAgentObj = agents.find(agent => agent._id === selectedAgent); // Find the selected agent
    const agentName = selectedAgentObj ? selectedAgentObj.name : ""; // Get agent's name
    
    try {
      await axios.put("http://localhost:8500/api/tags/assign", {
        tags: selectedObjects,
        agentId: selectedAgent,
        agentName: agentName, // Pass agent name
      });
      fetchFastTags();
      setSelectedTags([]);
      setSelectedAgent("");
    } catch (error) {
      console.error("Error assigning FastTags:", error);
    }
  };
  
  

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8500/api/tags/${id}`);
      fetchFastTags();
    } catch (error) {
      console.error("Error deleting FastTag:", error);
    }
  };

  const handleInputChange = (index, event) => {
    const { name, value } = event.target;
    setNewFastTags((prevTags) => {
      const updatedTags = [...prevTags];
      updatedTags[index][name] = value;
      return updatedTags;
    });
  };

      // Add another input field for multiple tag entry
      const addNewTagField = () => {
        setNewFastTags([...newFastTags, { kitNo: "", assignedName: "", status: "" }]);
      };
    
      // Remove a tag input field
      const removeTagField = (index) => {
        setNewFastTags((prevTags) => prevTags.filter((_, i) => i !== index));
      };

  const handleSave = async () => {
    try {
    const response=  await axios.post("http://localhost:8500/api/tags", { tags: newFastTags,createdBy:admin.name,createdId:admin._id });
      fetchFastTags([...fastTags, ...response.data]);
      handleAddClose();
    } catch (error) {
      console.error("Error saving FastTags:", error);
    }
  };

  const columns = [
    { 
      field: "slNo", 
      headerName: "Sl No", 
      flex: 1,
      valueGetter: (params) => params.api.getRowIndex(params.id) + 1 
    },    
    { 
      field: "createdAt", 
      headerName: "Cr Date", 
      flex: 1,
      valueGetter: (params) => moment(params.row.createdAt).format("DD-MM-YYYY")
    },    
    { field: "kitNo", headerName: "Tag ID", flex: 1 },
    { field: "agentName", headerName: "Assigned To", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
    {
      field: "delete",
      headerName: "Delete",
      flex: 1,
      renderCell: (params) => (
        <IconButton onClick={() => handleDelete(params.row._id)}>
          <DeleteIcon color="error" />
        </IconButton>
      ),
    },
  ];

  useEffect(() => {
    console.log("Selected Tags Updated:", selectedTags);
  }, [selectedTags]);
  
  return (
    <Box m="20px">
      <Header title="Fast Tags" subtitle="Manage Fast Tags" />

      <Button variant="contained" color="primary" onClick={handleAddOpen}>
        Add Fast Tags
      </Button>
      <Button variant="contained" color="secondary" onClick={handleOpen} sx={{ ml: 2 }}>
        Assign Fast Tags
      </Button>

      <Dialog open={addOpen} onClose={handleAddClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Fast Tags</DialogTitle>
        <DialogContent>
          {newFastTags.map((tag, index) => (
            <Box key={index} display="flex" alignItems="center" gap="10px">

            
            <TextField
              key={index}
              name="kitNo"
              label="Tag ID"
              fullWidth
              value={tag.kitNo}
              onChange={(e) => handleInputChange(index, e)}
              sx={{ mt: 2 }}
            />
            {index > 0 && (
              <IconButton onClick={() => removeTagField(index)}>
                <DeleteIcon color="error" />
              </IconButton>
            )}
            </Box>
          ))}
           <Button startIcon={<AddIcon />} onClick={addNewTagField} sx={{ mt: 2 }}>
            Add Another
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddClose} color="secondary">Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Fast Tags</DialogTitle>
        <DialogContent>
          <Select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            fullWidth
            displayEmpty
          >
            <MenuItem value="" disabled>Select an Agent</MenuItem>
            {agents?.map((agent) => (
              <MenuItem key={agent._id} value={agent._id}>{agent.name}</MenuItem>
            ))}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleAssign}>Assign</Button>
        </DialogActions>
      </Dialog>

      <Box mt="40px" height="75vh" sx={{ "& .MuiDataGrid-root": { border: "none" } }}>



<DataGrid
  checkboxSelection
  rows={fastTags} 
  columns={columns} 
  getRowId={(row) => row._id} 
  selectionModel={selectedTags} // Set the selected IDs here
  onSelectionModelChange={(newSelectionModel) => {
    setSelectedTags(newSelectionModel);  // Only store the selected IDs
    console.log("Selected Tags:", newSelectionModel);  // Debugging log
  }}
/>




      </Box>
    </Box>
  );
};

export default FTags;
