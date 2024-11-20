import { ethers } from "ethers";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Avatar,
  Box,
  Button,
  Typography,
  Card,
  AppBar,
  Toolbar,
  FormControl,
  Select,
  MenuItem,
  Container,
} from "@mui/material";
import Image from "next/image";
import {
  buyCallTicketWithPromoCode,
  castVoteForMarketTicket,
  exeArbPriceParityForTicket,
  closeMarketCallsForTicket,
  getMarketForTicket,
  getUSDBalance,
} from "../../constants/contractActions";
import { ADDR_FACT, ADDR_VAULT } from "../../constants/address";
import factoryAbi from "../abi/CallitFactory.abi.json";
import vaultAbi from "../abi/CallitVault.abi.json";
import BuyCallTicketModal from "../../components/BuyCallTicketModal";
import TicketButton from "../../components/TicketButton";

import { currentVersion } from "..";
import { getPricePercentDataFromDex } from "../api/getDexData";
import { getNameSymbolDataFromDex } from "../api/getDexData";
import { getLiquidityDataFromDex } from "../api/getDexData";

const colors = {
  primary: "#A45DBB",
  secondary: "#FF0000",
  background: "#151029",
  text: "#FFFFFF",
};

// Trigger
const handleGetMarketDetailForTicket = async (signer, params) => {
  try {
    const contract = new ethers.Contract(ADDR_FACT, factoryAbi, signer);

    let tempArray = await getMarketForTicket(contract, params);
    let marketDetailData = {
      marketNum: tempArray["marketNum"].toNumber(),
      name: tempArray["name"],
      imgURL: tempArray["imgURL"],
      maker: tempArray["maker"],
      marketHash: tempArray["marketHash"],
      category: tempArray["category"],
      live: tempArray["live"],
      rules: tempArray["rules"],
      winningVoteResult: tempArray["winningVoteResult"],
      blockNumber: tempArray["blockNumber"],
      blockTimestamp: tempArray["blockTimestamp"],
      marketResults: {
        outcomeCnt: tempArray["marketResults"]["resultLabels"].length,
        resultLabels: [],
        resultDescrs: [],
        resultOptionTokens: [],
        resultTokenLPs: [],
        resultTokenVotes: [],
      },
      marketDatetimes: {
        dtCallDeadline:
          tempArray["marketDatetimes"]["dtCallDeadline"].toNumber(),
        dtResultVoteStart:
          tempArray["marketDatetimes"]["dtResultVoteStart"].toNumber(),
        dtResultVoteEnd:
          tempArray["marketDatetimes"]["dtResultVoteEnd"].toNumber(),
      },
      marketUsdAmnts: {
        usdAmntLP: null,
        usdAmntPrizePool: null,
        usdAmntPrizePool_net: null,
        usdRewwardPerVote: null,
        usdVoterRewardPool: null,
      },
    };
    for (let j = 0; j < marketDetailData.marketResults.outcomeCnt; j++) {
      marketDetailData.marketResults.resultLabels[j] =
        tempArray["marketResults"]["resultLabels"][j];
      marketDetailData.marketResults.resultDescrs[j] =
        tempArray["marketResults"]["resultDescrs"][j];
      marketDetailData.marketResults.resultOptionTokens[j] =
        tempArray["marketResults"]["resultOptionTokens"][j];
      marketDetailData.marketResults.resultTokenLPs[j] =
        tempArray["marketResults"]["resultTokenLPs"][j];
      marketDetailData.marketResults.resultTokenVotes[j] =
        tempArray["marketResults"]["resultTokenVotes"][j];

      marketDetailData.marketUsdAmnts.usdAmntLP =
        tempArray["marketUsdAmnts"]["usdAmntLP"].toNumber();
      marketDetailData.marketUsdAmnts.usdAmntPrizePool =
        tempArray["marketUsdAmnts"]["usdAmntPrizePool"].toNumber();
      marketDetailData.marketUsdAmnts.usdAmntPrizePool_net =
        tempArray["marketUsdAmnts"]["usdAmntPrizePool_net"].toNumber();
      marketDetailData.marketUsdAmnts.usdRewardPerVote =
        tempArray["marketUsdAmnts"]["usdRewardPerVote"].toNumber();
      marketDetailData.marketUsdAmnts.usdVoterRewardPool =
        tempArray["marketUsdAmnts"]["usdVoterRewardPool"].toNumber();
    }
    return marketDetailData;
    // return tempArray.json();
  } catch (error) {
    console.error("Error getting market detail :", error);
  }
};

