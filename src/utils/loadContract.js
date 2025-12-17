// src/utils/loadContract.js
import Web3 from "web3";
import MedicalSupplyChain from "../../build/contracts/MedicalSupplyChain.json";

export const loadContract = async (web3) => {
  const networkId = await web3.eth.net.getId(); // Should be 1337 for Ganache
  const deployedNetwork = MedicalSupplyChain.networks[networkId];

  if (!deployedNetwork) {
    throw new Error("Contract not deployed on detected network. Check Ganache chain ID.");
  }

  return new web3.eth.Contract(MedicalSupplyChain.abi, deployedNetwork.address);
};
