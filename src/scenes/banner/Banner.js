import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  IconButton,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Production_IMG_URL, Production_URL } from "../ApiURL";

const Banner = () => {
  const [banners, setBanners] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [bannerData, setBannerData] = useState({ title: "", imageFile: null, banner: "" });

 

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const response = await axios.get(Production_URL+"/banner/getallbanner");
      console.log("Response--", response.data)
      setBanners(response.data.data);
    } catch (error) {
      console.error("Error fetching banners:", error);
    }
  };

  const handleOpen = (banner = null) => {
    setEditingBanner(banner);
    setBannerData(banner ? { title: banner.title, imageFile: null, banner: banner.banner } : { title: "", imageFile: null, banner: "" });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingBanner(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBannerData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerData((prev) => ({ ...prev, imageFile: file, banner: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("title", bannerData.title);
      if (bannerData.imageFile) {
        formData.append("banner", bannerData.imageFile);
      }
  
      if (editingBanner) {
        await axios.put(`${Production_URL}/banners/${editingBanner._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axios.post(`${Production_URL}/banner/addbanner`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      fetchBanners();
      handleClose();
    } catch (error) {
      console.error("Error saving banner:", error);
    }
  };
  

  const handleDelete = async (id) => {
    try {
      await axios.delete(Production_URL+`/banner/deletebanner/${id}`);
      fetchBanners();
    } catch (error) {
      console.error("Error deleting banner:", error);
    }
  };

  const columns = [
    { field: "title", headerName: "Title", flex: 1 },
    {
        field: "banner",
        headerName: "Image",
        flex: 1,
        renderCell: (params) => (
          <img src={`${Production_IMG_URL}/userbanner/${params.value}`} alt="Banner" style={{ width: 100, height: "auto" }} />
        ),
      }
,      
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <>
          <IconButton onClick={() => handleOpen(params.row)}>
            <EditIcon color="primary" />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.row._id)}>
            <DeleteIcon color="error" />
          </IconButton>
        </>
      ),
    },
  ];

  return (
    <Box m="20px">
      <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => handleOpen()}>
        Add Banner
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingBanner ? "Edit Banner" : "Add Banner"}</DialogTitle>
        <DialogContent>
          <TextField
            name="title"
            label="Title"
            fullWidth
            value={bannerData.title}
            onChange={handleInputChange}
            sx={{ mt: 2 }}
          />
          <input
            accept="image/*"
            style={{ display: "none" }}
            id="raised-button-file"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="raised-button-file">
            <Button variant="contained" component="span" sx={{ mt: 2 }}>
              Upload Image
            </Button>
          </label>
          {bannerData.banner && (
            <Box mt={2}>
              <img src={Production_IMG_URL+"userapp"+ bannerData.banner} alt="Preview" style={{ width: "100%", height: "auto" }} />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>

      <Box mt="20px" height="75vh">
        <DataGrid rows={banners} columns={columns} getRowId={(row) => row._id} />
      </Box>
    </Box>
  );
};

export default Banner;