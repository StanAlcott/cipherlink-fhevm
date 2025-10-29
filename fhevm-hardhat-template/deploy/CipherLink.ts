import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedCipherLink = await deploy("CipherLink", {
    from: deployer,
    log: true,
    waitConfirmations: 1,
  });

  console.log(`CipherLink contract deployed at: ${deployedCipherLink.address}`);
  console.log(`Deployer address: ${deployer}`);
  console.log(`Transaction hash: ${deployedCipherLink.transactionHash}`);
};

export default func;
func.id = "deploy_cipherLink";
func.tags = ["CipherLink"];
func.dependencies = []; // No dependencies on other contracts
