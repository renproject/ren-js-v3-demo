import BigNumber from "bignumber.js";
import { useCallback, useEffect, useState } from "react";

import { CheckIcon } from "@heroicons/react/solid";
import { Ethereum } from "@renproject/chains-ethereum";
import {
    ChainTransactionStatus,
    TxSubmitter,
    TxWaiter,
} from "@renproject/utils";

import { RenVMCrossChainTxSubmitter } from "../../../../ren-js-v3/packages/ren/build/main/renVMTxSubmitter";
import { RenState } from "../../state/renState";
import { Spinner } from "../views/Spinner";

export interface Props {
    tx: TxSubmitter | TxWaiter;
    target?: number;
    autoSubmit?: boolean;
    onDone: () => void;
}

const ChainTxHandler = ({ tx, target, autoSubmit, onDone }: Props) => {
    const { injectedWeb3, chains } = RenState.useContainer();

    const [submitting, setSubmitting] = useState(autoSubmit ? true : false);
    const [waiting, setWaiting] = useState(false);

    const [errorSubmitting, setErrorSubmitting] = useState<Error | undefined>();
    const [errorWaiting, setErrorWaiting] = useState<Error | undefined>();

    const [wrongNetwork, setWrongNetwork] = useState<boolean | undefined>();
    const [switchedNetwork, setSwitchedNetwork] = useState<boolean>(false);

    const wait = useCallback(async () => {
        setErrorSubmitting(undefined);
        setErrorWaiting(undefined);

        try {
            setWaiting(true);
            await tx.wait(target);
            onDone();
        } catch (error: any) {
            setErrorWaiting(error);
        }
        setWaiting(false);
    }, [tx, onDone, target]);

    const submit = useCallback(async () => {
        setErrorSubmitting(undefined);
        setErrorWaiting(undefined);

        if (tx.submit && tx.status.status === ChainTransactionStatus.Ready) {
            try {
                setSubmitting(true);
                await tx.submit();
                // {
                //     txConfig: {
                //         gasLimit: 1000000,
                //     },
                // }
                wait().catch(console.error);
            } catch (error: any) {
                setErrorSubmitting(error);
            }
            setSubmitting(false);
        }
    }, [tx, wait]);

    useEffect(() => {
        if (autoSubmit) {
            submit().catch(console.error);
        }
        if (tx.status.status !== ChainTransactionStatus.Ready) {
            setWaiting(true);
            wait().catch(console.error);
        }
    }, [submit, autoSubmit, wait, tx.status.status]);

    useEffect(() => {
        (async () => {
            if (tx.chain === "RenVM") {
                setWrongNetwork(false);
                return;
            }

            const chainID = new BigNumber(
                await injectedWeb3.request({
                    method: "eth_chainId",
                })
            ).toNumber();
            if (
                chainID !==
                new BigNumber(
                    (
                        chains[tx.chain].chain as Ethereum
                    ).network.network?.chainId
                ).toNumber()
            ) {
                setWrongNetwork(true);
            } else {
                setWrongNetwork(false);
            }
        })().catch(console.error);
    });

    const switchNetwork = useCallback(async () => {
        if (tx.chain === "RenVM") {
            return;
        }

        try {
            await injectedWeb3.request({
                method: "wallet_switchEthereumChain",
                params: [
                    {
                        chainId: (chains[tx.chain].chain as Ethereum).network
                            .network.chainId,
                    },
                ],
            });
            setSwitchedNetwork(true);
        } catch (error) {
            await injectedWeb3.request({
                method: "wallet_addEthereumChain",
                params: [(chains[tx.chain].chain as Ethereum).network.network],
            });
        }
        setWrongNetwork(false);
    }, [injectedWeb3, chains, tx]);

    if (wrongNetwork === undefined) {
        return (
            <div>
                <Spinner /> Loading...
            </div>
        );
    }

    switch (tx.status.status) {
        case ChainTransactionStatus.Done:
            return (
                <p>
                    Transaction done! <button onClick={onDone}>Continue</button>
                </p>
            );
        case ChainTransactionStatus.Reverted:
            return <p>Transaction reverted: {tx.status.revertReason}</p>;
        default:
            return (
                <>
                    {errorSubmitting ? (
                        <p>
                            <span className="text-red-500">
                                Error submitting:{" "}
                                {String(errorSubmitting.message)}.
                            </span>{" "}
                            <button
                                onClick={submit}
                                className="group w-full mt-4 relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                Retry submitting to {tx.chain}
                            </button>
                        </p>
                    ) : errorWaiting ? (
                        <p>
                            <span className="text-red-500">
                                Error waiting for {tx.chain} transaction
                                confirmations: {String(errorWaiting.message)}.
                            </span>{" "}
                            <button
                                onClick={wait}
                                className="group w-full mt-4 relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                Retry
                            </button>
                        </p>
                    ) : submitting ? (
                        <button
                            disabled={true}
                            className="group w-full mt-4 relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            <Spinner /> Submitting to {tx.chain}
                        </button>
                    ) : waiting ? (
                        <button
                            disabled={true}
                            className="group w-full mt-4 relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            <Spinner /> Waiting for {tx.chain}{" "}
                            {tx.status.target === 1
                                ? "confirmation"
                                : "confirmations"}
                            ...
                            {(tx as RenVMCrossChainTxSubmitter).status.response
                                ?.txStatus ? (
                                <>
                                    {" "}
                                    (
                                    {
                                        (tx as RenVMCrossChainTxSubmitter)
                                            .status.response?.txStatus
                                    }
                                    )
                                </>
                            ) : null}
                        </button>
                    ) : wrongNetwork ? (
                        <button
                            onClick={switchNetwork}
                            className="group w-full mt-4 relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            Switch to {tx.chain} in MetaMask
                        </button>
                    ) : (
                        <button
                            onClick={submit}
                            className="group w-full mt-4 relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {switchedNetwork ? (
                                <>
                                    Switched
                                    <CheckIcon className="text-white h-5 w-5 inline-block ml-2" />
                                    <span className="mx-4">-</span>
                                </>
                            ) : null}
                            Submit to {tx.chain}
                        </button>
                    )}
                </>
            );
    }
};

export default ChainTxHandler;
