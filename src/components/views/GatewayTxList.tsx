import { GatewayTransaction } from "@renproject/ren";

import GatewayTxController from "../controllers/GatewayTxController";
import { Spinner } from "./Spinner";

export interface Props {
    transactions: GatewayTransaction[];
    loadingLocalTxs: boolean;
}

function GatewayTxList({ transactions, loadingLocalTxs }: Props) {
    return (
        <div className="flex flex-col">
            <div className="shadow rounded-md w-full">
                <div className="px-4 py-5 bg-white space-y-6 sm:p-6 w-full h-full rounded-md">
                    <h2 className="font-bold">Transactions</h2>
                </div>
            </div>
            <div className="w-full">
                {loadingLocalTxs ? (
                    <div className="text-sm font-medium m-4">
                        <Spinner className="text-indigo-600 inline-block" />{" "}
                        Loading account transactions...
                    </div>
                ) : null}
                {transactions.length ? (
                    transactions.map((transaction) => (
                        <GatewayTxController
                            key={transaction.hash}
                            transaction={transaction}
                        />
                    ))
                ) : !loadingLocalTxs ? (
                    <p className="text-sm font-medium m-4">No transactions</p>
                ) : null}
            </div>
        </div>
    );
}

export default GatewayTxList;
