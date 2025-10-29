# CipherLink

A decentralized encrypted messaging platform built on FHEVM (Fully Homomorphic Encryption Virtual Machine) technology. This innovative dApp enables users to send and receive messages with complete privacy protection, where message content remains encrypted throughout the entire blockchain transaction process.

## 🔐 Key Features

- **End-to-End Encryption**: Messages are encrypted using homomorphic encryption and remain encrypted on-chain
- **Privacy Protection**: Message content is never visible to blockchain validators or other parties
- **Web3 Integration**: Seamless wallet connection with MetaMask and other EIP-1193 compatible wallets
- **Contact Management**: Local storage-based contact system for managing encrypted communications
- **Dual Network Support**: Works on both local development (Hardhat) and Sepolia testnet
- **FHEVM Integration**: Leverages Zama's FHEVM for encrypted computations on blockchain

## 🏗️ Architecture

### Smart Contracts
- **CipherLink.sol**: Main contract handling encrypted message storage and retrieval
- **FHECounter.sol**: Reference implementation for FHEVM integration

### Frontend
- **Next.js 15**: Modern React framework with App Router
- **TypeScript**: Full type safety across the application
- **Tailwind CSS**: Utility-first CSS framework
- **Ethers.js v6**: Ethereum library for blockchain interactions

### FHEVM Integration
- **Mock Mode**: Local development with `@fhevm/mock-utils`
- **Relayer Mode**: Production deployment with `@zama-fhe/relayer-sdk`
- **Dynamic Switching**: Automatic detection based on network (localhost vs testnet)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MetaMask wallet
- Hardhat node (for local development)
- Sepolia ETH (for testnet deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd zama_msg_board_0003
   ```

2. **Install dependencies**
   ```bash
   # Install contract dependencies
   cd fhevm-hardhat-template
   npm install
   
   # Install frontend dependencies
   cd ../cipher-link-frontend
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # In fhevm-hardhat-template/
   npx hardhat vars set MNEMONIC "your mnemonic phrase"
   npx hardhat vars set INFURA_API_KEY "your infura api key"
   ```

### Local Development

1. **Start Hardhat node**
   ```bash
   cd fhevm-hardhat-template
   npx hardhat node
   ```

2. **Deploy contracts**
   ```bash
   # In another terminal
   cd fhevm-hardhat-template
   npx hardhat deploy --network localhost
   ```

3. **Start frontend (Mock mode)**
   ```bash
   cd cipher-link-frontend
   npm run dev:mock
   ```

### Testnet Deployment

1. **Deploy to Sepolia**
   ```bash
   cd fhevm-hardhat-template
   npx hardhat deploy --network sepolia
   ```

2. **Start frontend (Relayer mode)**
   ```bash
   cd cipher-link-frontend
   npm run dev
   ```

## 📱 Usage

1. **Connect Wallet**: Click "Connect Wallet" and approve MetaMask connection
2. **Add Contacts**: Navigate to Contacts page to add recipient addresses
3. **Send Messages**: Go to Send Message page, select recipient and enter message
4. **View Messages**: Check Messages page to see received and sent messages
5. **Decrypt Messages**: Click "Decrypt" to view encrypted message content

## 🔧 Technical Details

### Encryption Flow
1. User inputs plaintext message
2. Frontend encrypts message using FHEVM instance
3. Encrypted data is sent to smart contract
4. Contract stores encrypted message with metadata
5. Recipient decrypts message using their private key

### Network Configuration
- **Localhost (31337)**: Uses Mock FHEVM for development
- **Sepolia (11155111)**: Uses real Relayer SDK for production

### Contract Addresses
- **Localhost**: `0x43c9880fCbA23f4d0acd191991bA5AA03471fF44`
- **Sepolia**: `0x43c9880fCbA23f4d0acd191991bA5AA03471fF44`

## 🧪 Testing

```bash
# Run contract tests
cd fhevm-hardhat-template
npx hardhat test

# Run frontend build
cd cipher-link-frontend
npm run build
```

## 📁 Project Structure

```
zama_msg_board_0003/
├── fhevm-hardhat-template/          # Smart contracts
│   ├── contracts/                    # Solidity contracts
│   ├── deploy/                      # Deployment scripts
│   ├── test/                        # Contract tests
│   └── deployments/                 # Deployment artifacts
├── cipher-link-frontend/            # Frontend application
│   ├── app/                         # Next.js App Router
│   ├── components/                  # React components
│   ├── hooks/                       # Custom React hooks
│   ├── fhevm/                       # FHEVM integration
│   └── abi/                         # Generated contract ABIs
└── frontend/                        # Reference implementation
```

## 🔒 Security Considerations

- Private keys are never stored or transmitted
- Encryption signatures are generated locally
- Message content remains encrypted on-chain
- Access control prevents unauthorized decryption

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Zama](https://zama.ai/) for FHEVM technology
- [Hardhat](https://hardhat.org/) for development framework
- [Next.js](https://nextjs.org/) for frontend framework
- [Ethers.js](https://ethers.org/) for Ethereum interactions

## 📞 Support

For questions or support, please open an issue on GitHub or contact the development team.

---

**Note**: This is a demonstration project showcasing FHEVM capabilities. For production use, please ensure proper security audits and testing.
