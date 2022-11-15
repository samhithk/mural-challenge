import { SafeFactory } from "@gnosis.pm/safe-core-sdk";
import { useLiveQuery } from "dexie-react-hooks";
import Link from "next/link";
import { FC } from "react";
import { db, ISafe } from "../../lib/db";
import { ethAdapter } from "../../lib/ethAdapter";

const Part2: FC = () => {
  const safes = useLiveQuery(() => db.safes.toArray(), []);

  return (
    <div className="w-full h-full overflow-y-auto flex flex-col items-center p-6 space-y-6">
      <CreateSafe />
      <SafeList safes={safes || []} />
    </div>
  );
};

const CreateSafe: FC = () => {
  return (
    <div className="flex p-6 rounded-md shadow border border-gray-500 flex-col max-w-screen-md w-full">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const data = new FormData(e.target as any);
          const safeFactory = await SafeFactory.create({ ethAdapter });
          const owners = (data.get("owners") as string).split(",");
          const threshold = +(data.get("threshold") as string);
          const safe = await safeFactory.deploySafe({
            safeAccountConfig: { owners, threshold },
          });
          const address = safe.getAddress();
          await db.safes.add({ address }, address);
        }}
      >
        <input
          name="threshold"
          type="number"
          placeholder="Threshold"
          required
          className="focus:ring-0 focus:border-black text-xs mt-6 w-full rounded-md"
        />
        <input
          name="owners"
          type="text"
          required
          placeholder="List of approver addresses (ex 0x<address>,0x<address>,0x<address>"
          className="focus:ring-0 focus:border-black text-xs mt-2 w-full rounded-md"
        />
        <div className="flex justify-center">
          <button
            type="submit"
            className="mt-6 px-3 py-2 rounded-md text-white bg-purple-600 font-medium text-sm"
          >
            Create Multi Sig Wallet
          </button>
        </div>
      </form>
    </div>
  );
};

const SafeList: FC<{
  safes: ISafe[];
}> = ({ safes }) => {
  return (
    <>
      <h2>Avalible Safes</h2>
      <div className="max-w-screen-md w-full space-y-6">
        {safes.map((safe) => (
          <SafeCard safe={safe} key={safe.address} />
        ))}
      </div>
    </>
  );
};

const SafeCard: FC<{ safe: ISafe }> = ({ safe }) => {
  return (
    <div className="flex p-6 rounded-md shadow border border-gray-500 flex-col max-w-screen-md w-full">
      <p className="text-sm">Safe Address:</p>
      <div className="flex">
        <div className="mt-2 flex items-center space-x-2 py-1 px-2 bg-gray-200 rounded-md">
          <p className="text-xs">{safe.address}</p>
        </div>
      </div>
      <Link
        className="text-purple-600 underline text-sm mt-4"
        href={`part-2/safes/${safe.address}`}
      >
        See Details
      </Link>
    </div>
  );
};

export default Part2;
