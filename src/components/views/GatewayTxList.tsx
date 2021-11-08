import { GatewayTransaction } from "@renproject/ren";

import GatewayTxController from "../controllers/GatewayTxController";

export interface Props {
    transactions: GatewayTransaction[];
}

function GatewayTxList({ transactions }: Props) {
    return (
        <div className="flex flex-col">
            <h2 className="font-bold">Transactions</h2>
            <div className="mt-4">
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
