export const connectWallet = async (
  activate,
  injected,
  setHasMetamask,
  account
) => {
  try {
    await activate(injected);
    setHasMetamask(true);
    console.log("User's wallet address:", account);
  } catch (error) {
    console.error("Error connecting to MetaMask:", error);
  }
};
