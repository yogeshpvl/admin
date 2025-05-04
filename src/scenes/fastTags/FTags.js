import { useState, useEffect } from "react";
import {
  Box, Button, Dialog, DialogTitle, DialogContent,
  TextField, DialogActions, IconButton, MenuItem, Select,
  InputLabel, FormControl, Tabs, Tab
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

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
  const [tabValue, setTabValue] = useState(0); // State for active tab
  const admin = JSON.parse(localStorage.getItem("FTadmin"));

  useEffect(() => {
    fetchFastTags();
    fetchAgents();
  }, []);

  const fetchFastTags = async () => {
    try {
      const response = await axios.get(`http://localhost:8500/api/tags/createdBy/${admin?._id}`);
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
      await axios.post("http://localhost:8500/api/tags", {
        tags: newFastTags,
        createdBy: admin.name,
        createdId: admin._id
      });
      fetchFastTags();
      setAddOpen(false);
      setNewFastTags([{ kitNo: "", tagClass: "", mapperClass: "", color: "", assignedTo: "" }]);
    } catch (error) {
      console.error("Error saving FastTags:", error);
    }
  };

  const handleBulkAssign = () => {
    if (selectedTags.length === 0) {
      alert("Please select at least one FastTag to assign.");
      return;
    }
    setAssignOpen(true);
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
      setSelectedAgent("");
      setAssignOpen(false);
    } catch (error) {
      console.error("Error assigning FastTags:", error);
    }
  };

  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const binaryStr = evt.target.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);

      const formatted = data.map(tag => ({ ...tag }));

      try {
        await axios.post("http://localhost:8500/api/tags", {
          tags: formatted,
          createdBy: admin.name,
          createdId: admin._id
        });
        fetchFastTags();
        alert("Tags uploaded successfully");
      } catch (err) {
        alert("Upload failed");
        console.error(err);
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleSampleDownload = () => {
    const sample = [
      { kitNo: "ABC123", tagClass: "VC4", mapperClass: "MC4", assignedTo: "" }
    ];
    const worksheet = XLSX.utils.json_to_sheet(sample);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "SampleTags");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "FastTagsSample.xlsx");
  };

  const columns = [
    { field: "kitNo", headerName: "Kit No", flex: 1 },
    { field: "tagClass", headerName: "Tag Class", flex: 1 },
    { field: "mapperClass", headerName: "Mapper Class", flex: 1 },
    {
      field: "assignedAgent",
      headerName: "Agent Name",
      flex: 1,
      valueGetter: (params) => params?.name || "", // Access agent name safely
    },
    { field: "createdBy", headerName: "Created By", flex: 1 },
    {
      field: "createdAt",
      headerName: "Created At",
      flex: 1,
      valueGetter: (params) => {
        const date = new Date(params);
        if (!params) return "";
        return date.toLocaleString("en-IN", {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      },
    },
    {
      field: "updatedAt",
      headerName: "Days complete",
      flex: 1,
      valueGetter: (params) => {
        const updatedAt = new Date(params);
        if (!updatedAt) return "";
        const currentDate = new Date();
        const timeDifference = currentDate - updatedAt;
        const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        return `${daysDifference} days ago`;
      },
    }
  ];

  // Filter tags based on tab selection
  const filteredTags = tabValue === 0
    ? fastTags.filter(tag => tag.assignedAgent && tag.assignedAgent._id) // Assigned tags
    : fastTags.filter(tag => !tag.assignedAgent || !tag.assignedAgent._id); // Not assigned tags

  return (
    <Box m="20px">
      <Box display="flex" gap={2} mb={2}>
        <Button variant="contained" color="primary" onClick={() => setAddOpen(true)}>Add Fast Tags</Button>
        <Button variant="contained" color="secondary" onClick={handleBulkAssign}>Assign Fast Tags</Button>
        <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleSampleDownload}>Download Sample</Button>
        <Button variant="outlined" component="label" startIcon={<UploadIcon />}>
          Upload Excel
          <input type="file" hidden accept=".xlsx, .xls" onChange={handleExcelUpload} />
        </Button>
      </Box>

      {/* Tabs for Assigned and Not Assigned */}
      <Tabs
        value={tabValue}
        onChange={(event, newValue) => setTabValue(newValue)}
        aria-label="FastTags Tabs"
        sx={{ mb: 2 }}
      >
        <Tab label="Assigned" />
        <Tab label="Not Assigned" />
      </Tabs>

      <DataGrid
        rows={filteredTags}
        columns={columns}
        getRowId={(row) => row._id || row.kitNo}
        checkboxSelection
        onRowSelectionModelChange={(model) => setSelectedTags(model)}
        autoHeight
        pageSizeOptions={[5, 10, 20]}
      />

      {/* Add Modal */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Fast Tags</DialogTitle>
        <DialogContent>
          {newFastTags.map((tag, index) => (
            <Box key={index} display="flex" alignItems="center" gap="10px">
              <TextField name="kitNo" label="Tag ID" size="small" fullWidth value={tag.kitNo} onChange={(e) => handleInputChange(index, e)} sx={{ mt: 2 }} />
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Tag Class</InputLabel>
                <Select label="Tag Class" size="small" name="tagClass" value={tag.tagClass} onChange={(e) => handleInputChange(index, e)}>
                  {tagOptions.map(opt => <MenuItem key={opt.tagClass} value={opt.tagClass}>{opt.tagClass}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Mapper Class</InputLabel>
                <Select label="Mapper Class" size="small" name="mapperClass" value={tag.mapperClass} onChange={(e) => handleInputChange(index, e)} disabled={!tag.tagClass}>
                  {mapperOptions.filter(m => m.tagClass === tag.tagClass).map(opt => (
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

      {/* Assign Modal */}
      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Fast Tags</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Agent</InputLabel>
            <Select label="Select Agent" size="small" value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)}>
              {agents.map((agent) => (
                <MenuItem key={agent._id} value={agent._id}>{agent.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignOpen(false)} color="secondary">Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleAssignSubmit}>Submit</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FTags;