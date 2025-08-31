"use client";

import { useState } from "react";

import { useFhevm } from "../fhevm/useFhevm";
import { useInMemoryStorage } from "../hooks/useInMemoryStorage";
import { useMetaMaskEthersSigner } from "../hooks/metamask/useMetaMaskEthersSigner";
import { useFHECounter } from "@/hooks/useFHECounter";
import { errorNotDeployed } from "./ErrorNotDeployed";

/*
 * Main FHEMessageBoard React component
 *  - "Send Message" button: allows you to send encrypted messages to other addresses.
 *  - "Decrypt Messages" button: allows you to decrypt received messages.
 *  - "Refresh" button: allows you to refresh the message lists.
 */
export const FHECounterDemo = () => {
  const [recipientAddress, setRecipientAddress] = useState("");
  const [messageText, setMessageText] = useState("");
  const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();
  const {
    provider,
    chainId,
    accounts,
    isConnected,
    connect,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
    initialMockChains,
  } = useMetaMaskEthersSigner();

  //////////////////////////////////////////////////////////////////////////////
  // FHEVM instance
  //////////////////////////////////////////////////////////////////////////////

  const {
    instance: fhevmInstance,
    status: fhevmStatus,
    error: fhevmError,
  } = useFhevm({
    provider,
    chainId,
    initialMockChains,
    enabled: true, // use enabled to dynamically create the instance on-demand
  });

  //////////////////////////////////////////////////////////////////////////////
  // useFHECounter is a custom hook containing all the FHEMessageBoard logic, including
  // - calling the FHEMessageBoard contract
  // - encrypting FHE inputs for messages
  // - decrypting FHE message handles
  //////////////////////////////////////////////////////////////////////////////

  const fheCounter = useFHECounter({
    instance: fhevmInstance,
    fhevmDecryptionSignatureStorage, // is global, could be invoked directly in useFHECounter hook
    eip1193Provider: provider,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
  });

  //////////////////////////////////////////////////////////////////////////////
  // UI Stuff:
  // --------
  // A basic page containing
  // - A bunch of debug values allowing you to better visualize the React state
  // - 1x "Decrypt" button (to decrypt the latest FHECounter count handle)
  // - 1x "Increment" button (to increment the FHECounter)
  // - 1x "Decrement" button (to decrement the FHECounter)
  //////////////////////////////////////////////////////////////////////////////

  const buttonClass =
    "inline-flex items-center justify-center rounded-xl bg-black px-4 py-4 font-semibold text-white shadow-sm " +
    "transition-colors duration-200 hover:bg-blue-700 active:bg-blue-800 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 " +
    "disabled:opacity-50 disabled:pointer-events-none";

  const titleClass = "font-semibold text-black text-lg mt-4";

  if (!isConnected) {
    return (
      <div className="mx-auto">
        <button
          className={buttonClass}
          disabled={isConnected}
          onClick={connect}
        >
          <span className="text-4xl p-6">Connect to MetaMask</span>
        </button>
      </div>
    );
  }

  if (fheCounter.isDeployed === false) {
    return errorNotDeployed(chainId);
  }

  return (
    <div className="grid w-full gap-4">
      <div className="col-span-full mx-20 bg-black text-white">
        <p className="font-semibold  text-3xl m-5">
          ZaMail
        </p>
      </div>
      <div className="col-span-full mx-20 mt-4 px-5 pb-4 rounded-lg bg-white border-2 border-black">
        <p className={titleClass}>Chain Infos</p>
        {printProperty("ChainId", chainId)}
        {printProperty(
          "User Address(Signer)",
          ethersSigner ? ethersSigner.address : "No signer"
        )}

        <p className={titleClass}>Contract</p>
        {printProperty("ZaMail Contract", fheCounter.contractAddress)}
        {printProperty("isDeployed", fheCounter.isDeployed)}
      </div>

      <div className="col-span-full mx-20 px-4 pb-4 rounded-lg bg-white border-2 border-black">
        <p className={titleClass}>Messages</p>
        {printProperty("Sent Messages", fheCounter.sentMessages.length)}
        {printProperty("Received Messages", fheCounter.receivedMessages.length)}
        {printProperty("Total Messages", fheCounter.sentMessages.length + fheCounter.receivedMessages.length)}
      </div>
      <div className="col-span-full mx-20 px-4 pb-4 rounded-lg bg-white border-2 border-black">
        <p className={titleClass}>Send Message</p>
        <div className="grid grid-cols-1 gap-2 mt-2">
          <input
            type="text"
            placeholder="Recipient Address"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="text"
            placeholder="Message (max 8 characters)"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value.slice(0, 8))}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 mx-20 gap-4">
        <button
          className={buttonClass}
          disabled={!fheCounter.canSendMessage || !recipientAddress || !messageText}
          onClick={() => fheCounter.sendMessage(recipientAddress, messageText)}
        >
          {fheCounter.canSendMessage && recipientAddress && messageText
            ? "Send Message"
            : fheCounter.isSending
              ? "Sending..."
              : "Enter recipient and SEND📤"}
        </button>
        <button
          className={buttonClass}
          disabled={!fheCounter.canGetMessages}
          onClick={fheCounter.refreshMessages}
        >
          {fheCounter.canGetMessages
            ? "Refresh Messages📥"
            : "FHEMessageBoard is not available"}
        </button>
      </div>
      <div className="col-span-full mx-20 px-4 pb-4 rounded-lg bg-white border-2 border-black">
        <p className={titleClass}>Decrypt Received Messages</p>
        {fheCounter.receivedMessages.length > 0 ? (
          <div className="grid grid-cols-1 gap-2 mt-2">
            {fheCounter.receivedMessages.map((messageId) => (
              <div key={messageId} className="flex items-center gap-4">
                <span className="font-mono text-sm">Message #{messageId}</span>
                {fheCounter.messageContents[messageId] ? (
                  <span className="font-mono text-green-600">
                    Decrypted: {fheCounter.messageContents[messageId].clear}
                  </span>
                ) : (
                  <button
                    className={`${buttonClass} py-2 px-4 text-sm`}
                    disabled={!fheCounter.canDecrypt || fheCounter.isDecrypting}
                    onClick={() => fheCounter.decryptMessage(messageId)}
                  >
                    {fheCounter.isDecrypting ? "Decrypting..." : "Decrypt"}
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 mt-2">No received messages to decrypt</p>
        )}
      </div>
            <div className="col-span-full mx-20">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-white border-2 border-black pb-4 px-4">
            <p className={titleClass}>FHEVM instance</p>
            {printProperty(
              "Fhevm Instance",
              fhevmInstance ? "OK" : "undefined"
            )}
            {printProperty("Fhevm Status", fhevmStatus)}
            {printProperty("Fhevm Error", fhevmError ?? "No Error")}
          </div>
          <div className="rounded-lg bg-white border-2 border-black pb-4 px-4">
            <p className={titleClass}>Status</p>
            {printProperty("isRefreshing", fheCounter.isRefreshing)}
            {printProperty("isDecrypting", fheCounter.isDecrypting)}
            {printProperty("isSending", fheCounter.isSending)}
            {printProperty("canGetMessages", fheCounter.canGetMessages)}
            {printProperty("canDecrypt", fheCounter.canDecrypt)}
            {printProperty("canSendMessage", fheCounter.canSendMessage)}
          </div>
        </div>
      </div>
      <div className="col-span-full mx-20 p-4 rounded-lg bg-white border-2 border-black">
        {printProperty("Message", fheCounter.message)}
      </div>
    </div>
  );
};

function printProperty(name: string, value: unknown) {
  let displayValue: string;

  if (typeof value === "boolean") {
    return printBooleanProperty(name, value);
  } else if (typeof value === "string" || typeof value === "number") {
    displayValue = String(value);
  } else if (typeof value === "bigint") {
    displayValue = String(value);
  } else if (value === null) {
    displayValue = "null";
  } else if (value === undefined) {
    displayValue = "undefined";
  } else if (value instanceof Error) {
    displayValue = value.message;
  } else {
    displayValue = JSON.stringify(value);
  }
  return (
    <p className="text-black">
      {name}:{" "}
      <span className="font-mono font-semibold text-black">{displayValue}</span>
    </p>
  );
}

function printBooleanProperty(name: string, value: boolean) {
  if (value) {
    return (
      <p className="text-black">
        {name}:{" "}
        <span className="font-mono font-semibold text-green-500">true</span>
      </p>
    );
  }

  return (
    <p className="text-black">
      {name}:{" "}
      <span className="font-mono font-semibold text-red-500">false</span>
    </p>
  );
}
