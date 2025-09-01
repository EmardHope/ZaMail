export function errorNotDeployed(chainId: number | undefined) {
  const codeClass = "font-mono bg-gray-700 text-cyan-400 px-2 py-1 rounded-md";
  const highlightClass = "text-cyan-400";

  return (
    <div className="min-h-screen bg-gray-900 text-gray-300 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-gray-800/50 border border-red-500/50 rounded-lg p-8 shadow-lg backdrop-blur-sm">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-red-500">Contract Not Deployed</h1>
        </div>
        <div className="space-y-6 text-lg text-gray-400 leading-relaxed">
          <p>
            The <span className={highlightClass}>ZaMail.sol</span> contract could not be found on the current network.
            (Chain ID: <span className={codeClass}>{chainId}</span> {chainId === 11155111 ? "- Sepolia Testnet" : ""}).
          </p>
          <p>
            This could be because the contract has not been deployed to this network, or the application is missing the contract&apos;s address.
          </p>
          <div>
            <p className="mb-2 font-semibold text-gray-300">To fix this, you can:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                Ensure your MetaMask wallet is connected to the correct network where the contract is deployed (e.g., the Sepolia testnet or a local Hardhat node).
              </li>
              <li>
                If you are the developer, deploy the contract by running:
                <div className="bg-gray-900 text-white p-4 rounded-lg my-4 text-sm">
                  <code className="font-mono">
                    npx hardhat deploy --network {chainId === 11155111 ? "sepolia" : "<your_network_name>"}
                  </code>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}