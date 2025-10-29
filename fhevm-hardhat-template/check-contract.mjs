import { ethers } from "hardhat";

async function checkContractState() {
  try {
    // 获取合约实例
    const contract = await ethers.getContract("CipherLink");
    console.log("Contract address:", await contract.getAddress());
    
    // 检查发送者和接收者地址
    const sender = "0x84caCcbde1B2fa965B44B6F2F12F7402fBEEfCCC";
    const recipient = "0xb9e9a901a78f70c08dbfeac5f050dc55431c7d4e";
    
    console.log("Sender:", sender);
    console.log("Recipient:", recipient);
    
    // 检查是否被阻止
    const isBlocked = await contract.isBlocked(sender, recipient);
    console.log("Is sender blocked by recipient:", isBlocked);
    
    // 检查合约状态
    const totalMessages = await contract.getTotalMessages();
    console.log("Total messages:", totalMessages.toString());
    
    // 检查发送者的消息
    const sentMessages = await contract.getSentMessages();
    console.log("Sent messages count:", sentMessages.length);
    
    // 检查接收者的消息
    const receivedMessages = await contract.getReceivedMessages();
    console.log("Received messages count:", receivedMessages.length);
    
  } catch (error) {
    console.error("Error:", error.message);
  }
}

checkContractState();
