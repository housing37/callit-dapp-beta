import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import factoryAbi from "./abi/CallitFactory.abi.json";
import vaultAbi from "./abi/CallitVault.abi.json";
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
  FormControl,
  FormGroup,
  InputLabel,
  Select,
  OutlinedInput,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from "@mui/material";

import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
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
  getUSDBalance,
  getMarketsForMakerOrCategory,
  depositToVault,
  getMarketCntForMakerOrCategory,
} from "../constants/contractActions";
import { styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import InputBase from "@mui/material/InputBase";

import MarketCard from "../components/MarketCard";
import CreateMarketModal from "../components/CreateMarketModal";
import SetMarketInfoModal from "../components/SetMarketInfoModal";

import {
  contractAddress,
  ADDR_FACT,
  ADDR_VAULT,
  ADDR_DELEGATE,
} from "../constants/address";
import DepositToVaultModal from "../components/DepositToVaultModal";

// version display
export const currentVersion = "0.51";

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

export default function Home() {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  //Wallet Connecting States
  const [balance, setBalance] = useState(null);
  const [hasMetamask, setHasMetamask] = useState(null);
  const {
    active,
    activate,
    chainId,
    account,
    library: provider,
  } = useWeb3React();

  //Markets Management States
  const [onlyMyMarkets, setOnlyMyMarkets] = useState(false); //Checkbox for mine filter
  const [marketCategory, setMarketCategory] = useState(""); //Combobox for category filter
  const [marketsList, setMarketsList] = useState([]); //Main Data for Grid View
  let marketsArray = [];
  const [ticketForSetInfo, setTicketForSetInfo] = useState(""); // input as _anyTicket for SM setMarketInfo

  //Modal Control States
  const [createModalopen, setCreateModalOpen] = useState(false);
  const [setInfoModalOpen, setSetInfoModalOpen] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);

  //For Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const maxCntPerPage = 6;
  const handlePaginationChange = (event, value) => {
    setPage(value);
  };

  // Using useEffect to fetch data when the component mounts
  const [loading, setLoading] = useState(true); // For Spinner Screen - potential
  useEffect(() => {
    refreshMarketList();
    handleGetBalance();
    console.log("mark: first useEffect");
  }, [account, onlyMyMarkets, marketCategory, page, totalPages]);

  useEffect(() => {
    refreshMarketList();
  }, []); // Empty dependency array means this effect runs only once when the component mounts
  const refreshMarketList = async () => {
    console.log("Market List refreshing...");
    // if (account == undefined) {
    //   setLoading(false);
    //   return;
    // }

    let maker = "";
    if (onlyMyMarkets) maker = account;
    else maker = "0x0000000000000000000000000000000000000000";

    const marektCnt = await handleGetMarketCntForMakerOrCategory({
      _maker: maker,
      _category: marketCategory,
    });
    console.log("market count: ", marektCnt);

    //page control
    setTotalPages(Math.ceil(marektCnt / maxCntPerPage));
    console.log("ceil value is ", Math.ceil(marektCnt / maxCntPerPage));
    console.log("totalPage is ", totalPages);

    let idxStart = (page - 1) * maxCntPerPage;
    let retCnt =
      page < totalPages
        ? maxCntPerPage
        : marektCnt % maxCntPerPage == 0
        ? maxCntPerPage
        : marektCnt % maxCntPerPage;
    const params = {
      _category: marketCategory,
      _maker: maker,
      _all: true,
      _live: true,
      _idxStart: idxStart,
      _retCnt: retCnt,
    };
    console.log("getMarkets Function's params: ", params);
    const tempArray = await handleGetMarketsForMakerOrCategory(params);
    if (tempArray == undefined) return;
    console.log("marketArray displays :", tempArray.length);
    for (let i = 0; i < tempArray.length; i++) {
      marketsArray[i] = {
        marketNum: tempArray[i]["marketNum"],
        name: tempArray[i]["name"],
        imgURL: tempArray[i]["imgURL"],
        maker: tempArray[i]["maker"],
        category: tempArray[i]["category"],
        live: tempArray[i]["live"],
        rules: tempArray[i]["rules"],
        winningVoteResult: tempArray[i]["winningVoteResult"],
        blockNumber: tempArray[i]["blockNumber"],
        blockTimestamp: tempArray[i]["blockTimestamp"],
        marketResults: { resultLabels: [], resultOptionTokens: [] },
      };
      for (
        let j = 0;
        j < tempArray[i]["marketResults"]["resultLabels"].length;
        j++
      ) {
        marketsArray[i].marketResults.resultLabels[j] =
          tempArray[i]["marketResults"]["resultLabels"][j];
        marketsArray[i].marketResults.resultOptionTokens[j] =
          tempArray[i]["marketResults"]["resultOptionTokens"][j];
      }
    }
    setMarketsList(marketsArray);
    setLoading(false);
    console.log("Market List Updated");
  };
  //Functions to manage markets
  const handleMarketCheck = () => {
    if (account == undefined) {
      setOnlyMyMarkets(false);
      return;
    }
    if (onlyMyMarkets) setOnlyMyMarkets(false);
    else setOnlyMyMarkets(true);
  };
  const handleCategorySelect = (event) => {
    setMarketCategory(event.target.value); // Update the age state based on the selected value
  };

  // Functions to handle modal actions
  const handleCreateModalOpen = () => setCreateModalOpen(true);

  const handleCreateModalClose = () => setCreateModalOpen(false);

  const handleSetInfoModalOpen = () => setSetInfoModalOpen(true);

  const handleSetInfoModalClose = () => setSetInfoModalOpen(false);

  const handleDepositModalOpen = () => setDepositModalOpen(true);

  const handleDepositModalClose = () => setDepositModalOpen(false);

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

  // Get balance from vault
  const handleGetBalance = async () => {
    try {
      const signer = provider.getSigner();
      const contract = new ethers.Contract(ADDR_VAULT, vaultAbi, signer);
      const usdBalance = await getUSDBalance(contract, {
        _acct: account,
      });
      setBalance(usdBalance.toNumber() / 10 ** 6);
    } catch (error) {
      console.error("Error getting your balance:", error);
    }
  };

  // Trigger market creation
  const handleCreateMarket = async (marketParams) => {
    const signer = provider.getSigner();
    const contract = new ethers.Contract(ADDR_FACT, factoryAbi, signer);

    try {
      await makeNewMarket(contract, marketParams);
      console.log("Market created successfully!");
    } catch (error) {
      console.error("Error creating market:", error);
    }
    await refreshMarketList();
    handleGetBalance();
    handleCreateModalClose();
  };

  // Trigger set market infomation
  const handleSetMarketInfo = async (params) => {
    try {
      const signer = provider.getSigner();
      const contract = new ethers.Contract(ADDR_FACT, factoryAbi, signer);
      await setMarketInfo(contract, params);
      console.log("Market Info Updated!");
    } catch (error) {
      console.error("Error updating market:", error);
    }
    await refreshMarketList();
    handleSetInfoModalClose();
  };

  // Trigger
  const handleGetMarketsForMakerOrCategory = async (params) => {
    try {
      // const signer = provider.getSigner();
      const provider = new ethers.providers.JsonRpcProvider(
        "https://rpc.ankr.com/eth"
      );
      const contract = new ethers.Contract(ADDR_FACT, factoryAbi, provider);
      const marketsArray = await getMarketsForMakerOrCategory(contract, params);
      // await getMarketHashesForMakerOrCategory(contract,params); //TEST

      return marketsArray;
    } catch (error) {
      console.error("Error getting markets:", error);
    }
  };

  // Trigger
  const handleGetMarketCntForMakerOrCategory = async (params) => {
    try {
      // const signer = provider.getSigner();
      const provider = new ethers.providers.JsonRpcProvider(
        "https://rpc.ankr.com/eth"
      );
      const contract = new ethers.Contract(ADDR_FACT, factoryAbi, provider);
      const count = await getMarketCntForMakerOrCategory(contract, params);
      console.log("Market Count For Category Called: ", count);
      return count;
    } catch (error) {
      console.error("Error getting markets:", error);
    }
  };

  // Trigger
  const handleDepositToVault = async (params) => {
    try {
      const signer = provider.getSigner();
      const contract = new ethers.Contract(ADDR_VAULT, vaultAbi, signer);
      await depositToVault(contract, params);
      console.log("You deposited successfully");
      handleGetBalance();
    } catch (error) {
      console.error("Error depositing:", error);
    }
    handleDepositModalClose();
  };

  // Add similar handlers for all other functions like exeAerriceParityForTicket, castVoteForMarketTicket, claim rewards, etc.

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      setHasMetamask(true);
    }
  }, [setHasMetamask]);

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
      <div className="navbar" position="static" color="default" elevation={0}>
        <Toolbar>
          <Typography
            variant="h6"
            color="inherit"
            noWrap
            sx={{ flexGrow: 1 }}
            style={{ cursor: "pointer" }}
            component="a"
            href="/"
          >
            <div
              onMouseEnter={() => setIsHovered(true)} // Set hover state to true on mouse enter
              onMouseLeave={() => setIsHovered(false)} // Set hover state to false on mouse leave
              onClick={() => router.push("/")} // Navigate on click
              className="logo-container"
            >
              <Image
                src={isHovered ? "/logo.png" : "/logo_short.png"} // Switch image based on hover state
                alt="Call-It Logo"
                width={150}
                height={50}
                className={isHovered ? "slide-right" : "slide-left"} // Apply CSS class based on hover state
              />
              {`v${currentVersion}`}
            </div>
          </Typography>

          {/* Category Dropdown */}
          <FormControl
            margin="none"
            sx={{
              width: 150,
              mx: 4,
              border: "1px solid white", // Adds a white border
              borderRadius: "4px", // Optional: Adds rounded corners
              "&:hover": {
                border: "1px solid white", // Keeps the border white on hover
              },
              "&.Mui-focused": {
                border: "1px solid white", // Keeps the border white when focused
              },
            }}
          >
            <Select
              displayEmpty
              inputProps={{ "aria-label": "Without label" }}
              value={marketCategory}
              onChange={handleCategorySelect}
              sx={{
                padding: 0,
                color: "white", // Makes the font white
                "& .MuiSelect-select": {
                  padding: "8px 16px", // Adjusts padding to make it look better
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    backgroundColor: "black", // Makes the dropdown background black
                    color: "white", // Ensures the font in the dropdown is also white
                  },
                },
              }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Sports">Sports</MenuItem>
              <MenuItem value="Current Events">Current Events</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>

          {/* My Markets */}
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={onlyMyMarkets}
                  onChange={handleMarketCheck}
                />
              }
              label={`My Markets`}
            />
          </FormGroup>

          {/* Search Bar */}
          <Search style={{ backgroundColor: "black" }}>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search markets"
              inputProps={{ "aria-label": "search" }}
            />
          </Search>
          {hasMetamask ? (
            active ? (
              <Button
                variant="outlined"
                color="info"
                onClick={handleGetBalance}
              >
                balance : ${balance != null ? balance : "Press me"}
              </Button>
            ) : (
              <div
                className="button"
                fullwidth="true"
                variant="contained"
                color="error"
                onClick={connectWallet}
              >
                CONNECT METAMASK
              </div>
            )
          ) : (
            <div className="button-container">
              <h2>Install metamask, please.</h2>
            </div>
          )}
        </Toolbar>
      </div>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ marginTop: 4 }}>
        <Stack spacing={2} alignItems="center">
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePaginationChange}
          />

          <div
            className="typography"
            variant="h10"
            component="h5"
            gutterbottom="true"
            align="center"
          >
            <Image
              src="/logo.png"
              alt="Call-It Logo"
              width={300}
              height={100}
              onClick={() => router.push("/")}
            />
          </div>
          <p>Decentralized, Democratized Betting Markets</p>
          <br />
        </Stack>
        <Box
          display="flex"
          flexDirection={{ xs: "column", md: "row" }}
          justifyContent="space-between"
        >
          {/* Left Column for Side Sections */}
          <Box flexBasis="300px">
            <Box sx={{ textAlign: "center", marginTop: 4 }}>
              <div className="typography" variant="h5" gutterbottom="true">
                Welcome to Call-It!
              </div>
              <div className="container">
                <p style={{ textAlign: "left" }}>
                  <h1>
                    <b>USD balance is required to:</b>
                  </h1>
                  <h2>
                    <p>1) Create new markets</p>
                    <p>2) Buy call tickets w/ promo codes</p>
                    <p>3) Execute Arbitrage Price Parity for tickets</p>
                  </h2>
                </p>
                {/* <p>USD balance is required to:</p>
                <ul style={{ textAlign: 'left' }}>
                    <li>create markets</li>
                    <li>Make calls with promo codes</li>
                    <li>Execute Arbitrage Price Parity</li>
                </ul> */}
                {active ? (
                  <>
                    <h2>
                      <u>Your Wallet Connected</u>
                    </h2>
                    <h3>
                      <b>{account}</b>
                    </h3>
                  </>
                ) : null}

                <div>
                  <h4>
                    To make a USD deposit, transfer native PLS to the
                    CallitVault <b>{ADDR_VAULT}</b>
                  </h4>
                </div>
                <h3>
                  <Typography
                    sx={{
                      fontStyle: "normal",
                      fontWeight: "normal",
                      lineHeight: "24px",
                      fontSize: "14px",
                      letterSpacing: "0.18px",
                      color: "#FFFFFF",
                      margin: "0px 0px",
                      textDecoration: "underline",
                      cursor: "pointer",
                    }}
                    onClick={handleDepositModalOpen}
                  >
                    Make deposit for someone else (testing)
                  </Typography>
                </h3>
              </div>
            </Box>
            <Box sx={{ textAlign: "center", marginTop: 4 }}>
              {active ? (
                <div className="button-container">
                  <div
                    className="button"
                    fullwidth="true"
                    variant="contained"
                    color="error"
                    onClick={handleCreateModalOpen}
                  >
                    CREATE NEW MARKET
                  </div>
                </div>
              ) : (
                <Box sx={{ textAlign: "center", marginTop: 4 }}>
                  <div className="button-container">
                    <button className="button1 disabled">
                      CREATE NEW MARKET
                    </button>
                  </div>
                </Box>
              )}
            </Box>
            <Box sx={{ textAlign: "center", marginTop: 4 }}>
              <div className="button-container">
                <div
                  className="button1"
                  fullwidth="true"
                  variant="contained"
                  color="warning"
                >
                  CLAIM VOTER REWARDS
                </div>
              </div>
            </Box>
            <Box sx={{ textAlign: "center", marginTop: 4 }}>
              <div className="button-container">
                <div
                  className="button1"
                  fullwidth="true"
                  variant="contained"
                  color="warning"
                >
                  CLAIM PROMOTOR REWARDS
                </div>
              </div>
            </Box>

            {/* Sidebar Widget: Election Forecast */}
            {/* <Card sx={{ marginBottom: 2 }}>
              <CardContent>
                <Typography variant="h6">2024 Election Forecast</Typography>
                <Button variant="contained" fullwidth="true" sx={{ marginTop: 2 }}>
                  View
                </Button>
              </CardContent>
            </Card> */}

            {/* Sidebar Widget: Recent Activity */}
            {/* <Card sx={{ marginBottom: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterbottom="true">
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
            </Card> */}

            {/* Sidebar Widget: Top Volume */}
            {/* <Card>
              <CardContent>
                <Typography variant="h6" gutterbottom="true">
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
            </Card> */}
          </Box>
          {/* RIght Column for Market Cards */}
          <Box sx={{ textAlign: "center", marginTop: 4 }}>
            <div className="typography" variant="h5" gutterbottom="true">
              Top Markets
            </div>

            {/* Market Cards */}
            <Box
              display="flex"
              flexDirection="row"
              flexWrap="wrap"
              justifyContent="space-around"
              sx={{ padding: 2 }}
            >
              {marketsList.length > 0
                ? marketsList.map((market, index) => (
                    <MarketCard
                      account={account}
                      id={market.marketNum}
                      key={index}
                      title={market.name}
                      maker={market.maker}
                      imgURL={market.imgURL}
                      category={market.category}
                      live={market.live}
                      marketResults={market.marketResults}
                      rules={market.rules}
                      winningVoteResult={market.winningVoteResult}
                      blockNumber={market.blockNumber}
                      blockTimestamp={market.blockTimestamp}
                      isMine={market.maker == account}
                      handleSetInfoModalOpen={handleSetInfoModalOpen}
                      setTicketForSetInfo={setTicketForSetInfo}
                    />
                  ))
                : null}
            </Box>
          </Box>
        </Box>
      </Container>

      {/* Footer */}
      <Box
        sx={{
          background:
            "linear-gradient(40deg, #000000 0%, #1a1a1a 33%, #333333 67%, #4d4d4d 100%)",
          color: "#ffffff",
          padding: 2,
          marginTop: 6,
          fontWeight: "bold", // This makes the font bold
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body1" align="center" fontWeight="bold">
            © 2024 CALL-It. All rights reserved.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="sm">
        <Box
          sx={{
            my: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Link href="/about" passHref>
            <Button
              variant="contained"
              style={{
                background:
                  "linear-gradient(40deg, #ff0000 0%, #e200f3 33%, #314bff 67%, #00b6d1 100%)",
                color: "white", // Ensures the text color is visible
                position: "relative",
                zIndex: 1,
              }}
              sx={{
                mb: 2, // Margin bottom for spacing between buttons
                width: ["100%", "auto"], // Full width on small screens, auto width on larger screens
              }}
            >
              About Us
            </Button>
          </Link>
          <Link href="/contact" passHref>
            <Button
              variant="outlined"
              color="secondary"
              sx={{
                mb: 2,
                width: ["100%", "auto"],
              }}
            >
              Contact Us
            </Button>
          </Link>
          <Link href="/market" passHref>
            <Button
              variant="outlined"
              color="secondary"
              sx={{
                mb: 2,
                width: ["100%", "auto"],
              }}
            >
              Market Page
            </Button>
          </Link>
        </Box>
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
        ticket={ticketForSetInfo}
      />

      <DepositToVaultModal
        depositModalOpen={depositModalOpen}
        handleDepositModalClose={handleDepositModalClose}
        handleDepositToVault={handleDepositToVault}
        balance={balance}
        account={account}
      />
    </>
  );
}
