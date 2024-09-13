import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import abi from "./abi/CallitFactory.abi.json";
// import { abi } from "../constants/abi";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Link from "next/link";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  IconButton,
  Modal,
} from "@mui/material";
import MarketCard from "../components/MarketCard";

import {
  makeNewMarket,
  buyCallTicketWithPromoCode,
  exeAerriceParityForTicket,
  closeMarketCallsForTicket,
  castVoteForMarketTicket,
  closeMarketForTicket,
  claimTicketRewards,
  claimVoterRewards,
  claimPromotorRewards,
  setMarketInfo,
} from "../constants/contractActions";
import web3 from "../components/Connector";
import { styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import InputBase from "@mui/material/InputBase";
import TimestampForm from "../components/TimestampForm";
import CreateMarketModal from "../components/CreateMarketModal";
import SetMarketInfoModal from "../components/SetMarketInfoModal";

import { contractAddress } from "../constants/address";

// Custom style for the search bar
const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: "#f1f1f1",
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: "20ch",
    },
  },
}));

export const injected = new InjectedConnector();

const MarketArray = [
  {
    id: 2423,
    title: "2024 Presidential Election",
    prediction: "Kamala Harris vs Donald Trump",
    bets: "$5,000.2m Bet",
    participants: "15,000",
  },
  {
    id: 2423,
    title: "Popular Vote Winner",
    prediction: "Kamala Harris",
    bets: "$4,723.9m Bet",
    participants: "15,000",
  },
  {
    id: 13684,
    title: "Super Bowl Champion 2025",
    prediction: "Chiefs",
    bets: "$3,123.8m Bet",
    participants: "15,000",
  },
  {
    id: 463,
    title: "2024 Presidential Election",
    prediction: "Kamala Harris vs Donald Trump",
    bets: "$5,000.2m Bet",
    participants: "15,000",
  },
  {
    id: 2246264423,
    title: "Popular Vote Winner",
    prediction: "Kamala Harris",
    bets: "$4,723.9m Bet",
    participants: "15,000",
  },
  {
    id: 456,
    title: "Super Bowl Champion 2025",
    prediction: "Chiefs",
    bets: "$3,123.8m Bet",
    participants: "15,000",
  },
];

