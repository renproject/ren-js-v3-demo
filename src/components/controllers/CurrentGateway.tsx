import { BigNumber } from "bignumber.js";
import { useCallback, useEffect, useState } from "react";

import { CheckIcon, XIcon } from "@heroicons/react/solid";
import { Gateway } from "@renproject/ren";
import { ChainTransactionStatus } from "@renproject/utils";

import GatewaySummary from "../views/GatewaySummary";
import { Spinner } from "../views/Spinner";
import ViewDepositGateway from "../views/ViewDepositGateway";
import ChainTxHandler from "./ChainTxHandler";
import { Ethereum } from "@renproject/chains-ethereum";

export interface Props {
    gateway: Gateway;
    amount: string | undefined;
    onDone: () => void;
}

function CurrentGateway({ gateway, amount, onDone }: Props) {
    const [done, setDone] = useState(false);
    const [approved, setApproved] = useState(false);
    const [transactionDetected, setTransactionDetected] = useState(false);
    const [balance, setBalance] = useState<string>();
    const [outputAmount, setOutputAmount] = useState<BigNumber>();
    const [minimumAmount, setMinimumAmount] = useState<string>();

    useEffect(() => {
        (async () => {
            try {
                const decimals = await (
                    gateway.fromChain as Ethereum
                ).assetDecimals(gateway.params.asset);
                const balance = await (
                    gateway.fromChain as Ethereum
                ).getBalance(gateway.params.asset);
                setBalance(balance.shiftedBy(-decimals).toFixed());
                if (amount) {
                    setOutputAmount(
                        gateway.fees
                            .estimateOutput(
                                new BigNumber(amount).shiftedBy(decimals)
                            )
                            .shiftedBy(-decimals)
                    );
                }
                setMinimumAmount(
                    gateway.fees.minimumAmount.shiftedBy(-decimals).toFixed()
                );
            } catch (error) {
                console.error(error);
            }
        })().catch(console.error);
    }, [gateway.params.asset, gateway.fromChain, amount, gateway.fees]);

    const fromAsset = gateway.params.asset;
    const fromChain = gateway.fromChain.chain;
    const toAsset = gateway.params.asset;
    const toChain = gateway.toChain.chain;

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
            <div className="flex justify-between">
                <GatewaySummary
                    fromAsset={fromAsset}
                    fromChain={fromChain}
                    toAsset={toAsset}
                    toChain={toChain}
                />
                <button className="h-5 w-5 -mt-4 -mr-4" onClick={onDone}>
                    <XIcon className="text-black h-5 w-5" aria-hidden="true" />
                </button>
            </div>
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
            ) : !approved &&
              gateway.inSetup.approval &&
              gateway.inSetup.approval.progress.status !==
                  ChainTransactionStatus.Done ? (
                <div className="mt-4">
                    Step 1: Approve {gateway.params.asset}
                    <ChainTxHandler
                        tx={gateway.inSetup.approval}
                        target={1}
                        onDone={onApprovalDone}
                    />
                </div>
            ) : outputAmount && outputAmount.isZero() ? (
                <>
                    <p>Invalid amount - minimum amount: {minimumAmount}</p>
                </>
            ) : gateway.in ? (
                <>
                    {gateway.inSetup.approval ? (
                        <div className="mt-4">
                            Step 1: Approve {gateway.params.asset}{" "}
                            <CheckIcon className="text-indigo-600 h-5 w-5 inline-block" />
                        </div>
                    ) : null}
                    <div className="mt-4">
                        {gateway.inSetup.approval ? "Step 2: " : ""}Submit
                        gateway
                        <ChainTxHandler
                            tx={gateway.in}
                            onDone={onGatewayDone}
                            target={1}
                        />
                    </div>
                </>
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
            ) : null}
            {balance ? (
                <p className="text-sm text-gray-600 mt-4">
                    Balance: {balance} {gateway.params.asset}
                </p>
            ) : null}
            {outputAmount ? (
                <p className="text-sm text-gray-600 mt-4">
                    Receive amount: {outputAmount.toFixed()}{" "}
                    {gateway.params.asset}
                </p>
            ) : null}
        </div>
    );
}

export default CurrentGateway;
