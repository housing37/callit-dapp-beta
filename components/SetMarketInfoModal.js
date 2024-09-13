import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Modal,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  OutlinedInput,
} from "@mui/material";
import TimestampForm from "./TimestampForm";

const SetMarketInfoModal = ({
  setInfoModalOpen,
  handleSetInfoModalClose,
  handleSetMarketInfo,
}) => {
  // State to manage form input values
  const [anyTicket, setAnyTicket] = useState("");
  const [category, setCategory] = useState("");
  const [descr, setDescr] = useState("");
  const [imgUrl, setImgUrl] = useState("");

  const handleModalClose = () => {
    setCategory("");
    handleSetInfoModalClose();
  };

  const handleDropdownChange = (event) => {
    setCategory(event.target.value);
  };

  // Function to handle form submission
  const handleSubmit = async () => {
    // Prepare data as JSON
    const formData = {
      _anyTicket: anyTicket,
      _category: category,
      _descr: descr,
      _imgUrl: imgUrl,
    };

    handleSetMarketInfo(formData);
    console.log(formData);
  };

  return (
    <Modal
      sx={{ overflow: "auto" }}
      open={setInfoModalOpen}
      onClose={handleModalClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography id="modal-title" variant="h6" component="h2" mb={2}>
          Set Market Infomation
        </Typography>

        {/* Form Fields */}
        <TextField
          fullWidth
          label="_anyTicket"
          variant="outlined"
          margin="normal"
          value={anyTicket}
          onChange={(e) => setAnyTicket(e.target.value)} // Handle name input
        />
        <FormControl fullWidth margin="normal">
          <InputLabel id="category-label">_category</InputLabel>
          <Select
            labelId="category-label"
            value={category}
            onChange={handleDropdownChange}
            label="_category"
            input={<OutlinedInput label="_category" />}
          >
            <MenuItem value="Sports">Sports</MenuItem>
            <MenuItem value="Current Events">Current Events</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </Select>
        </FormControl>
        <TextField
          fullWidth
          label="_descr"
          variant="outlined"
          margin="normal"
          value={descr}
          onChange={(e) => setDescr(e.target.value)} // Handle usdAmntLP input
        />
        <TextField
          fullWidth
          label="_imgUrl"
          variant="outlined"
          margin="normal"
          value={imgUrl}
          onChange={(e) => setImgUrl(e.target.value)} // Handle usdAmntLP input
        />

        {/* Add Outcome and Submit Buttons */}
        <Box mt={3} display="flex" justifyContent="space-between">
          <Button variant="outlined" color="info" onClick={handleModalClose}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Submit
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default SetMarketInfoModal;
