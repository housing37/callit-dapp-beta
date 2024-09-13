import React, { useState, useEffect } from "react";
import { Box, Button, TextField, Typography, Modal } from "@mui/material";
import TimestampForm from "./TimestampForm";

const CreateMarketModal = ({
  createModalopen,
  handleCreateModalClose,
  handleCreateMarket,
}) => {
  // State to manage form input values
  const [name, setName] = useState("");
  const [usdAmntLP, setUsdAmntLP] = useState(null);
  const [dtCallDeadline, setDtCallDeadline] = useState(null);
  const [dtResultVoteStart, setDtResultVoteStart] = useState(null);
  const [dtResultVoteEnd, setDtResultVoteEnd] = useState(null);
  const [resultLabels, setResultLabels] = useState([""]);
  const [resultDescrs, setResultDescrs] = useState([""]);
  const [resultNum, setResultNum] = useState(1);

  const handleResultLabels = (value, key) => {
    const newLabels = resultLabels;
    newLabels[key] = value;
    setResultLabels(newLabels);
  };

  const handleResultDescrs = (value, key) => {
    const newDescrs = resultDescrs;
    newDescrs[key] = value;
    setResultDescrs(newDescrs);
  };

  const handleAddResult = () => {
    const newNum = resultNum + 1;
    setResultNum(newNum);
    // console.log("resultNumber: ", resultNum);
  };

  const handleModalClose = () => {
    setResultNum(1);
    handleCreateModalClose();
  };

  // Function to handle form submission
  const handleSubmit = async () => {
    // Prepare data as JSON
    const formData = {
      _name: name,
      _usdAmntLP: Number(usdAmntLP),
      _dtCallDeadline: dtCallDeadline,
      _dtResultVoteStart: dtResultVoteStart,
      _dtResultVoteEnd: dtResultVoteEnd,
      _resultLabels: resultLabels, // Assuming user enters comma-separated values
      _resultDescrs: resultDescrs,
    };

    handleCreateMarket(formData);
    console.log(formData);
  };

  return (
    <Modal
      sx={{ overflow: "auto" }}
      open={createModalopen}
      onClose={handleModalClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      key={1}
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography id="modal-title" variant="h6" component="h2" mb={2}>
          Create New Market
        </Typography>

        {/* Form Fields */}
        <TextField
          fullWidth
          label="_name"
          variant="outlined"
          margin="normal"
          value={name}
          onChange={(e) => setName(e.target.value)} // Handle name input
        />
        <TextField
          fullWidth
          label="_usdAmntLP"
          variant="outlined"
          margin="normal"
          value={usdAmntLP}
          type="number"
          onChange={(e) => setUsdAmntLP(e.target.value)} // Handle usdAmntLP input
        />
        <TimestampForm
          label="_dtCallDeadline"
          onSubmitValue={setDtCallDeadline}
        />
        <TimestampForm
          label="_dtResultVoteStart"
          onSubmitValue={setDtResultVoteStart}
        />
        <TimestampForm
          label="_dtResultVoteEnd"
          onSubmitValue={setDtResultVoteEnd}
        />
        {Array(resultNum)
          .fill("")
          .map((item, key) => (
            <Box
              m={(2, 0)}
              display="flex"
              justifyContent="space-between"
              flexDirection="row"
            >
              <TextField
                sx={{ mr: 2 }}
                label={
                  resultNum > 1 ? `_resultLabel(${key + 1})` : `_resultLabel`
                }
                variant="outlined"
                margin="normal"
                onChange={(e) => handleResultLabels(e.target.value, key)}
                placeholder="YES"
              />
              <TextField
                fullWidth
                label={
                  resultNum > 1 ? `_resultDescr(${key + 1})` : `_resultDescr`
                }
                variant="outlined"
                margin="normal"
                onChange={(e) => handleResultDescrs(e.target.value, key)}
                placeholder="YES means A win"
              />
            </Box>
          ))}

        {/* Add Outcome and Submit Buttons */}
        <Box mt={3} display="flex" justifyContent="space-between">
          <Button variant="outlined" color="info" onClick={handleAddResult}>
            Add Outcome
          </Button>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Submit
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default CreateMarketModal;
