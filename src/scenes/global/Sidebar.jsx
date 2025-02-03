import { useState } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { Link } from "react-router-dom";
import "react-pro-sidebar/dist/css/styles.css";
import { tokens } from "../../theme";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import ContactsOutlinedIcon from "@mui/icons-material/ContactsOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";


const Item = ({ title, to, icon, selected, setSelected }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <MenuItem
      active={selected === title}
      style={{
        color: colors.grey[100],
      }}
      onClick={() => setSelected(title)}
      icon={icon}
    >
      <Typography>{title}</Typography>
      <Link to={to} />
    </MenuItem>
  );
};

const Sidebar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Dashboard");
  const admin = JSON.parse(localStorage.getItem("FTadmin"));

  return (
    <Box
      sx={{
        "& .pro-sidebar-inner": {
          background: `${colors.primary[400]} !important`,
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item": {
          padding: "5px 35px 5px 20px !important",
        },
        "& .pro-inner-item:hover": {
          color: "#868dfb !important",
        },
        "& .pro-menu-item.active": {
          color: "#6870fa !important",
        },
      }}
    >
      <ProSidebar collapsed={isCollapsed}>
        <Menu iconShape="square">
          {/* LOGO AND MENU ICON */}
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: "10px 0 20px 0",
              color: colors.grey[100],
            }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="flex-end"
            
                ml="15px"
              >
                {/* <Typography variant="h3" color={colors.grey[100]}>
                  Super Admin
                </Typography> */}
                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {!isCollapsed && (
            <Box mb="25px">
              <Box display="flex" justifyContent="center" alignItems="center">
                <img
                  alt="profile-user"
                  width="120px"
                  height="120px"
                  src={`../../assets/Logo.png`}
                  style={{ cursor: "pointer",  }}
                />
              </Box>
              <Box textAlign="center">
                <Typography
                  variant="h3"
                  color={colors.grey[100]}
                  fontWeight="bold"
                  sx={{ m: "10px 0 0 0" }}
                >
                   Super Admin
                </Typography>
                <Typography variant="h5" color={colors.greenAccent[500]}>
              Partner
                </Typography>
              </Box>
            </Box>
          )}

{admin.role === 'admin' ?

<Box paddingLeft={isCollapsed ? undefined : "10%"}>
<Item
  title="Dashboard"
  to="/dashboard"
  icon={<HomeOutlinedIcon />}
  selected={selected}
  setSelected={setSelected}
/>

{/* <Typography
  variant="h6"
  color={colors.grey[300]}
  sx={{ m: "15px 0 5px 20px" }}
>
  Data
</Typography> */}

<Item
  title="Banners"
  to="/banner"
  icon={<ManageAccountsIcon />}
  selected={selected}
  setSelected={setSelected}
/>
<Item
  title="Subpartners"
  to="/subpartners"
  icon={<ManageAccountsIcon />}
  selected={selected}
  setSelected={setSelected}
/>
 <Item
  title="Agents"
  to="/agents"
  icon={<PeopleOutlinedIcon />}
  selected={selected}
  setSelected={setSelected}
/>
<Item
  title="Approvals"
  to="/Approvals"
  icon={<ContactsOutlinedIcon />}
  selected={selected}
  setSelected={setSelected}
/>
<Item
  title="Fast Tags"
  to="/FastTags"
  icon={<ReceiptOutlinedIcon />}
  selected={selected}
  setSelected={setSelected}
/>



</Box>
:
<Box paddingLeft={isCollapsed ? undefined : "10%"}>
<Item
  title="Dashboard"
  to="/dashboard"
  icon={<HomeOutlinedIcon />}
  selected={selected}
  setSelected={setSelected}
/>



 <Item
  title="Agents"
  to="/agents"
  icon={<PeopleOutlinedIcon />}
  selected={selected}
  setSelected={setSelected}
/>

<Item
  title="Fast Tags"
  to="/FastTags"
  icon={<ReceiptOutlinedIcon />}
  selected={selected}
  setSelected={setSelected}
/>



</Box>

}
   
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;
