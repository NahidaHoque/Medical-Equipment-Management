const MedicalSupplyChain = artifacts.require("MedicalSupplyChain");

module.exports = function (deployer) {
  deployer.deploy(MedicalSupplyChain);
};
