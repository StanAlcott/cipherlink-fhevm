import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { CipherLink, CipherLink__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
  charlie: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("CipherLink")) as CipherLink__factory;
  const cipherLinkContract = (await factory.deploy()) as CipherLink;
  const cipherLinkContractAddress = await cipherLinkContract.getAddress();

  return { cipherLinkContract, cipherLinkContractAddress };
}

describe("CipherLink", function () {
  let signers: Signers;
  let cipherLinkContract: CipherLink;
  let cipherLinkContractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { 
      deployer: ethSigners[0], 
      alice: ethSigners[1], 
      bob: ethSigners[2], 
      charlie: ethSigners[3] 
    };
  });

  beforeEach(async function () {
    // Check whether the tests are running against an FHEVM mock environment
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ cipherLinkContract, cipherLinkContractAddress } = await deployFixture());
  });

  describe("Contract Deployment", function () {
    it("should initialize with zero message counter", async function () {
      const totalMessages = await cipherLinkContract.getTotalMessages();
      expect(totalMessages).to.eq(0);
    });

    it("should have empty message arrays for new users", async function () {
      const receivedMessages = await cipherLinkContract.connect(signers.alice).getReceivedMessages();
      const sentMessages = await cipherLinkContract.connect(signers.alice).getSentMessages();
      
      expect(receivedMessages.length).to.eq(0);
      expect(sentMessages.length).to.eq(0);
    });
  });

  describe("Message Sending", function () {
    it("should send encrypted message successfully", async function () {
      const messageText = "Hello Bob! Secret msg";
      const messageBytes = ethers.toUtf8Bytes(messageText);
      // Ensure the message fits in uint256 by padding to 32 bytes max
      const paddedBytes = new Uint8Array(32);
      paddedBytes.set(messageBytes.slice(0, 32));
      const messageBigInt = BigInt(ethers.hexlify(paddedBytes));

      // Create encrypted input for the message
      const encryptedInput = await fhevm
        .createEncryptedInput(cipherLinkContractAddress, signers.alice.address)
        .add256(messageBigInt)
        .encrypt();

      const tx = await cipherLinkContract
        .connect(signers.alice)
        .sendMessage(
          signers.bob.address,
          encryptedInput.handles[0], 
          encryptedInput.inputProof
        );
      
      const receipt = await tx.wait();
      
      // Check event emission
      expect(receipt?.logs).to.have.length.greaterThan(0);
      
      // Verify total message count increased
      const totalMessages = await cipherLinkContract.getTotalMessages();
      expect(totalMessages).to.eq(1);
    });

    it("should update sender and recipient message arrays", async function () {
      const messageText = "Test message";
      const messageBytes = ethers.toUtf8Bytes(messageText);
      const paddedBytes = new Uint8Array(32);
      paddedBytes.set(messageBytes.slice(0, 32));
      const messageBigInt = BigInt(ethers.hexlify(paddedBytes));

      const encryptedInput = await fhevm
        .createEncryptedInput(cipherLinkContractAddress, signers.alice.address)
        .add256(messageBigInt)
        .encrypt();

      await cipherLinkContract
        .connect(signers.alice)
        .sendMessage(
          signers.bob.address,
          encryptedInput.handles[0], 
          encryptedInput.inputProof
        );

      // Check Alice's sent messages
      const aliceSentMessages = await cipherLinkContract.connect(signers.alice).getSentMessages();
      expect(aliceSentMessages.length).to.eq(1);
      expect(aliceSentMessages[0]).to.eq(1);

      // Check Bob's received messages
      const bobReceivedMessages = await cipherLinkContract.connect(signers.bob).getReceivedMessages();
      expect(bobReceivedMessages.length).to.eq(1);
      expect(bobReceivedMessages[0]).to.eq(1);
    });

    it("should reject self-messages", async function () {
      const messageText = "Self message";
      const messageBytes = ethers.toUtf8Bytes(messageText);
      const paddedBytes = new Uint8Array(32);
      paddedBytes.set(messageBytes.slice(0, 32));
      const messageBigInt = BigInt(ethers.hexlify(paddedBytes));

      const encryptedInput = await fhevm
        .createEncryptedInput(cipherLinkContractAddress, signers.alice.address)
        .add256(messageBigInt)
        .encrypt();

      await expect(
        cipherLinkContract
          .connect(signers.alice)
          .sendMessage(
            signers.alice.address,
            encryptedInput.handles[0], 
            encryptedInput.inputProof
          )
      ).to.be.revertedWithCustomError(cipherLinkContract, "SelfMessage");
    });

    it("should reject messages to zero address", async function () {
      const messageText = "Zero address message";
      const messageBytes = ethers.toUtf8Bytes(messageText);
      const paddedBytes = new Uint8Array(32);
      paddedBytes.set(messageBytes.slice(0, 32));
      const messageBigInt = BigInt(ethers.hexlify(paddedBytes));

      const encryptedInput = await fhevm
        .createEncryptedInput(cipherLinkContractAddress, signers.alice.address)
        .add256(messageBigInt)
        .encrypt();

      await expect(
        cipherLinkContract
          .connect(signers.alice)
          .sendMessage(
            ethers.ZeroAddress,
            encryptedInput.handles[0], 
            encryptedInput.inputProof
          )
      ).to.be.revertedWithCustomError(cipherLinkContract, "Unauthorized");
    });
  });

  describe("Message Retrieval", function () {
    beforeEach(async function () {
      // Send a test message from Alice to Bob
      const messageText = "Test message for retrieval";
      const messageBytes = ethers.toUtf8Bytes(messageText);
      const paddedBytes = new Uint8Array(32);
      paddedBytes.set(messageBytes.slice(0, 32));
      const messageBigInt = BigInt(ethers.hexlify(paddedBytes));

      const encryptedInput = await fhevm
        .createEncryptedInput(cipherLinkContractAddress, signers.alice.address)
        .add256(messageBigInt)
        .encrypt();

      await cipherLinkContract
        .connect(signers.alice)
        .sendMessage(
          signers.bob.address,
          encryptedInput.handles[0], 
          encryptedInput.inputProof
        );
    });

    it("should allow sender to retrieve message", async function () {
      const message = await cipherLinkContract.connect(signers.alice).getMessage(1);
      
      expect(message.sender).to.eq(signers.alice.address);
      expect(message.recipient).to.eq(signers.bob.address);
      expect(message.isActive).to.be.true;
      expect(message.timestamp).to.be.greaterThan(0);
    });

    it("should allow recipient to retrieve message", async function () {
      const message = await cipherLinkContract.connect(signers.bob).getMessage(1);
      
      expect(message.sender).to.eq(signers.alice.address);
      expect(message.recipient).to.eq(signers.bob.address);
      expect(message.isActive).to.be.true;
    });

    it("should reject unauthorized access", async function () {
      await expect(
        cipherLinkContract.connect(signers.charlie).getMessage(1)
      ).to.be.revertedWithCustomError(cipherLinkContract, "Unauthorized");
    });

    it("should allow sender to decrypt message content", async function () {
      const encryptedContent = await cipherLinkContract.connect(signers.alice).getMessageContent(1);
      
      // Decrypt the content
      const decryptedContent = await fhevm.userDecryptEuint(
        FhevmType.euint256,
        encryptedContent,
        cipherLinkContractAddress,
        signers.alice
      );
      
      // Convert back to string
      const contentHex = "0x" + decryptedContent.toString(16).padStart(64, '0');
      const contentBytes = ethers.getBytes(contentHex);
      // Find the null terminator to get the actual message length
      let messageLength = 0;
      for (let i = 0; i < contentBytes.length; i++) {
        if (contentBytes[i] === 0) break;
        messageLength++;
      }
      const contentString = ethers.toUtf8String(contentBytes.slice(0, messageLength));
      
      expect(contentString).to.eq("Test message for retrieval");
    });

    it("should allow recipient to decrypt message content", async function () {
      const encryptedContent = await cipherLinkContract.connect(signers.bob).getMessageContent(1);
      
      const decryptedContent = await fhevm.userDecryptEuint(
        FhevmType.euint256,
        encryptedContent,
        cipherLinkContractAddress,
        signers.bob
      );
      
      const contentHex = "0x" + decryptedContent.toString(16).padStart(64, '0');
      const contentBytes = ethers.getBytes(contentHex);
      // Find the null terminator to get the actual message length
      let messageLength = 0;
      for (let i = 0; i < contentBytes.length; i++) {
        if (contentBytes[i] === 0) break;
        messageLength++;
      }
      const contentString = ethers.toUtf8String(contentBytes.slice(0, messageLength));
      
      expect(contentString).to.eq("Test message for retrieval");
    });
  });

  describe("Message Deletion", function () {
    beforeEach(async function () {
      const messageText = "Message to be deleted";
      const messageBytes = ethers.toUtf8Bytes(messageText);
      const paddedBytes = new Uint8Array(32);
      paddedBytes.set(messageBytes.slice(0, 32));
      const messageBigInt = BigInt(ethers.hexlify(paddedBytes));

      const encryptedInput = await fhevm
        .createEncryptedInput(cipherLinkContractAddress, signers.alice.address)
        .add256(messageBigInt)
        .encrypt();

      await cipherLinkContract
        .connect(signers.alice)
        .sendMessage(
          signers.bob.address,
          encryptedInput.handles[0], 
          encryptedInput.inputProof
        );
    });

    it("should allow sender to delete message", async function () {
      await expect(
        cipherLinkContract.connect(signers.alice).deleteMessage(1)
      ).to.not.be.reverted;

      // Message should be inactive
      await expect(
        cipherLinkContract.connect(signers.alice).getMessage(1)
      ).to.be.revertedWithCustomError(cipherLinkContract, "MessageInactive");
    });

    it("should allow recipient to delete message", async function () {
      await expect(
        cipherLinkContract.connect(signers.bob).deleteMessage(1)
      ).to.not.be.reverted;

      await expect(
        cipherLinkContract.connect(signers.bob).getMessage(1)
      ).to.be.revertedWithCustomError(cipherLinkContract, "MessageInactive");
    });

    it("should reject unauthorized deletion", async function () {
      await expect(
        cipherLinkContract.connect(signers.charlie).deleteMessage(1)
      ).to.be.revertedWithCustomError(cipherLinkContract, "Unauthorized");
    });
  });

  describe("Blocking Functionality", function () {
    it("should allow blocking a sender", async function () {
      await expect(
        cipherLinkContract.connect(signers.bob).blockSender(signers.alice.address)
      ).to.not.be.reverted;

      const isBlocked = await cipherLinkContract.isBlocked(signers.alice.address, signers.bob.address);
      expect(isBlocked).to.be.true;
    });

    it("should prevent messages from blocked senders", async function () {
      // Block Alice
      await cipherLinkContract.connect(signers.bob).blockSender(signers.alice.address);

      // Try to send message from Alice to Bob
      const messageText = "Blocked message";
      const messageBytes = ethers.toUtf8Bytes(messageText);
      const paddedBytes = new Uint8Array(32);
      paddedBytes.set(messageBytes.slice(0, 32));
      const messageBigInt = BigInt(ethers.hexlify(paddedBytes));

      const encryptedInput = await fhevm
        .createEncryptedInput(cipherLinkContractAddress, signers.alice.address)
        .add256(messageBigInt)
        .encrypt();

      await expect(
        cipherLinkContract
          .connect(signers.alice)
          .sendMessage(
            signers.bob.address,
            encryptedInput.handles[0], 
            encryptedInput.inputProof
          )
      ).to.be.revertedWithCustomError(cipherLinkContract, "SenderIsBlocked");
    });

    it("should allow unblocking a sender", async function () {
      // First block
      await cipherLinkContract.connect(signers.bob).blockSender(signers.alice.address);
      
      // Then unblock
      await cipherLinkContract.connect(signers.bob).unblockSender(signers.alice.address);

      const isBlocked = await cipherLinkContract.isBlocked(signers.alice.address, signers.bob.address);
      expect(isBlocked).to.be.false;
    });

    it("should reject self-blocking", async function () {
      await expect(
        cipherLinkContract.connect(signers.alice).blockSender(signers.alice.address)
      ).to.be.revertedWithCustomError(cipherLinkContract, "SelfMessage");
    });
  });

  describe("Edge Cases", function () {
    it("should handle non-existent message ID", async function () {
      await expect(
        cipherLinkContract.connect(signers.alice).getMessage(999)
      ).to.be.revertedWithCustomError(cipherLinkContract, "MessageNotFound");
    });

    it("should handle multiple messages between same users", async function () {
      // Send multiple messages
      for (let i = 1; i <= 3; i++) {
        const messageText = `Message ${i}`;
        const messageBytes = ethers.toUtf8Bytes(messageText);
        const paddedBytes = new Uint8Array(32);
        paddedBytes.set(messageBytes.slice(0, 32));
        const messageBigInt = BigInt(ethers.hexlify(paddedBytes));

        const encryptedInput = await fhevm
          .createEncryptedInput(cipherLinkContractAddress, signers.alice.address)
          .add256(messageBigInt)
          .encrypt();

        await cipherLinkContract
          .connect(signers.alice)
          .sendMessage(
            signers.bob.address,
            encryptedInput.handles[0], 
            encryptedInput.inputProof
          );
      }

      const aliceSentMessages = await cipherLinkContract.connect(signers.alice).getSentMessages();
      const bobReceivedMessages = await cipherLinkContract.connect(signers.bob).getReceivedMessages();

      expect(aliceSentMessages.length).to.eq(3);
      expect(bobReceivedMessages.length).to.eq(3);
      expect(aliceSentMessages).to.deep.eq([1n, 2n, 3n]);
      expect(bobReceivedMessages).to.deep.eq([1n, 2n, 3n]);
    });
  });
});
