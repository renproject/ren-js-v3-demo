import { GatewayTransaction } from "@renproject/ren";

import GatewayTxController from "../controllers/GatewayTxController";

export interface Props {
    transactions: GatewayTransaction[];
}

function GatewayTxList({ transactions }: Props) {
    return (
        <div className="flex flex-col">
            <div className="shadow rounded-md w-full">
                <div className="px-4 py-5 bg-white space-y-6 sm:p-6 w-full h-full rounded-md">
                    <h2 className="font-bold">Transactions</h2>
                </div>
            </div>
            <div className="w-full">
                {transactions.length ? (
                    transactions.map((transaction) => (
                        <GatewayTxController transaction={transaction} />
                    ))
                ) : (
                    <p className="text-sm font-medium">No transactions</p>
                )}
            </div>
        </div>
    );
}

export default GatewayTxList;
