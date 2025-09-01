"use client";

import { useState } from "react";
import { FiSend, FiRefreshCw, FiKey, FiMail, FiBarChart2, FiHardDrive, FiAlertCircle, FiMessageSquare } from 'react-icons/fi';

import { useFhevm } from "../fhevm/useFhevm";
import { useInMemoryStorage } from "../hooks/useInMemoryStorage";
import { useMetaMaskEthersSigner } from "../hooks/metamask/useMetaMaskEthersSigner";
import { useFHECounter } from "@/hooks/useFHECounter";
import { errorNotDeployed } from "./ErrorNotDeployed";

export const FHECounterDemo = () => {
  const [recipientAddress, setRecipientAddress] = useState("");
  const [messageText, setMessageText] = useState("");
  const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();
  const {
    provider,
    chainId,
    isConnected,
    connect,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
    initialMockChains,
  } = useMetaMaskEthersSigner();

  const {
    instance: fhevmInstance,
    status: fhevmStatus,
    error: fhevmError,
  } = useFhevm({
    provider,
    chainId,
    initialMockChains,
    enabled: true,
  });

  const fheCounter = useFHECounter({
    instance: fhevmInstance,
    fhevmDecryptionSignatureStorage,
    eip1193Provider: provider,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
  });

  const buttonClass =
    "inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-600 px-4 py-3 font-semibold text-white shadow-sm " +
    "transition-colors duration-200 hover:bg-cyan-700 active:bg-cyan-800 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus:ring-offset-gray-900 " +
    "disabled:opacity-50 disabled:pointer-events-none";

  const titleClass = "flex items-center gap-3 font-semibold text-white text-xl mb-4";
  const cardClass = "bg-gray-800/50 border border-gray-700 rounded-lg p-6 backdrop-blur-sm";

  if (!isConnected) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 text-white p-4">
        <div className="text-center">
          <h1 className="text-5xl font-bold">
            Za<span className="text-cyan-400">Mail</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-gray-400">
            An on-chain encrypted email system based on ZAMA. It enables you to enjoy both the freedom and stability of decentralization and the security and privacy of fully homomorphic encryption.
          </p>
          <div className="mt-8">
            <button
              className={buttonClass}
              onClick={connect}
            >
              <FiKey />
              <span>Connect Wallet</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (fheCounter.isDeployed === false) {
    return errorNotDeployed(chainId);
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-300 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white">
              Za<span className="text-cyan-400">Mail</span>
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              On-chain Encrypted Email System based on ZAMA.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm">User Address</p>
            <p className="font-mono text-cyan-400 text-sm truncate">{ethersSigner ? ethersSigner.address : "No signer"}</p>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Send and Decrypt */}
          <div className="lg:col-span-2 space-y-8">
            {/* Send Message Card */}
            <div className={cardClass}>
              <p className={titleClass}><FiSend className="text-cyan-400" /><span>Send Encrypted Message</span></p>
              <div className="grid grid-cols-1 gap-4">
                <input
                  type="text"
                  placeholder="0x... Recipient Address"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-cyan-500 focus:border-cyan-500"
                />
                <input
                  type="text"
                  placeholder="Message (max 8 characters)"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value.slice(0, 8))}
                  className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-cyan-500 focus:border-cyan-500"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                   <button
                    className={buttonClass}
                    disabled={!fheCounter.canSendMessage || !recipientAddress || !messageText || fheCounter.isSending}
                    onClick={() => fheCounter.sendMessage(recipientAddress, messageText)}
                  >
                    <FiSend />
                    {fheCounter.isSending
                        ? "Sending..."
                        : "Send Message"}
                  </button>
                  <button
                    className={buttonClass}
                    disabled={!fheCounter.canGetMessages || fheCounter.isRefreshing}
                    onClick={fheCounter.refreshMessages}
                  >
                    <FiRefreshCw />
                    {fheCounter.isRefreshing ? "Refreshing..." : "Refresh Messages"}
                  </button>
                </div>
              </div>
            </div>

            {/* Decrypt Messages Card */}
            <div className={cardClass}>
              <p className={titleClass}><FiMail className="text-cyan-400" /><span>Received Messages ({fheCounter.receivedMessages.length})</span></p>
              {fheCounter.receivedMessages.length > 0 ? (
                <div className="space-y-4">
                  {fheCounter.receivedMessages.map((messageId) => (
                    <div key={messageId} className="flex items-center justify-between gap-4 bg-gray-700/50 p-3 rounded-lg">
                      <span className="font-mono text-sm">Message ID: {messageId}</span>
                      {fheCounter.messageContents[messageId] ? (
                        <span className="font-mono text-green-400">
                          Decrypted: {fheCounter.messageContents[messageId].clear}
                        </span>
                      ) : (
                        <button
                          className={`${buttonClass} py-2 px-4 text-sm`}
                          disabled={!fheCounter.canDecrypt || fheCounter.isDecrypting}
                          onClick={() => fheCounter.decryptMessage(messageId)}
                        >
                          <FiKey />
                          {fheCounter.isDecrypting ? "Decrypting..." : "Decrypt"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 mt-2">No received messages to decrypt.</p>
              )}
            </div>
          </div>

          {/* Right Column: Info */}
          <div className="lg:col-span-1 space-y-8">
             {/* Message Stats Card */}
            <div className={cardClass}>
                <p className={titleClass}><FiBarChart2 className="text-cyan-400"/><span>Mailbox Stats</span></p>
                {printProperty("Sent", fheCounter.sentMessages.length)}
                {printProperty("Received", fheCounter.receivedMessages.length)}
                {printProperty("Total", fheCounter.sentMessages.length + fheCounter.receivedMessages.length)}
            </div>
            {/* Connection Details Card */}
            <div className={cardClass}>
              <p className={titleClass}><FiHardDrive className="text-cyan-400"/><span>Connection Details</span></p>
              {printProperty("Chain ID", chainId)}
              {printProperty("ZaMail Contract", fheCounter.contractAddress, true)}
              {printProperty("Contract Deployed", fheCounter.isDeployed)}
            </div>

            {/* System Status Card */}
            <div className={cardClass}>
              <p className={titleClass}><FiAlertCircle className="text-cyan-400"/><span>System Status</span></p>
              {printProperty("FHEVM Status", fhevmStatus)}
              {printProperty("FHEVM Error", fhevmError ?? "None")}
              {printProperty("Refreshing", fheCounter.isRefreshing)}
              {printProperty("Decrypting", fheCounter.isDecrypting)}
              {printProperty("Sending", fheCounter.isSending)}
            </div>
             <div className={cardClass}>
                <p className={titleClass}><FiMessageSquare className="text-cyan-400"/><span>Last Action Message</span></p>
                {printProperty("Message", fheCounter.message)}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

function printProperty(name: string, value: unknown, isAddress: boolean = false) {
  let displayValue: string;
  let valueClass = "text-cyan-400";

  if (typeof value === "boolean") {
    return printBooleanProperty(name, value);
  } else if (typeof value === "string" || typeof value === "number" || typeof value === "bigint") {
    displayValue = String(value);
    if (isAddress && typeof value === "string") {
       displayValue = `${value.substring(0, 6)}...${value.substring(value.length - 4)}`;
    }
  } else if (value === null) {
    displayValue = "null";
    valueClass = "text-gray-500";
  } else if (value === undefined) {
    displayValue = "undefined";
     valueClass = "text-gray-500";
  } else if (value instanceof Error) {
    displayValue = value.message;
    valueClass = "text-red-400";
  } else {
    displayValue = JSON.stringify(value);
  }
  return (
    <div className="flex justify-between items-center text-sm mb-1">
      <p className="text-gray-300">{name}:</p>
      <span className={`font-mono font-semibold ${valueClass}`}>{displayValue}</span>
    </div>
  );
}

function printBooleanProperty(name: string, value: boolean) {
  return (
     <div className="flex justify-between items-center text-sm mb-1">
      <p className="text-gray-300">{name}:</p>
      {value ? (
        <span className="font-mono font-semibold text-green-400">true</span>
      ) : (
        <span className="font-mono font-semibold text-red-400">false</span>
      )}
    </div>
  );
}