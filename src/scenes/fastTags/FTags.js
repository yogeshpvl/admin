import { useState, useEffect } from "react";
import {
  Box, Button, Dialog, DialogTitle, DialogContent,
  TextField, DialogActions, IconButton, MenuItem, Select,
  InputLabel, FormControl, Tabs, Tab, CircularProgress
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
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const admin = JSON.parse(localStorage.getItem("FTadmin"));

  console.log("fastTags",fastTags)
  useEffect(() => {
    fetchFastTags();
    fetchAgents();
  }, []);

  const fetchFastTags = async () => {
    try {
      setLoading(true);
      if (!admin) {
        throw new Error("Admin data is not available");
      }

      const url =
        admin.role === "subpartner"
          ? `https://api.aktollpark.com/api/tags/createdBy/${admin._id}`
          : "https://api.aktollpark.com/api/tags";

      const response = await axios.get(url);

      console.log("response backen",response.data)
      setFastTags(response.data);
    } catch (error) {
      console.error("Error fetching FastTags:", error.message);
      alert("Failed to fetch FastTags. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await axios.get("https://api.aktollpark.com/api/agent/getAllAgents");
      setAgents(response.data.data);
    } catch (error) {
      console.error("Error fetching agents:", error);
      alert("Failed to fetch agents. Please try again.");
      setAgents([]);
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
      await axios.post("https://api.aktollpark.com/api/tags", {
        tags: newFastTags,
        createdBy: admin.name,
        createdId: admin._id
      });
      fetchFastTags();
      setAddOpen(false);
      setNewFastTags([{ kitNo: "", tagClass: "", mapperClass: "", color: "", assignedTo: "" }]);
    } catch (error) {
      console.error("Error saving FastTags:", error);
      alert("Failed to save FastTags. Please try again.");
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
      await axios.put("https://api.aktollpark.com/api/tags/assign", {
        tags: selectedTags,
        agentId: selectedAgent
      });
      fetchFastTags();
      setSelectedTags([]);
      setSelectedAgent("");
      setAssignOpen(false);
    } catch (error) {
      console.error("Error assigning FastTags:", error);
      alert("Failed to assign FastTags. Please try again.");
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
        await axios.post("https://api.aktollpark.com/api/tags", {
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
      field: "assignedTo",
      headerName: "Agent Name",
      flex: 1,
      renderCell: (agent) => {
  
        return (
          <Box
           
          >
            {agent?.row?.assignedTo?.name ?agent?.row?.assignedTo?.name : "Not Assigned"}
          </Box>
        );
      },
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
      headerName: "Days Complete",
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

  const filteredTags = tabValue === 0
    ? fastTags.filter(tag => tag.status === "Assigned")
    : fastTags.filter(tag => tag.status !== "Assigned");

  return (
    <Box m="20px">
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <CircularProgress sx={{ color: "#8B0000" }} />
        </Box>
      ) : (
        <>
          <Box display="flex" gap={2} mb={2}>
            <Button
              variant="contained"
              sx={{ backgroundColor: "#8B0000", "&:hover": { backgroundColor: "#B22222" } }}
              onClick={() => setAddOpen(true)}
            >
              Add Fast Tags
            </Button>
            <Button
              variant="contained"
              sx={{ backgroundColor: "#8B0000", "&:hover": { backgroundColor: "#B22222" } }}
              onClick={handleBulkAssign}
            >
              Assign Fast Tags
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              sx={{ borderColor: "#8B0000", color: "#8B0000", "&:hover": { borderColor: "#B22222", color: "#B22222" } }}
              onClick={handleSampleDownload}
            >
              Download Sample
            </Button>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
              sx={{ borderColor: "#8B0000", color: "#8B0000", "&:hover": { borderColor: "#B22222", color: "#B22222" } }}
            >
              Upload Excel
              <input type="file" hidden accept=".xlsx, .xls" onChange={handleExcelUpload} />
            </Button>
          </Box>

          <Tabs
            value={tabValue}
            onChange={(event, newValue) => setTabValue(newValue)}
            aria-label="FastTags Tabs"
            sx={{
              mb: 2,
              "& .MuiTab-root": { color: "#333", fontFamily: "Roboto, sans-serif" },
              "& .Mui-selected": { color: "#8B0000" },
              "& .MuiTabs-indicator": { backgroundColor: "#8B0000" },
            }}
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
            sx={{
              "& .MuiDataGrid-columnHeaders": { backgroundColor: "#F8F9FA", color: "#8B0000" },
              "& .MuiDataGrid-row": { "&:hover": { backgroundColor: "#F0F0F0" } },
            }}
          />

          <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ backgroundColor: "#8B0000", color: "#FFFFFF" }}>
              Add New Fast Tags
            </DialogTitle>
            <DialogContent>
              {newFastTags.map((tag, index) => (
                <Box key={index} display="flex" alignItems="center" gap="10px">
                  <TextField
                    name="kitNo"
                    label="Tag ID"
                    size="small"
                    fullWidth
                    value={tag.kitNo}
                    onChange={(e) => handleInputChange(index, e)}
                    sx={{ mt: 2 }}
                  />
                  <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel>Tag Class</InputLabel>
                    <Select
                      label="Tag Class"
                      size="small"
                      name="tagClass"
                      value={tag.tagClass}
                      onChange={(e) => handleInputChange(index, e)}
                    >
                      {tagOptions.map(opt => (
                        <MenuItem key={opt.tagClass} value={opt.tagClass}>{opt.tagClass}</MenuItem>
                      ))}
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
                      {mapperOptions
                        .filter(m => m.tagClass === tag.tagClass)
                        .map(opt => (
                          <MenuItem key={opt.mapperClass} value={opt.mapperClass}>{opt.mapperClass}</MenuItem>
                        ))}
                    </Select>
                  </FormControl>
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
              <Button onClick={() => setAddOpen(false)} color="secondary">
                Cancel
              </Button>
              <Button
                variant="contained"
                sx={{ backgroundColor: "#8B0000", "&:hover": { backgroundColor: "#B22222" } }}
                onClick={handleSave}
              >
                Save
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ backgroundColor: "#8B0000", color: "#FFFFFF" }}>
              Assign Fast Tags
            </DialogTitle>
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
                    <MenuItem key={agent._id} value={agent._id}>{agent.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setAssignOpen(false)} color="secondary">
                Cancel
              </Button>
              <Button
                variant="contained"
                sx={{ backgroundColor: "#8B0000", "&:hover": { backgroundColor: "#B22222" } }}
                onClick={handleAssignSubmit}
              >
                Submit
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
};

export default FTags;