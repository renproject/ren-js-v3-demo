import {
    ChainTransactionStatus,
    TxSubmitter,
    TxWaiter,
} from "@renproject/utils";

import { RenState } from "../../state/renState";
import ChainTxHandler from "../controllers/ChainTxHandler";

export interface Props {
    txHash: string;

    fromAsset?: string;
    fromChain?: string;
    toChain?: string;

    inTxDone: boolean;
    inTx?: TxSubmitter | TxWaiter;

    renVMDone: boolean;
    renVM?: TxSubmitter;

    outTxDone: boolean;
    outTx?: TxSubmitter | TxWaiter;

    onInDone: () => void;
    onRenVMDone: () => void;
    onOutDone: () => void;
}

const GatewayTx = ({
    fromAsset,
    fromChain,
    toChain,
    txHash,
    inTxDone,
    inTx,
    renVMDone,
    renVM,
    outTxDone,
    outTx,
    onInDone,
    onRenVMDone,
    onOutDone,
}: Props) => {
    // TODO: refactor
    const { chains } = RenState.useContainer();

    return (
        <div className="rounded-md w-full mt-5">
            <div className="px-4 py-5 space-y-2 sm:p-6 w-full h-full bg-white rounded-md p-4 flex flex-col border border-gray-300">
                <h3 className="font-bold truncate">
                    {fromAsset} on {fromChain} to {toChain}
                </h3>
                <p className="truncate">Hash: {txHash}</p>
                {inTx && inTx.status.transaction ? (
                    <p className="truncate">
                        {inTx.chain} tx:{" "}
                        <a
                            className="text-indigo-600"
                            target="_blank"
                            rel="noopener noreferrer"
                            href={chains[
                                inTx.chain
                            ].chain.transactionExplorerLink(
                                inTx.status.transaction
                            )}
                        >
                            {inTx.status.transaction.txidFormatted}
                        </a>
                    </p>
                ) : null}
                {outTx && outTx.status.transaction ? (
                    <p className="truncate">
                        {outTx.chain} tx:{" "}
                        <a
                            className="text-indigo-600"
                            target="_blank"
                            rel="noopener noreferrer"
                            href={chains[
                                outTx.chain
                            ].chain.transactionExplorerLink(
                                outTx.status.transaction
                            )}
                        >
                            {outTx.status.transaction.txidFormatted}
                        </a>
                    </p>
                ) : null}

                {!inTxDone &&
                inTx &&
                inTx.status.status !== ChainTransactionStatus.Done ? (
                    <ChainTxHandler tx={inTx} onDone={onInDone} />
                ) : !renVMDone &&
                  renVM &&
                  renVM.status.status !== ChainTransactionStatus.Done ? (
                    <ChainTxHandler
                        tx={renVM}
                        onDone={onRenVMDone}
                        autoSubmit={true}
                    />
                ) : !outTxDone &&
                  outTx &&
                  outTx.status.status !== ChainTransactionStatus.Done ? (
                    <ChainTxHandler tx={outTx} onDone={onOutDone} />
                ) : null}
            </div>
        </div>
    );
};

export default GatewayTx;
