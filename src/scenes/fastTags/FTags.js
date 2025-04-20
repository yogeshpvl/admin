import { useState, useEffect } from "react";
import { 
  Box, Button, Dialog, DialogTitle, DialogContent, 
  TextField, DialogActions, IconButton, MenuItem, Select, InputLabel, FormControl 
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadIcon from "@mui/icons-material/UploadFile";




const tagOptions = [
  { tagClass: "VC4", color: "#800080" }, 
  { tagClass: "VC5", color: "#FF4500" },
  { tagClass: "VC6", color: "#ffff00" },
  { tagClass: "VC7", color: "#008000" },
  { tagClass: "VC12", color: "#800000" },
  { tagClass: "VC15", color: "#BDB76B" },
  { tagClass: "VC16", color: "#708090" },
];

const mapperOptions = [
  { tagClass: "VC4", mapperClass: "MC4" }, 
  { tagClass: "VC4", mapperClass: "MC20" },
  { tagClass: "VC5", mapperClass: "MC5" },
  { tagClass: "VC5", mapperClass: "MC9" },
  { tagClass: "VC6", mapperClass: "MC8" },
  { tagClass: "VC6", mapperClass: "MC11" },
  { tagClass: "VC7", mapperClass: "MC7" },
  { tagClass: "VC7", mapperClass: "MC10" },
  { tagClass: "VC12", mapperClass: "MC12" },
  { tagClass: "VC12", mapperClass: "MC13" },
  { tagClass: "VC15", mapperClass: "MC14" },
  { tagClass: "VC15", mapperClass: "MC15" },
  { tagClass: "VC16", mapperClass: "MC16" },
  { tagClass: "VC16", mapperClass: "MC17" },
];

const FTags = () => {
 
  const [addOpen, setAddOpen] = useState(false);
  const [fastTags, setFastTags] = useState([]);
  const [newFastTags, setNewFastTags] = useState([{ kitNo: "", tagClass: "", mapperClass: "", color: "", assignedTo: "" }]);
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [assignOpen, setAssignOpen] = useState(false);
  const admin = JSON.parse(localStorage.getItem("FTadmin"));
  console.log("newFastTags",newFastTags)
  
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
      setAgents(response.data.data);
    } catch (error) {
      console.error("Error fetching agents:", error);
    }
  };

  const handleInputChange = (index, event) => {
    const { name, value } = event.target;
    const updatedTags = [...newFastTags];
    updatedTags[index][name] = value;

    if (name === "tagClass") {
      const selectedTag = tagOptions.find(tag => tag.tagClass === value);
      updatedTags[index].color = selectedTag?.color || "";
      updatedTags[index].mapperClass = ""; 
    }

    setNewFastTags(updatedTags);
  };

  const addNewTagField = () => {
    setNewFastTags([...newFastTags, { kitNo: "", tagClass: "", mapperClass: "", color: "", assignedTo: "" }]);
  };

  const removeTagField = (index) => {
    setNewFastTags(prevTags => prevTags.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      await axios.post("http://localhost:8500/api/tags", { tags: newFastTags,createdBy:admin.name,createdId:admin._id  });
      fetchFastTags();
      setAddOpen(false);
    setNewFastTags([ { kitNo: "", tagClass: "", mapperClass: "", color: "", assignedTo: "" }]);

    } catch (error) {
      console.error("Error saving FastTags:", error);
    }
  };

  console.log("selectedTags",selectedTags)
  const handleBulkAssign = async () => {
    if (selectedTags.length === 0) {
      alert("Please select at least one FastTag to assign.");
      return;
    }
  
    setAssignOpen(true); // Open the modal for agent selection
  };
  
  const handleAssignSubmit = async () => {
    if (!selectedAgent) {
      alert("Please select an agent before assigning tags.");
      return;
    }
  
    try {
      await axios.put("http://localhost:8500/api/tags/assign", {
        tags: selectedTags,
        agentId: selectedAgent
      });
      fetchFastTags();
      setSelectedTags([]);
      setSelectedAgent(""); // Reset agent selection
      setAssignOpen(false); // Close the modal after assignment
    } catch (error) {
      console.error("Error assigning FastTags:", error);
    }
  };

  const handleRowSelection = (selectionModel) => {
    setSelectedTags(selectionModel); // Update selected tags state
    console.log("Selected Tags:", selectionModel); // Debugging to check if IDs are logged
  };
  

  const columns = [
    { field: "kitNo", headerName: "Kit No", flex: 1 },
    { field: "tagClass", headerName: "Tag Class", flex: 1 },
    { field: "mapperClass", headerName: "Mapper Class", flex: 1 },

    { field: "assignedTo", headerName: "Assigned To", flex: 1 },
    { field: "createdBy", headerName: "Created By", flex: 1 },
    {
      field: "createdAt",
      headerName: "Created At",
      flex: 1,
      valueGetter: (params) => new Date(params.row?.createdAt).toLocaleString(),
    },
  ];
  useEffect(() => {
    console.log("Updated Selected Tags:", selectedTags);
  }, [selectedTags]);
  

  return (
    <Box m="20px">
      <Button variant="contained" color="primary" onClick={() => setAddOpen(true)}>Add Fast Tags</Button>
      <Button variant="contained" color="secondary" onClick={handleBulkAssign} sx={{ ml: 2 }}>Assign Fast Tags</Button>
      <DataGrid
  rows={fastTags}
  columns={columns}
  getRowId={(row) => row._id || row.kitNo || row.id}
  checkboxSelection
  disableRowSelectionOnClick={false}
  onRowSelectionModelChange={(selectionModel) => {
    console.log("Selected Rows:", selectionModel);
    setSelectedTags(selectionModel.selectionModel || selectionModel); 
  }}
  autoHeight
  pageSizeOptions={[5, 10, 20]}
/>



      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Fast Tags</DialogTitle>
        <DialogContent>
          {newFastTags.map((tag, index) => (
            <Box key={index} display="flex" alignItems="center" gap="10px">
              <TextField name="kitNo" label="Tag ID" size="small" fullWidth value={tag.kitNo} onChange={(e) => handleInputChange(index, e)} sx={{ mt: 2 }} />
              
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Tag Class</InputLabel>
                <Select label="Tag Class" size="small" name="tagClass" value={tag.tagClass} onChange={(e) => handleInputChange(index, e)}>
                  {tagOptions.map((opt) => <MenuItem key={opt.tagClass} value={opt.tagClass}>{opt.tagClass}</MenuItem>)}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Mapper Class</InputLabel>
                <Select
                  label="Mapper Class"
                  size="small"
                  name="mapperClass"
                  value={tag.mapperClass}
                  onChange={(e) => handleInputChange(index, e)}
                  disabled={!tag.tagClass}
                >
                  {mapperOptions.filter(m => m.tagClass === tag.tagClass).map((opt) => (
                    <MenuItem key={opt.mapperClass} value={opt.mapperClass}>{opt.mapperClass}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {index > 0 && <IconButton onClick={() => removeTagField(index)}><DeleteIcon color="error" /></IconButton>}
            </Box>
          ))}
          <Button startIcon={<AddIcon />} onClick={addNewTagField} sx={{ mt: 2 }}>Add Another</Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)} color="secondary">Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} maxWidth="sm" fullWidth>
  <DialogTitle>Assign Fast Tags</DialogTitle>
  <DialogContent>
    <FormControl fullWidth sx={{ mt: 2 }}>
      <InputLabel>Select Agent</InputLabel>
      <Select
        label="Select Agent"
        size="small"
        value={selectedAgent}
        onChange={(e) => setSelectedAgent(e.target.value)}
      >
        {agents.map((agent) => (
          <MenuItem key={agent._id} value={agent._id}>
            {agent.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setAssignOpen(false)} color="secondary">
      Cancel
    </Button>
    <Button variant="contained" color="primary" onClick={handleAssignSubmit}>
      Submit
    </Button>
  </DialogActions>
</Dialog>
    </Box>
  );
};

export default FTags;
