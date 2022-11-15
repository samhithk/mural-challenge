import Safe, {
  AddOwnerTxParams,
  RemoveOwnerTxParams,
} from "@gnosis.pm/safe-core-sdk";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import { FC, useCallback, useEffect, useState } from "react";
import { ethAdapter } from "../../../lib/ethAdapter";

const SafeDetails: FC = () => {
  const router = useRouter();
  const safeAddress = router.query["address"] as string;
  const [safe, setSafe] = useState<Safe>();
  const [balance, setBalance] = useState<string>();
  const [owners, setOwners] = useState<string[]>();
  const [threshold, setThreshold] = useState<number>();

  const reloadData = useCallback(() => {
    if (safe !== undefined) {
      safe
        .getBalance()
        .then((balance) => setBalance(ethers.utils.formatEther(balance)));
      safe.getOwners().then((owners) => setOwners(owners));
      safe.getThreshold().then((threshold) => setThreshold(threshold));
    }
  }, [safe]);

  useEffect(() => {
    async function loadSafe() {
      const safeSdk: Safe = await Safe.create({
        ethAdapter,
        safeAddress,
      });
      setSafe(safeSdk);
    }
    loadSafe();
  }, [safe, safeAddress]);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  return (
    <div className="w-full h-full overflow-y-auto flex flex-col items-center p-6 space-y-6 text-sm">
      <SafeInfo
        safeAddress={safeAddress}
        balance={balance}
        owners={owners}
        threshold={threshold}
      />
      <AddOwner safe={safe} reloadData={reloadData} />
      <RemoveOwner safe={safe} reloadData={reloadData} />
    </div>
  );
};

const AddOwner: FC<{
  safe?: Safe;
  reloadData: () => void;
}> = ({ safe, reloadData }) => {
  return (
    <div className="flex p-6 rounded-md shadow border border-gray-500 flex-col max-w-screen-md w-full">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (safe !== undefined) {
            const data = new FormData(e.target as any);
            let threshold: any = data.get("threshold") as string;
            console.log(threshold);
            if (threshold != null && threshold != "") threshold = +threshold;
            else threshold = undefined;
            console.log(threshold);
            const params: AddOwnerTxParams = {
              ownerAddress: data.get("ownerAddress") as string,
              threshold: threshold,
            };
            const safeTransaction = await safe.createAddOwnerTx(params);
            const txResponse = await safe.executeTransaction(safeTransaction);
            await txResponse.transactionResponse?.wait();

            reloadData();
          }
        }}
      >
        <input
          name="threshold"
          type="number"
          placeholder="New Threshold (Optional). If not provided, the current threshold will be increased by one."
          className="focus:ring-0 focus:border-black text-xs mt-6 w-full rounded-md"
        />
        <input
          name="ownerAddress"
          type="text"
          required
          placeholder="Owner Addresses (ex 0x<address>)"
          className="focus:ring-0 focus:border-black text-xs mt-2 w-full rounded-md"
        />
        <div className="flex justify-center">
          <button
            type="submit"
            className="mt-6 px-3 py-2 rounded-md text-white bg-purple-600 font-medium text-sm"
          >
            Add owner
          </button>
        </div>
      </form>
    </div>
  );
};

const RemoveOwner: FC<{
  safe?: Safe;
  reloadData: () => void;
}> = ({ safe, reloadData }) => {
  return (
    <div className="flex p-6 rounded-md shadow border border-gray-500 flex-col max-w-screen-md w-full">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (safe !== undefined) {
            const data = new FormData(e.target as any);
            let threshold: any = data.get("threshold") as string;
            if (threshold != null && threshold != "") threshold = +threshold;
            else threshold = undefined;
            const params: RemoveOwnerTxParams = {
              ownerAddress: data.get("ownerAddress") as string,
              threshold,
            };
            const safeTransaction = await safe.createRemoveOwnerTx(params);
            const txResponse = await safe.executeTransaction(safeTransaction);
            await txResponse.transactionResponse?.wait();
            reloadData();
          }
        }}
      >
        <input
          name="threshold"
          type="number"
          placeholder="New Threshold (Optional). If not provided, the current threshold will be decreased by one."
          className="focus:ring-0 focus:border-black text-xs mt-6 w-full rounded-md"
        />
        <input
          name="ownerAddress"
          type="text"
          required
          placeholder="Owner Addresses (ex 0x<address>)"
          className="focus:ring-0 focus:border-black text-xs mt-2 w-full rounded-md"
        />
        <div className="flex justify-center">
          <button
            type="submit"
            className="mt-6 px-3 py-2 rounded-md text-white bg-purple-600 font-medium text-sm"
          >
            Remove owner
          </button>
        </div>
      </form>
    </div>
  );
};

const SafeInfo: FC<{
  safeAddress: string;
  balance?: string;
  owners?: string[];
  threshold?: number;
}> = ({ safeAddress, balance, owners, threshold }) => {
  return (
    <div className="flex p-6 rounded-md shadow border border-gray-500 flex-col max-w-screen-md w-full">
      <p>Safe Address:</p>
      <div className="flex">
        <div className="mt-2 py-1 px-2 bg-gray-200 rounded-md">
          <p className="text-xs">{safeAddress}</p>
        </div>
      </div>
      {balance && (
        <>
          <p className="mt-4">Balance:</p>
          <p>{balance}</p>
        </>
      )}
      {owners && (
        <>
          <p className="mt-4">Owners:</p>
          <div className="flex flex-col pt-2 space-y-4">
            {owners.map((owner) => (
              <div className="flex" key={owner}>
                <p className="text-xs py-1 px-2 bg-gray-200 rounded-md">
                  {owner}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
      {threshold && (
        <>
          <p className="mt-4">Threshold:</p>
          <p>{threshold}</p>
        </>
      )}
    </div>
  );
};

export default SafeDetails;