const MarketPage = () => {
  const router = useRouter();
  const { id, account } = router.query;

  const [signer, setSigner] = useState(null);
  const [balance, setBalance] = useState(null);
  const [marketDetailData, setMarketDetailData] = useState(null);
  const [pricePercent, setPricePercent] = useState([]);
  const [nameSymbol, setNameSymbol] = useState([]);
  const [usdLiquidty, setUsdLquidity] = useState(-1);

  // To Buy Ticket
  const [buyTicketModalOpen, setBuyTicketModalOpen] = useState(false);
  const [ticketAddr, setTicketAddr] = useState(null);

  // To castVote
  const [voteOption, setVoteOption] = useState("");

  useEffect(() => {
    if (account == "") {
      console.log("no account");
    }
    if (account) {
      // Create an ethers provider from the URL (web3 provider)
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);

      // Ensure provider is connected
      web3Provider.ready
        .then(() => {
          const signer = web3Provider.getSigner(); // Get the signer from the provider
          setSigner(signer);
          console.log("Signer is set successfully!");
        })
        .catch((error) => {
          console.error("Error setting up signer:", error);
        });
    } else {
      const provider = new ethers.providers.JsonRpcProvider(
        "https://rpc.pulsechain.com"
      );
      setSigner(provider);
    }
  }, [account]);

  // Another useEffect for handling the market detail call
  useEffect(async () => {
    handleGetBalance();
    if (signer && id) {
      const detailData = await handleGetMarketDetailForTicket(signer, {
        _ticket: id,
      });
      setMarketDetailData(detailData);
    }
  }, [signer, id]); // Re-run only when `signer` or `id` changes

  useEffect(async () => {
    let priceStrArr = [];
    let nameSymbStr = [];
    let usdLiquidity = 0;
    if (marketDetailData != undefined) {
      for (
        let i = 0;
        i < marketDetailData.marketResults.resultOptionTokens.length;
        i++
      ) {
        let tokAddr = marketDetailData.marketResults.resultOptionTokens[i];
        priceStrArr.push(await getPricePercentDataFromDex(tokAddr));
        nameSymbStr.push(await getNameSymbolDataFromDex(tokAddr));
        usdLiquidity += await getLiquidityDataFromDex(tokAddr);
      }

      setPricePercent(priceStrArr);
      setNameSymbol(nameSymbStr);
      setUsdLquidity(usdLiquidity);

      setDeadlineDate(
        convertUnixTimestampToDateTime(
          marketDetailData.marketDatetimes.dtCallDeadline
        )
      );
      setVotingStartDate(
        convertUnixTimestampToDateTime(
          marketDetailData.marketDatetimes.dtResultVoteStart
        )
      );
      setVotingEndDate(
        convertUnixTimestampToDateTime(
          marketDetailData.marketDatetimes.dtResultVoteEnd
        )
      );
    }
  }, [marketDetailData]);

  // Get balance from vault
  const handleGetBalance = async () => {
    try {
      const contract = new ethers.Contract(ADDR_VAULT, vaultAbi, signer);
      const usdBalance = await getUSDBalance(contract, {
        _acct: account,
      });
      setBalance(usdBalance.toNumber() / 10 ** 6);
    } catch (error) {
      console.error("Error getting your balance:", error);
    }
  };

  // Trigger when ticket button is pressed
  const handleBuyTicketModalOpen = () => setBuyTicketModalOpen(true);

  const handleBuyTicketModalClose = () => setBuyTicketModalOpen(false);

  const handleBuyTicketWithPromoCode = async (params) => {
    try {
      const contract = new ethers.Contract(ADDR_FACT, factoryAbi, signer);
      await buyCallTicketWithPromoCode(contract, params);
      handleBuyTicketModalClose();
      handleGetBalance();
    } catch (error) {
      console.error("Error buying Ticket:", error);
    }
  };

  const handleVoteSelect = (event) => {
    setVoteOption(event.target.value);
  };

  useEffect(() => {
    if (marketDetailData == undefined || voteOption == "") return;
    console.log("voteOption selected: ", voteOption);

    handleCastVoteForMarketTicket({
      _senderTicketHash:
        marketDetailData.marketResults.resultOptionTokens[voteOption],
      _markHash: marketDetailData.marketHash,
    });
  }, [voteOption]);

  const handleCastVoteForMarketTicket = async (params) => {
    try {
      console.log("castVote params...", params);
      const contract = new ethers.Contract(ADDR_FACT, factoryAbi, signer);
      await castVoteForMarketTicket(contract, params);
      handleGetBalance();
    } catch (error) {
      console.error("Error Cast Vote:", error);
    }
  };

  const [deadlineDate, setDeadlineDate] = useState("");
  const [votingStartDate, setVotingStartDate] = useState("");
  const [votingEndDate, setVotingEndDate] = useState("");
  const convertUnixTimestampToDateTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: userTimezone, // Specify your desired timezone
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });

    return formatter.format(date);
  };

  const handleCloseMarketCallsModalOpen = async (params) => {
    try {
      const contract = new ethers.Contract(ADDR_FACT, factoryAbi, signer);
      await closeMarketCallsForTicket(contract, params);
    } catch (error) {
      console.error(" error w/ closeMarketCallsForTicket ");
    }
  };

  const handleExeArbPriceParityForTicket = async (params) => {
    try {
      const contract = new ethers.Contract(ADDR_FACT, factoryAbi, signer);
      await exeArbPriceParityForTicket(contract, params);
    } catch (error) {
      console.error("Error ExeArbPriceParity: ", error);
    }
  };

  // State to hold all token names and symbols from dex screener
  const [tokenData, setTokenData] = useState({});

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
            component="a" // This tells the Toolbar to behave like an anchor
            href="/"
          >
            <div className="logo-container">
              <Image
                src="/logo.png"
                alt="Call-It Logo"
                width={150}
                height={50}
                onClick={() => router.push("/")}
              />
              {`v${currentVersion}`}
            </div>
          </Typography>
          {account ? (
            <Button variant="outlined" color="info" onClick={handleGetBalance}>
              balance : ${balance != null ? balance : "Press me"}
            </Button>
          ) : (
            <Button
              variant="outlined"
              color="info"
              onClick={() =>
                alert("Please back to the landing page and connect wallet!")
              }
            >
              {`Balance : ???`}
            </Button>
          )}
        </Toolbar>
      </div>
      <Container maxWidth={false} sx={{ marginTop: 4 }}>
        <Box
          sx={{
            padding: "20px",
            display: "flex",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          {/* Left Section */}
          <Card
            sx={{
              padding: {
                xs: "5px", // For extra small devices (mobile phones)
                sm: "10px", // For small devices (tablets)
                md: "15px", // For medium devices (desktops)
              },
              borderRadius: 2,
              boxShadow: 3,
              marginTop: {
                xs: "5px", // Margin for small screens
                sm: "15px", // Center margin for medium and larger screens
                md: "15px", // For desktops
              },
              width: "max-content",
              color: "white",
              background: ` radial-gradient(circle at 100% 100%, #1a1a1a 0, #1a1a1a 5px, transparent 5px) 0% 0%/8px 8px no-repeat,
  radial-gradient(circle at 0 100%, #1a1a1a 0, #1a1a1a 5px, transparent 5px) 100% 0%/8px 8px no-repeat,
  radial-gradient(circle at 100% 0, #0d0d0d 0, #0d0d0d 5px, transparent 5px) 0% 100%/8px 8px no-repeat,
  radial-gradient(circle at 0 0, #0d0d0d 0, #0d0d0d 5px, transparent 5px) 100% 100%/8px 8px no-repeat,
  linear-gradient(#1a1a1a, #0d0d0d) 50% 50%/calc(100% - 6px) calc(100% - 16px) no-repeat,
  linear-gradient(#1a1a1a, #0d0d0d) 50% 50%/calc(100% - 16px) calc(100% - 6px) no-repeat,
   rgb(230, 1, 1)`,
              boxShadow: `inset 0 0 15px rgba(164, 93, 187, 0.8), 
                0 0 20px 10px rgba(164, 93, 187, 0.3)`,
              transition: "border 0.2s ease-in-out",
              "&:hover": {
                border: "1px solid darkblue",
              },
            }}
          >
            <Box
              display="flex"
              alignItems="center"
              mb={3}
              sx={{
                flexDirection: { xs: "column", sm: "row" }, // Stack vertically on smaller screens
              }}
            >
              <Avatar
                alt="Vote"
                src="/vote_img.jpg"
                sx={{
                  width: { xs: 50, sm: 80 }, // Smaller width for mobile, larger for desktop
                  height: { xs: 50, sm: 80 },
                  marginRight: { xs: 0, sm: 2 }, // No margin on mobile
                  mb: { xs: 1, sm: 0 }, // Add margin bottom on mobile for stacking
                }}
              />
              {marketDetailData &&
              marketDetailData.name &&
              marketDetailData.marketUsdAmnts ? (
                <Box>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    sx={{
                      fontSize: { xs: "1.2rem", sm: "1.5rem" }, // Smaller font size for mobile
                      textAlign: { xs: "center", sm: "left" },
                    }}
                  >
                    {marketDetailData.name} &nbsp; • &nbsp;
                    {marketDetailData.category
                      ? marketDetailData.category
                      : "<category>"}{" "}
                    &nbsp;
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: colors.text,
                      fontSize: { xs: "0.875rem", sm: "1rem" }, // Adjust font size for mobile
                      textAlign: { xs: "center", sm: "left" },
                    }}
                  >
                    <b>Status:</b>{" "}
                    {`${
                      marketDetailData.marketDatetimes.dtCallDeadline <
                      Math.floor(Date.now() / 1000)
                        ? "call deadline passed"
                        : "CALLS OPEN"
                    }`}{" "}
                    &nbsp;
                    {`${
                      marketDetailData.marketDatetimes.dtResultVoteStart <
                      Math.floor(Date.now() / 1000)
                        ? marketDetailData.marketDatetimes.dtResultVoteEnd <
                          Math.floor(Date.now() / 1000)
                          ? "+ voting ended"
                          : "+ voting started"
                        : ""
                    }`}
                    <br />
                    <b>Prize Pool: </b> ${usdLiquidty} &nbsp;
                  </Typography>
                </Box>
              ) : null}
            </Box>

            {marketDetailData && marketDetailData.name ? (
              <Box mb={2}>
                <Typography
                  variant="body2"
                  sx={{
                    color: colors.text,
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  }}
                >
                  <b>Maker: </b>&nbsp;{marketDetailData.maker}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: colors.text,
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  }}
                >
                  <b>MarketHash: &nbsp;</b>
                  {marketDetailData.marketHash}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: colors.text,
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  }}
                >
                  <b> MarketNum: &nbsp;</b>
                  {marketDetailData.marketNum}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: colors.text,
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  }}
                >
                  <b> Rules: &nbsp;</b>
                  {marketDetailData.rule}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: colors.text,
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  }}
                >
                  <b>Call Deadline: &nbsp;</b>
                  {/* {marketDetailData.marketDatetimes.dtCallDeadline} */}
                  {deadlineDate} (no more bets!)
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: colors.text,
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  }}
                >
                  <b>Voting Starts: &nbsp;</b>
                  {/* {marketDetailData.marketDatetimes.dtResultVoteStart} */}
                  {votingStartDate}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: colors.text,
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  }}
                >
                  <b>Voting Ends: &nbsp;</b>
                  {/* {marketDetailData.marketDatetimes.dtResultVoteEnd} */}
                  {votingEndDate}
                </Typography>
              </Box>
            ) : null}

            <Box mb={2}>
              <Typography
                variant="caption"
                sx={{
                  color: colors.text,
                  fontSize: { xs: "0.75rem", sm: "0.875rem" }, // Smaller font size for captions
                  textAlign: { xs: "center", sm: "left" },
                }}
              >
                OUTCOME
              </Typography>
            </Box>

            {marketDetailData &&
            marketDetailData.marketResults &&
            marketDetailData.marketResults.resultLabels
              ? marketDetailData.marketResults.resultLabels.map(
                  (label, index) => (
                    <Box
                      key={index}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={2}
                      sx={{
                        flexDirection: { xs: "column", sm: "row" }, // Stack vertically on mobile
                      }}
                    >
                      <Box
                        display="flex"
                        alignItems="center"
                        sx={{ mb: { xs: 2, sm: 0 } }}
                      >
                        <Avatar
                          alt={label}
                          src={`/candidate_${index + 1}.jpg`} // Replace with actual images
                          sx={{
                            width: { xs: 30, sm: 40 },
                            height: { xs: 30, sm: 40 },
                            marginRight: 2,
                          }}
                        />
                        <Box>
                          <Typography
                            sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                          >
                            {label}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: colors.text,
                              fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            }}
                          >
                            {`${marketDetailData.marketResults.resultDescrs[index]}`}
                          </Typography>
                        </Box>
                      </Box>
                      <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        sx={{ mx: { xs: 2, sm: 1 } }}
                      >
                        <Box
                          display="flex"
                          alignItems="center"
                          sx={{ mt: { xs: 2, sm: 0 } }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              color: colors.text,
                              fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            }}
                          >
                            {`${marketDetailData.marketResults.resultOptionTokens[index]}`}
                            <br />
                            {`${nameSymbol[index]}`}
                            <br />
                            {`$${pricePercent[index]} (% to win)`}
                          </Typography>
                        </Box>
                        {/* Wrap buttons in a Box to control layout */}
                        <Box
                          display="flex"
                          flexDirection="row"
                          // flexWrap="wrap" // Allows wrapping to the next line when needed
                          ml={{ xs: 0, sm: 2 }} // Adjust margin for mobile
                          mt={{ xs: 1, sm: 0 }} // Add margin on top for mobile
                        >
                          <Button
                            className="button-green"
                            variant="contained"
                            sx={{
                              fontSize: { xs: "0.7rem", sm: "0.875rem" },
                              textTransform: "none",
                            }} // Responsive button text
                            onClick={() => {
                              if (!account) {
                                alert(
                                  "Please back to the landing page and connect wallet!"
                                );
                                return;
                              }
                              transferTicketAddr(
                                marketDetailData.marketResults
                                  .resultOptionTokens[index]
                              );
                              handleBuyTicketModalOpen();
                            }}
                          >
                            Promo Buy
                          </Button>
                          <Button
                            className="button-orange"
                            variant="contained"
                            sx={{
                              fontSize: { xs: "0.7rem", sm: "0.875rem" },
                              mt: { xs: 1, sm: 0 },
                              ml: { xs: 0, sm: 1 },
                              textTransform: "none",
                            }} // Margin adjustments for mobile
                            onClick={() => {
                              if (!account) {
                                alert(
                                  "Please back to the landing page and connect wallet!"
                                );
                                return;
                              }
                              // Open the external link in a new tab
                              window.open(
                                `https://dexscreener.com/pulsechain/${marketDetailData.marketResults.resultOptionTokens[index]}`,
                                `_blank`
                              );

                              // Set the ticket address
                              transferTicketAddr(
                                marketDetailData.marketResults
                                  .resultOptionTokens[index]
                              );
                            }}
                          >
                            View/Trade
                          </Button>
                          <Button
                            className="button-bluesky"
                            variant="contained"
                            sx={{
                              fontSize: { xs: "0.7rem", sm: "0.875rem" },
                              mt: { xs: 1, sm: 0 },
                              ml: { xs: 0, sm: 1 },
                              textTransform: "none",
                            }} // Margin adjustments for mobile
                            onClick={() => {
                              if (!account) {
                                alert(
                                  "Please back to the landing page and connect wallet!"
                                );
                                return;
                              }
                              handleExeArbPriceParityForTicket({
                                _ticket:
                                  marketDetailData.marketResults
                                    .resultOptionTokens[index],
                              });
                            }}
                          >
                            exeArb
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  )
                )
              : null}
          </Card>

          {/* Right Section */}

          <Card
            sx={{
              padding: {
                xs: "5px", // For extra small devices (mobile phones)
                sm: "10px", // For small devices (tablets)
                md: "15px", // For medium devices (desktops)
              },
              borderRadius: 2,
              boxShadow: 3,
              marginTop: {
                xs: "5px", // Margin for small screens
                sm: "15px", // Center margin for medium and larger screens
                md: "15px",
              },
              width: {
                xs: "100%", // Make the width responsive for mobile devices
                sm: "40%", // For tablets
                md: "40%", // For desktops
              },
              color: "white",
              background: ` radial-gradient(circle at 100% 100%, #1a1a1a 0, #1a1a1a 5px, transparent 5px) 0% 0%/8px 8px no-repeat,
  radial-gradient(circle at 0 100%, #1a1a1a 0, #1a1a1a 5px, transparent 5px) 100% 0%/8px 8px no-repeat,
  radial-gradient(circle at 100% 0, #0d0d0d 0, #0d0d0d 5px, transparent 5px) 0% 100%/8px 8px no-repeat,
  radial-gradient(circle at 0 0, #0d0d0d 0, #0d0d0d 5px, transparent 5px) 100% 100%/8px 8px no-repeat,
  linear-gradient(#1a1a1a, #0d0d0d) 50% 50%/calc(100% - 6px) calc(100% - 16px) no-repeat,
  linear-gradient(#1a1a1a, #0d0d0d) 50% 50%/calc(100% - 16px) calc(100% - 6px) no-repeat,
   rgb(230, 1, 1)`,
              boxShadow: `inset 0 0 15px rgba(164, 93, 187, 0.8), 
                0 0 20px 10px rgba(164, 93, 187, 0.3)`,
              transition: "border 0.2s ease-in-out",
              "&:hover": {
                border: "1px solid darkblue",
              },
            }}
          >
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              mb={2}
            >
              <Button
                variant="contained"
                // color="error"
                color={`${
                  marketDetailData &&
                  marketDetailData.marketUsdAmnts.usdAmntPrizePool == 0
                    ? "info"
                    : "error"
                }`}
                fullwidth="true"
                onClick={() =>
                  handleCloseMarketCallsModalOpen({
                    _ticket:
                      marketDetailData.marketResults.resultOptionTokens[0],
                  })
                }
                sx={{ textTransform: "none" }}
              >
                {`${
                  marketDetailData &&
                  marketDetailData.marketUsdAmnts.usdAmntPrizePool == 0
                    ? "Call Deadline Passesd? (earn $CALL)"
                    : "Calls Closed (NO MORE BETS!)"
                }`}
              </Button>
            </Box>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              mb={2}
            >
              <FormControl fullwidth="true" color="info">
                <Select
                  displayEmpty
                  inputProps={{ "aria-label": "Without label" }}
                  value={voteOption}
                  onChange={handleVoteSelect}
                  sx={{ padding: 0 }}
                >
                  <MenuItem value="">castVoteForMarketTicket</MenuItem>
                  {marketDetailData &&
                  marketDetailData.marketResults &&
                  marketDetailData.marketResults.resultLabels
                    ? marketDetailData.marketResults.resultLabels.map(
                        (label, index) => (
                          <MenuItem key={index} value={`${index}`}>
                            {label}
                          </MenuItem>
                        )
                      )
                    : null}
                </Select>
              </FormControl>
            </Box>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              mb={2}
            >
              <Button
                // className="button-close"
                variant="contained"
                color="error"
                fullWidth
                onClick={handleBuyTicketModalOpen}
                // onClick={handleCloseMarketModalOpen}
                sx={{ textTransform: "none" }}
              >
                Close This Market
              </Button>
            </Box>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              mb={2}
            >
              <Button
                // className="button-claim"
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleBuyTicketModalOpen}
                sx={{ textTransform: "none" }}
              >
                Claim Ticket Rewards
              </Button>
            </Box>
          </Card>
        </Box>
      </Container>
      <BuyCallTicketModal
        buyTicketModalOpen={buyTicketModalOpen}
        handleBuyTicketModalClose={handleBuyTicketModalClose}
        handleBuyTicketWithPromoCode={handleBuyTicketWithPromoCode}
        ticketAddr={ticketAddr}
      />
    </>
  );
};

export default MarketPage;
