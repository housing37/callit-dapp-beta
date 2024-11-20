import React from "react";
import { useRouter } from "next/router";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  IconButton,
} from "@mui/material";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import CommentOutlinedIcon from "@mui/icons-material/CommentOutlined";
import Settings from "@mui/icons-material/Settings";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";
import Avatar from "@mui/material/Avatar";
import Link from "next/link";

const MarketCard = ({
  account,
  connectWallet,
  id,
  title,
  category,
  live,
  isMine,
  handleSetInfoModalOpen,
  setTicketForSetInfo,
  marketResults,
}) => {
  const router = useRouter();
  const aTicketAddress = marketResults.resultOptionTokens[0];

  return (
    <Card
      sx={{
        width: {
          xs: "90%", // Centered width on mobile devices (90%)
          sm: "calc(45% - 5px)", // Adjust width for larger devices
        },
        maxWidth: "400px", // Limit maximum width for better appearance on large screens
        height: "200px", // Allow height to auto-adjust based on content
        borderRadius: 2,
        boxShadow: 3,
        margin: "auto auto 10px auto", // Reduce margin above grid columns
        display: "grid", // Change display to grid
        gridTemplateColumns: {
          xs: "1fr", // One column on mobile devices
          sm: "repeat(2, 1fr)", // Two columns for larger devices
        },
        gap: "1rem", // Reduce space between grid items
        padding: "10px 10px 10px 10px" /* Top, Right, Bottom, Left */,
        boxSizing: "border-box", // Ensure padding and border are included in width/height
        color: "white",
        background: `radial-gradient(circle at 100% 100%, #373261 0, #373261 5px, transparent 5px) 0% 0%/8px 8px no-repeat,
                 radial-gradient(circle at 0 100%, #373261 0, #373261 5px, transparent 5px) 100% 0%/8px 8px no-repeat,
                 radial-gradient(circle at 100% 0, #27244E 0, #27244E 5px, transparent 5px) 0% 100%/8px 8px no-repeat,
                 radial-gradient(circle at 0 0, #27244E 0, #27244E 5px, transparent 5px) 100% 100%/8px 8px no-repeat,
                 linear-gradient(#373261, #27244E) 50% 50%/calc(100% - 6px) calc(100% - 16px) no-repeat,
                 linear-gradient(#373261, #27244E) 50% 50%/calc(100% - 16px) calc(100% - 6px) no-repeat,
                 linear-gradient(#ff0000 0%, #e200f3 33%, #314bff 67%, #00b6d1 100%)`,
        boxShadow: `inset 0 0 15px rgba(164, 93, 187, 0.8), 
                0 0 20px 10px rgba(164, 93, 187, 0.3)`,
        transition: "border 0.2s ease-in-out", // Hover effect transition
        "&:hover": {
          border: "1px solid darkblue",
        },
        overflow: "hidden", // Hide overflowed text
        whiteSpace: "normal", // Allow text to wrap
        textOverflow: "clip", // Do not show ellipsis for overflowed text
        fontSize: { xs: "12px", sm: "14px" }, // Smaller responsive font size
        lineHeight: "1.4", // Adjust line height
      }}
    >
      <Link
        href={{
          pathname: `/market/${aTicketAddress}`,
          query: { account: account, connectWallet: connectWallet },
        }}
        passHref
      >
        <CardContent>
          {/* Top Section: Icon and Title */}
          <Box
            display="flex"
            alignItems="center"
            mb={2}
            justifyContent="space-between"
          >
            <Avatar
              alt="Presidential Seal"
              src="/vote_img.jpg"
              sx={{ width: 40, height: 40, marginRight: 2 }}
            />
            <Typography variant="h6" component="div">
              {title}
            </Typography>
            {isMine ? (
              <IconButton
                color="primary"
                aria-label="settings"
                size="small"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent Link navigation
                  setTicketForSetInfo(aTicketAddress);
                  handleSetInfoModalOpen();
                }}
              >
                <Settings />
              </IconButton>
            ) : (
              <IconButton aria-label="settings" size="small" disabled>
                <SettingsOutlined />
              </IconButton>
            )}
          </Box>

          {/* Middle Section: Stats */}
          <Box>
            <Box display="flex" alignItems="center">
              <PushPinOutlinedIcon sx={{ marginRight: 0.5 }} />
              <Typography variant="body2" color="text.secondary">
                {category}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center">
              <PushPinOutlinedIcon sx={{ marginRight: 0.5 }} />
              <Typography variant="body2" color="text.secondary">
                {live}
              </Typography>
            </Box>
            <IconButton aria-label="comments" size="small">
              <CommentOutlinedIcon />
            </IconButton>
          </Box>
        </CardContent>
      </Link>
    </Card>
  );
};

export default MarketCard;