export default function Home() {
  // const [address, setAddress] = useState(null);
  const [marketParams, setMarketParams] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [ticketId, setTicketId] = useState("");
  const [marketId, setMarketId] = useState("");
  const [vote, setVote] = useState("");

  const [hasMetamask, setHasMetamask] = useState(null);

  const [createModalopen, setCreateModalOpen] = useState(false);
  const [setInfoModalOpen, setSetInfoModalOpen] = useState(false);

  const {
    active,
    activate,
    chainId,
    account,
    library: provider,
  } = useWeb3React();

  // Functions to handle modal close
  const handleCreateModalOpen = () => setCreateModalOpen(true);

  const handleCreateModalClose = () => setCreateModalOpen(false);

  const handleSetInfoModalOpen = () => setSetInfoModalOpen(true);

  const handleSetInfoModalClose = () => setSetInfoModalOpen(false);

  // Connect to MetaMask
  const connectWallet = async () => {
    try {
      await activate(injected);
      setHasMetamask(true);
      console.log("User's wallet address:", account);
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
    }
  };

  // Trigger market creation
  const handleCreateMarket = async (marketParams) => {
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);

    try {
      const gasOptions = {
        gasLimit: ethers.utils.hexlify(15000000), // Set your gas limit
        maxPriorityFeePerGas: ethers.utils.parseUnits("2.5", "gwei"), // Set the priority fee
        maxFeePerGas: ethers.utils.parseUnits("1000000", "gwei"), // Set the max fee
      };
      await makeNewMarket(contract, marketParams, gasOptions);
      console.log("Market created successfully!");
    } catch (error) {
      console.error("Error creating market:", error);
    }
  };

  // Trigger set market infomation
  const handleSetMarketInfo = async (params) => {
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);

    try {
      await setMarketInfo(contract, params);
      console.log("Market Info Updated!");
    } catch (error) {
      console.error("Error creating market:", error);
    }
  };

  // Trigger buy ticket with promo code
  const handleBuyTicket = async () => {
    try {
      await buyCallTicketWithPromoCode(contractAddress, promoCode);
      console.log("Ticket bought successfully!");
    } catch (error) {
      console.error("Error buying ticket:", error);
    }
  };
  // Add similar handlers for all other functions like exeAerriceParityForTicket, castVoteForMarketTicket, claim rewards, etc.

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      setHasMetamask(true);
    }
  });

  async function execute() {
    if (active) {
      const signer = provider.getSigner();
      console.log("User's wallet address:", account);
      const contract = new ethers.Contract(contractAddress, abi, signer);
      try {
        await contract.store(42);
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log("Please install MetaMask");
    }
  }

  return (
    <>
      {/* Top Navigation */}
      <AppBar position="static" color="default" elevation={0}>
        <Toolbar>
          <Typography variant="h6" color="inherit" noWrap sx={{ flexGrow: 1 }}>
            Polymarket
          </Typography>

          {/* Search Bar */}
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search markets"
              inputProps={{ "aria-label": "search" }}
            />
          </Search>

          <Button variant="contained" color="primary" sx={{ marginRight: 2 }}>
            Log In
          </Button>
          <Button variant="outlined" color="primary">
            Sign Up
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ marginTop: 4 }}>
        <Box
          display="flex"
          flexDirection={{ xs: "column", md: "row" }}
          justifyContent="space-between"
        >
          {/* Left Column for Market Cards */}
          <Box flex="1" marginRight={{ md: 2 }}>
            <Typography variant="h5" gutterBottom>
              Top Markets
            </Typography>

            {/* Market Cards */}
            <Box
              display="flex"
              flexDirection="row"
              flexWrap="wrap"
              justifyContent="space-around"
              sx={{ padding: 2 }}
            >
              {MarketArray.map((market, index) => (
                <MarketCard
                  id={market.id}
                  key={index}
                  title={market.title}
                  prediction={market.prediction}
                  bets={market.bets}
                  participants={market.participants}
                />
              ))}
            </Box>

            {/* View All Button */}
            <Box sx={{ textAlign: "center", marginTop: 4 }}>
              <Button variant="contained" color="primary">
                View All
              </Button>
            </Box>
          </Box>

          {/* Right Column for Side Sections */}
          <Box flexBasis="300px">
            <Box sx={{ textAlign: "center", marginTop: 4 }}>
              {hasMetamask ? (
                active ? (
                  "Connected Successfully! "
                ) : (
                  <Button
                    variant="contained"
                    color="error"
                    onClick={connectWallet}
                  >
                    Connect MetaMask
                  </Button>
                )
              ) : (
                <h3>"Please install metamask"</h3>
              )}
            </Box>
            <Box sx={{ textAlign: "center", marginTop: 4 }}>
              {active ? (
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleCreateModalOpen}
                >
                  Create New Market
                </Button>
              ) : (
                <Button variant="contained" color="warning" disabled>
                  Create New Market
                </Button>
              )}
            </Box>

            {/* Set Market Info: For test */}
            <Box sx={{ textAlign: "center", marginTop: 4 }}>
              <Button
                variant="contained"
                color="info"
                onClick={handleSetInfoModalOpen}
              >
                SetMarketInfo(test)
              </Button>
            </Box>

            {/* Sidebar Widget: Election Forecast */}
            <Card sx={{ marginBottom: 2 }}>
              <CardContent>
                <Typography variant="h6">2024 Election Forecast</Typography>
                <Button variant="contained" fullWidth sx={{ marginTop: 2 }}>
                  View
                </Button>
              </CardContent>
            </Card>

            {/* Sidebar Widget: Recent Activity */}
            <Card sx={{ marginBottom: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Activity
                </Typography>
                {["User1 bet $1000 on Harris", "User2 bet $2000 on Trump"].map(
                  (activity, index) => (
                    <Typography
                      key={index}
                      variant="body2"
                      color="text.secondary"
                    >
                      {activity}
                    </Typography>
                  )
                )}
              </CardContent>
            </Card>

            {/* Sidebar Widget: Top Volume */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Top Volume This Week
                </Typography>
                {["UserA: $1.2m", "UserB: $800k"].map((volume, index) => (
                  <Typography
                    key={index}
                    variant="body2"
                    color="text.secondary"
                  >
                    {volume}
                  </Typography>
                ))}
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>

      {/* Footer */}
      <Box
        sx={{
          backgroundColor: "#1976d2",
          color: "#fff",
          padding: 2,
          marginTop: 6,
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body1" align="center">
            © 2024 Polymarket. All rights reserved.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="sm">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome to the Prediction Market App
          </Typography>
          <Link href="/about" passHref>
            <Button variant="contained" color="primary">
              About Us
            </Button>
          </Link>
          <Link href="/contact" passHref>
            <Button variant="outlined" color="secondary" sx={{ ml: 2 }}>
              Contact Us
            </Button>
          </Link>
          <Link href="/market" passHref>
            <Button variant="outlined" color="secondary" sx={{ ml: 2 }}>
              Market Page
            </Button>
          </Link>
        </Box>
        <div></div>
      </Container>
      <Container maxWidth="md">
        <Typography variant="h4" gutterBottom>
          Prediction Market dApp
        </Typography>
        <Typography variant="h6" gutterBottom>
          {hasMetamask ? (
            active ? (
              "Connected Successfully! "
            ) : (
              <Button variant="outlined" onClick={connectWallet}>
                Connect MetaMask
              </Button>
            )
          ) : (
            "Please install metamask"
          )}

          {active ? <button onClick={() => execute()}>Execute</button> : ""}
        </Typography>

        <Typography variant="h6" gutterBottom>
          Create a New Market
        </Typography>
        <TextField
          label="Market Parameters"
          value={marketParams}
          onChange={(e) => setMarketParams(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreateMarket}
        >
          Create Market
        </Button>

        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          Buy Call Ticket with Promo Code
        </Typography>
        <TextField
          label="Promo Code"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <Button variant="contained" color="secondary" onClick={handleBuyTicket}>
          Buy Ticket
        </Button>
      </Container>

      {/* Modal */}
      <CreateMarketModal
        createModalopen={createModalopen}
        handleCreateModalClose={handleCreateModalClose}
        handleCreateMarket={handleCreateMarket}
      />

      <SetMarketInfoModal
        setInfoModalOpen={setInfoModalOpen}
        handleSetInfoModalClose={handleSetInfoModalClose}
        handleSetMarketInfo={handleSetMarketInfo}
      />
    </>
  );
}
