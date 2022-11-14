import { FC, useEffect, useRef, useState } from "react";
import MetaMaskOnboarding from "@metamask/onboarding";
import { ethers } from "ethers";
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";

dayjs.extend(relativeTime);

declare global {
  interface Window {
    ethereum: any;
  }
}

const ONBOARD_TEXT = "Click here to install MetaMask!";
const CONNECT_TEXT = "Connect Wallet";
const CONNECTED_TEXT = "Connected";

async function getBalance(address: string) {
  return (await window.ethereum.request({
    method: "eth_getBalance",
    params: [address, "latest"],
  })) as number;
}

async function getTxHistory(address: string) {
  const provider = new ethers.providers.EtherscanProvider(
    "goerli",
    process.env.EITHER_SCAN_API_KEY
  );
  return await provider.getHistory(address);
}

const Home: FC = () => {
  const [accounts, setAccounts] = useState<string[]>([]);
  const [txs, setTxs] = useState<ethers.providers.TransactionResponse[]>();

  useEffect(() => {
    if (accounts.length > 0)
      getTxHistory(accounts[0]).then((history) => setTxs(history));
  }, [accounts]);

  return (
    <main className="h-screen w-screen overflow-y-auto flex flex-col items-center p-6 font-mono space-y-6">
      <OnboardingButton accounts={accounts} setAccounts={setAccounts} />
      {accounts.length > 0 && <WalletCard address={accounts[0]} />}
      {txs && <TxList txs={txs} />}
    </main>
  );
};

const TxList: FC<{ txs: ethers.providers.TransactionResponse[] }> = ({
  txs,
}) => {
  return (
    <>
      <h2>History</h2>
      <div className="max-w-screen-md w-full space-y-6">
        {txs.map((tx) => {
          return (
            <div
              key={tx.blockHash}
              className="text-sm border border-gray-500 rounded-md shadow w-full p-6 "
            >
              <p>blockHash: {tx.hash}</p>
              <p>from: {tx.from}</p>
              <p>to: {tx.to}</p>
              <p>amount: {ethers.utils.formatEther(tx.value)}</p>
              {tx.timestamp && (
                <p>
                  timestamp:
                  {` ${tx.timestamp} (${dayjs.unix(tx.timestamp).fromNow()})`}
                </p>
              )}
              <a
                href={`https://goerli.etherscan.io/tx/${tx.hash}`}
                target="_blank"
                rel="noreferrer"
                className="text-purple-600 underline"
              >
                View on Either Scan
              </a>
            </div>
          );
        })}
      </div>
    </>
  );
};

const WalletCard: FC<{
  address: string;
}> = ({ address }) => {
  const [balance, setBalance] = useState<string>();

  return (
    <div className="flex p-6 rounded-md shadow border border-gray-500 flex-col max-w-screen-md w-full">
      <p className="text-sm">Address:</p>
      <div className="flex">
        <div className="mt-2 flex items-center space-x-2 py-1 px-2 bg-gray-200 rounded-md">
          <div className="p-1 rounded-full bg-green-600"></div>
          <p className="text-xs">{address}</p>
          <p></p>
        </div>
      </div>
      <WalletBalance
        address={address}
        balance={balance}
        setBalance={setBalance}
      />
      <SendMoney address={address} balance={balance} setBalance={setBalance} />
    </div>
  );
};

async function makePayment(address: string, amount: string) {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const tx = await signer.sendTransaction({
    to: ethers.utils.getAddress(address),
    value: ethers.utils.parseEther(amount),
  });
}

const SendMoney: FC<{
  address: string;
  balance?: string;
  setBalance: (balance: string) => void;
}> = () => {
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const data = new FormData(e.target as any);
        console.log(data.get("addr"));
        console.log(data.get("amount"));
        makePayment(data.get("addr") as string, data.get("amount") as string);
      }}
    >
      <input
        name="addr"
        type="text"
        placeholder="To Address"
        required
        className="focus:ring-0 focus:border-black text-xs mt-6 w-full rounded-md"
      />
      <input
        name="amount"
        type="number"
        step="0.01"
        required
        placeholder="Amount"
        className="focus:ring-0 focus:border-black text-xs mt-2 w-full rounded-md"
      />
      <div className="flex justify-center">
        <button
          type="submit"
          className="mt-6 px-3 py-2 rounded-md text-white bg-purple-600 font-medium text-sm"
        >
          Send ETH
        </button>
      </div>
    </form>
  );
};

const WalletBalance: FC<{
  address: string;
  balance?: string;
  setBalance: (balance: string) => void;
}> = ({ address, balance, setBalance }) => {
  useEffect(() => {
    function handleBalance(balance: number) {
      setBalance(ethers.utils.formatEther(balance));
    }
    getBalance(address).then((balance: number) => {
      handleBalance(balance);
    });
  }, [address, setBalance]);

  if (!balance) return null;

  return (
    <>
      <p className="text-sm mt-4">Balance:</p>
      <p className="mt-2 text-sm">{balance} ETH</p>
    </>
  );
};

const OnboardingButton: FC<{
  accounts: string[];
  setAccounts: (accounts: string[]) => void;
}> = ({ accounts, setAccounts }) => {
  const [buttonText, setButtonText] = useState(ONBOARD_TEXT);
  const [isDisabled, setDisabled] = useState(false);
  const onboarding = useRef<MetaMaskOnboarding>();

  useEffect(() => {
    if (!onboarding.current) {
      onboarding.current = new MetaMaskOnboarding();
    }
  }, []);

  useEffect(() => {
    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      if (accounts.length > 0) {
        setButtonText(CONNECTED_TEXT);
        setDisabled(true);
        onboarding.current?.stopOnboarding();
      } else {
        setButtonText(CONNECT_TEXT);
        setDisabled(false);
      }
    }
  }, [accounts]);

  useEffect(() => {
    function handleNewAccounts(newAccounts: string[]) {
      setAccounts(newAccounts);
    }
    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then(handleNewAccounts);
      window.ethereum.on("accountsChanged", handleNewAccounts);
      return () => {
        window.ethereum.removeListener("accountsChanged", handleNewAccounts);
      };
    }
  }, [setAccounts]);

  const onClick = () => {
    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then((newAccounts: string[]) => setAccounts(newAccounts));
    } else {
      onboarding.current?.startOnboarding();
    }
  };
  return (
    <button
      className="flex px-3 py-2 rounded-md text-white bg-purple-600 font-medium disabled:bg-gray-400 hover:cursor-not-allowed"
      disabled={isDisabled}
      onClick={onClick}
    >
      {buttonText}
    </button>
  );
};

export default Home;
