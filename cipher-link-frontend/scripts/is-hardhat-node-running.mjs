import { JsonRpcProvider } from "ethers";

async function checkIfHardhatNodeIsRunning() {
  const provider = new JsonRpcProvider("http://localhost:8545");

  try {
    // Check if node is reachable
    const blockNumber = await provider.getBlockNumber();
    console.log(`✅ Hardhat node is running. Current block: ${blockNumber}`);
    
    // Check if it's actually Hardhat (not just any Ethereum node)
    try {
      const version = await provider.send("web3_clientVersion", []);
      if (version && version.toLowerCase().includes("hardhat")) {
        console.log(`✅ Confirmed Hardhat node: ${version}`);
      } else {
        console.log(`⚠️  Node detected but may not be Hardhat: ${version}`);
      }
    } catch (e) {
      console.log("⚠️  Could not verify Hardhat version, but node is running");
    }
    
  } catch (error) {
    console.error("\n");
    console.error("===============================================================================");
    console.error(" 💥❌ Local Hardhat Node is NOT running!");
    console.error("");
    console.error("   To start Hardhat Node:");
    console.error("   ----------------------");
    console.error("   ✅ 1. Open a new terminal window");
    console.error("   ✅ 2. Navigate to: ../fhevm-hardhat-template");
    console.error("   ✅ 3. Run: npx hardhat node");
    console.error("");
    console.error("   The node must be running before starting dev:mock mode.");
    console.error("===============================================================================");
    console.error("");
    process.exit(1);
  } finally {
    provider.destroy();
  }
}

checkIfHardhatNodeIsRunning();
