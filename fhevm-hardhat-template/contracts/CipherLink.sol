// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint256, externalEuint256, ebool} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title CipherLink - Private messaging on blockchain using FHEVM
/// @author CipherLink Team
/// @notice A decentralized private messaging application with end-to-end encryption
contract CipherLink is SepoliaConfig {
    
    /// @notice Message structure containing encrypted content and metadata
    struct Message {
        address sender;
        address recipient;
        euint256 encryptedContent;
        uint256 timestamp;
        bool isActive;
    }
    
    /// @notice Counter for generating unique message IDs
    uint256 private _messageCounter;
    
    /// @notice Mapping from message ID to message data
    mapping(uint256 => Message) private _messages;
    
    /// @notice Mapping from user address to array of received message IDs
    mapping(address => uint256[]) private _receivedMessages;
    
    /// @notice Mapping from user address to array of sent message IDs
    mapping(address => uint256[]) private _sentMessages;
    
    /// @notice Mapping to track blocked relationships (blocker => blocked => true)
    mapping(address => mapping(address => bool)) private _blockedSenders;
    
    /// @notice Event emitted when a message is sent
    event MessageSent(
        uint256 indexed messageId,
        address indexed sender,
        address indexed recipient,
        uint256 timestamp
    );
    
    /// @notice Event emitted when a message is deleted
    event MessageDeleted(uint256 indexed messageId, address indexed user);
    
    /// @notice Event emitted when a sender is blocked
    event SenderBlocked(address indexed blocker, address indexed blocked);
    
    /// @notice Event emitted when a sender is unblocked
    event SenderUnblocked(address indexed blocker, address indexed unblocked);
    
    /// @notice Custom errors for better gas efficiency
    error MessageNotFound();
    error Unauthorized();
    error SenderIsBlocked();
    error MessageInactive();
    error EmptyMessage();
    error SelfMessage();
    
    /// @notice Constructor initializes the message counter
    constructor() {
        _messageCounter = 0;
    }
    
    /// @notice Sends an encrypted message to a recipient
    /// @param recipient The address of the message recipient
    /// @param encryptedInput The encrypted message content
    /// @param inputProof The proof for the encrypted input
    /// @return messageId The unique ID of the sent message
    function sendMessage(
        address recipient,
        externalEuint256 encryptedInput,
        bytes calldata inputProof
    ) external returns (uint256 messageId) {
        if (recipient == address(0)) revert Unauthorized();
        if (recipient == msg.sender) revert SelfMessage();
        if (_blockedSenders[recipient][msg.sender]) revert SenderIsBlocked();
        
        // Convert external encrypted input to internal encrypted type
        euint256 encryptedContent = FHE.fromExternal(encryptedInput, inputProof);
        
        // Generate unique message ID
        messageId = ++_messageCounter;
        
        // Create message
        _messages[messageId] = Message({
            sender: msg.sender,
            recipient: recipient,
            encryptedContent: encryptedContent,
            timestamp: block.timestamp,
            isActive: true
        });
        
        // Update message indices
        _sentMessages[msg.sender].push(messageId);
        _receivedMessages[recipient].push(messageId);
        
        // Set access permissions
        FHE.allowThis(encryptedContent);
        FHE.allow(encryptedContent, msg.sender);    // Sender can always decrypt
        FHE.allow(encryptedContent, recipient);     // Recipient can decrypt
        
        emit MessageSent(messageId, msg.sender, recipient, block.timestamp);
    }
    
    /// @notice Gets all message IDs received by the caller
    /// @return Array of message IDs received by the caller
    function getReceivedMessages() external view returns (uint256[] memory) {
        return _receivedMessages[msg.sender];
    }
    
    /// @notice Gets all message IDs sent by the caller
    /// @return Array of message IDs sent by the caller
    function getSentMessages() external view returns (uint256[] memory) {
        return _sentMessages[msg.sender];
    }
    
    /// @notice Gets message details by ID
    /// @param messageId The unique message ID
    /// @return message The message data
    /// @dev Only sender or recipient can access the message
    function getMessage(uint256 messageId) external view returns (Message memory message) {
        message = _messages[messageId];
        
        if (message.sender == address(0)) revert MessageNotFound();
        if (!message.isActive) revert MessageInactive();
        if (message.sender != msg.sender && message.recipient != msg.sender) {
            revert Unauthorized();
        }
    }
    
    /// @notice Gets the encrypted content of a message
    /// @param messageId The unique message ID
    /// @return encryptedContent The encrypted message content
    /// @dev Only authorized users can decrypt the content
    function getMessageContent(uint256 messageId) external view returns (euint256 encryptedContent) {
        Message memory message = _messages[messageId];
        
        if (message.sender == address(0)) revert MessageNotFound();
        if (!message.isActive) revert MessageInactive();
        if (message.sender != msg.sender && message.recipient != msg.sender) {
            revert Unauthorized();
        }
        
        // Additional check: ensure user has decryption permission
        if (!FHE.isSenderAllowed(message.encryptedContent)) revert Unauthorized();
        
        return message.encryptedContent;
    }
    
    /// @notice Deletes a message (marks as inactive)
    /// @param messageId The unique message ID to delete
    /// @dev Only sender or recipient can delete the message
    function deleteMessage(uint256 messageId) external {
        Message storage message = _messages[messageId];
        
        if (message.sender == address(0)) revert MessageNotFound();
        if (!message.isActive) revert MessageInactive();
        if (message.sender != msg.sender && message.recipient != msg.sender) {
            revert Unauthorized();
        }
        
        message.isActive = false;
        
        emit MessageDeleted(messageId, msg.sender);
    }
    
    /// @notice Blocks a sender from sending messages
    /// @param sender The address to block
    function blockSender(address sender) external {
        if (sender == address(0)) revert Unauthorized();
        if (sender == msg.sender) revert SelfMessage();
        
        _blockedSenders[msg.sender][sender] = true;
        
        emit SenderBlocked(msg.sender, sender);
    }
    
    /// @notice Unblocks a previously blocked sender
    /// @param sender The address to unblock
    function unblockSender(address sender) external {
        if (sender == address(0)) revert Unauthorized();
        
        _blockedSenders[msg.sender][sender] = false;
        
        emit SenderUnblocked(msg.sender, sender);
    }
    
    /// @notice Checks if a sender is blocked by a recipient
    /// @param sender The sender address to check
    /// @param recipient The recipient address to check
    /// @return true if sender is blocked by recipient
    function isBlocked(address sender, address recipient) external view returns (bool) {
        return _blockedSenders[recipient][sender];
    }
    
    /// @notice Gets the total number of messages sent
    /// @return The total message count
    function getTotalMessages() external view returns (uint256) {
        return _messageCounter;
    }
    
    /// @notice Gets basic message info without encrypted content
    /// @param messageId The unique message ID
    /// @return sender The sender address
    /// @return recipient The recipient address
    /// @return timestamp The message timestamp
    /// @return isActive Whether the message is active
    function getMessageInfo(uint256 messageId) external view returns (
        address sender,
        address recipient,
        uint256 timestamp,
        bool isActive
    ) {
        Message memory message = _messages[messageId];
        
        if (message.sender == address(0)) revert MessageNotFound();
        if (message.sender != msg.sender && message.recipient != msg.sender) {
            revert Unauthorized();
        }
        
        return (
            message.sender,
            message.recipient,
            message.timestamp,
            message.isActive
        );
    }
}
