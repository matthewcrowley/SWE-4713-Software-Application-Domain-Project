import React from "react";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Tooltip from "@mui/material/Tooltip";

const NotificationBell = ({ count = 0, onClick }) => {
  return (
    <Tooltip title="Notifications">
      <IconButton
        onClick={onClick}
        sx={{
          color: "#ff6b02e2", // Darker bell color
          "&:hover": {
            color: "#f36100ae", // Even darker on hover
          },
        }}
      >
        <Badge
          badgeContent={count}
          color="error" // bright red badge
          sx={{
            "& .MuiBadge-badge": {
              fontWeight: "bold",
              fontSize: "0.75rem",
              minWidth: "20px",
              height: "20px",
              borderRadius: "50%",
              color: "#ffffffff",
              backgroundColor: "#d32f2f", // custom darker red
            },
          }}
        >
          <NotificationsIcon fontSize="large" />
        </Badge>
      </IconButton>
    </Tooltip>
  );
};

export default NotificationBell;