import { ethers } from "ethers";
import EthersAdapter from "@gnosis.pm/safe-ethers-lib";

const provider = new ethers.providers.Web3Provider(window.ethereum, "goerli");
const safeOwner = provider.getSigner(0);

export const ethAdapter = new EthersAdapter({
  ethers,
  signer: safeOwner,
});
