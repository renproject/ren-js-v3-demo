import { useCallback, useEffect, useState } from "react";

import { CheckIcon } from "@heroicons/react/solid";
import { Gateway } from "@renproject/ren";
import { ChainTransactionStatus } from "@renproject/utils";

import GatewaySummary from "../views/GatewaySummary";
import { Spinner } from "../views/Spinner";
import ViewDepositGateway from "../views/ViewDepositGateway";
import ChainTxHandler from "./ChainTxHandler";

export interface Props {
    gateway: Gateway;
    onDone: () => void;
}

function CurrentGateway({ gateway, onDone }: Props) {
    const [done, setDone] = useState(false);
    const [approved, setApproved] = useState(false);
    const [transactionDetected, setTransactionDetected] = useState(false);

    const fromAsset = gateway.params.asset;
    const fromChain = gateway.fromChain.chain;
    const toAsset = gateway.params.asset;
    const toChain = gateway.fromChain.chain;

    const onGatewayDone = useCallback(() => {
        setDone(true);
    }, []);

    const onApprovalDone = useCallback(() => {
        setApproved(true);
    }, []);

    useEffect(() => {
        gateway.on("transaction", (tx) => {
            setTransactionDetected(true);
        });
    }, [gateway]);

    return (
        <div>
            <GatewaySummary
                fromAsset={fromAsset}
                fromChain={fromChain}
                toAsset={toAsset}
                toChain={toChain}
            />
            {done ? (
                !transactionDetected ? (
                    <div className="mt-4">
                        <p className="text-sm font-medium">
                            <Spinner className="text-indigo-600 inline-block" />{" "}
                            Loading transaction...
                        </p>
                    </div>
                ) : (
                    <div className="mt-4">
                        <p className="text-sm font-medium">
                            Submitted - view your in-progress transaction under
                            Transactions.
                        </p>
                        <button
                            className="group w-full mt-4 relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-black bg-gray-300 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 disabled:opacity-50"
                            onClick={onDone}
                        >
                            Return
                        </button>
                    </div>
                )
            ) : gateway.gatewayAddress ? (
                <>
                    <ViewDepositGateway
                        gatewayAddress={gateway.gatewayAddress}
                        fromAsset={fromAsset}
                        fromChain={fromChain}
                        toAsset={toAsset}
                        toChain={toChain}
                    />
                </>
            ) : !approved &&
              gateway.setup.approval &&
              gateway.setup.approval.status.status !==
                  ChainTransactionStatus.Done ? (
                <div className="mt-4">
                    Step 1: Approve {gateway.params.asset}
                    <ChainTxHandler
                        tx={gateway.setup.approval}
                        target={1}
                        onDone={onApprovalDone}
                    />
                </div>
            ) : gateway.in ? (
                <>
                    {gateway.setup.approval ? (
                        <div className="mt-4">
                            Step 1: Approve {gateway.params.asset}{" "}
                            <CheckIcon className="text-indigo-600 h-5 w-5 inline-block" />
                        </div>
                    ) : null}
                    <div className="mt-4">
                        {gateway.setup.approval ? "Step 2: " : ""}Submit gateway
                        <ChainTxHandler
                            tx={gateway.in}
                            onDone={onGatewayDone}
                            target={1}
                        />
                    </div>
                </>
            ) : null}
        </div>
    );
}

export default CurrentGateway;
