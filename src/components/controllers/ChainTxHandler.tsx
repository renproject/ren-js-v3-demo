import { CheckIcon } from "@heroicons/react/solid";
import { Ethereum } from "@renproject/chains-ethereum";
import { RenVMCrossChainTxSubmitter } from "@renproject/ren//renVMTxSubmitter";
import {
    ChainTransactionStatus,
    TxSubmitter,
    TxWaiter,
    utils,
} from "@renproject/utils";
import BigNumber from "bignumber.js";
import { useCallback, useEffect, useState } from "react";

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

    const [confirmations, setConfirmations] = useState<number>();

    const wait = useCallback(async () => {
        setErrorSubmitting(undefined);
        setErrorWaiting(undefined);

        try {
            setWaiting(true);
            await tx.wait(target).on("progress", (status) => {
                setConfirmations(status.confirmations);
            });
            onDone();
        } catch (error: any) {
            console.error(error);
            setErrorWaiting(error);
        }
        setWaiting(false);
    }, [tx, onDone, target]);

    const submit = useCallback(async () => {
        setErrorSubmitting(undefined);
        setErrorWaiting(undefined);

        if (tx.submit && tx.progress.status === ChainTransactionStatus.Ready) {
            try {
                setSubmitting(true);
                await tx.submit({
                    txConfig: {
                        // gasLimit: 500000,
                    },
                });
                wait().catch(console.error);
            } catch (error: any) {
                console.error(error);
                setErrorSubmitting(error);
            }
            setSubmitting(false);
        }
    }, [tx, wait]);

    const [calledWait, setCalledWait] = useState(false);

    useEffect(() => {
        if (!calledWait) {
            setCalledWait(true);
            if (autoSubmit) {
                submit().catch(console.error);
            }
            if (tx.progress.status !== ChainTransactionStatus.Ready) {
                wait().catch(console.error);
            }
        }
    }, [
        calledWait,
        setCalledWait,
        submit,
        autoSubmit,
        wait,
        tx.progress.status,
    ]);

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
                    (chains[tx.chain].chain as Ethereum).network.config?.chainId
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
                            .config.chainId,
                    },
                ],
            });
            setSwitchedNetwork(true);
        } catch (error) {
            await injectedWeb3.request({
                method: "wallet_addEthereumChain",
                params: [(chains[tx.chain].chain as Ethereum).network.config],
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

    const gatewayTarget = utils.isDefined(target) ? target : tx.progress.target;

    switch (tx.progress.status) {
        case ChainTransactionStatus.Done:
            return (
                <p>
                    Transaction done!{" "}
                    <button className="test-indigo-600" onClick={onDone}>
                        Continue
                    </button>
                </p>
            );
        case ChainTransactionStatus.Reverted:
            return <p>Transaction reverted: {tx.progress.revertReason}</p>;
        default:
            return (
                <>
                    {errorSubmitting ? (
                        <p>
                            <span className="text-red-500 break-words">
                                Error submitting:{" "}
                                {String(errorSubmitting.message)}
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
                            <span className="text-red-500 break-words">
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
                            {utils.isDefined(gatewayTarget) &&
                            gatewayTarget === 1
                                ? "confirmation"
                                : "confirmations"}
                            ...
                            {(tx as RenVMCrossChainTxSubmitter).progress
                                .response?.txStatus ? (
                                <>
                                    {" "}
                                    (
                                    {
                                        (tx as RenVMCrossChainTxSubmitter)
                                            .progress.response?.txStatus
                                    }
                                    )
                                </>
                            ) : utils.isDefined(confirmations) &&
                              utils.isDefined(gatewayTarget) &&
                              gatewayTarget > 1 ? (
                                <>
                                    {" "}
                                    ({confirmations}/{gatewayTarget})
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
