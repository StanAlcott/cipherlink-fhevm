import { task } from "hardhat/config";

task("unblock-sender", "Unblock a sender")
  .addParam("sender", "Sender address to unblock")
  .addParam("blocker", "Blocker address")
  .setAction(async (taskArgs, hre) => {
    try {
      const contract = await hre.ethers.getContract("CipherLink");
      console.log("Contract address:", await contract.getAddress());
      
      const sender = taskArgs.sender;
      const blocker = taskArgs.blocker;
      
      console.log("Sender:", sender);
      console.log("Blocker:", blocker);
      
      // Check if blocked
      const isBlocked = await contract.isBlocked(sender, blocker);
      console.log("Is blocked:", isBlocked);
      
      if (isBlocked) {
        // Unblock
        const tx = await contract.unblockSender(sender);
        await tx.wait();
        console.log("✅ Unblocked successfully");
      } else {
        console.log("❌ Not blocked");
      }
      
    } catch (error) {
      console.error("Error:", error.message);
    }
  });
