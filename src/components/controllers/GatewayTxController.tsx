import { useState } from "react";

import { GatewayTransaction } from "@renproject/ren";

import { RenState } from "../../state/renState";
import GatewayTx from "../views/GatewayTx";

export interface Props {
    transaction: GatewayTransaction;
}

const GatewayTxController = ({ transaction }: Props) => {
    const { transactionDoneCallback } = RenState.useContainer();

    const [inDone, setInDone] = useState(false);
    const [renVMDone, setRenVMDone] = useState(false);
    const [outDone, setOutDone] = useState(false);

    const onInDone = () => {
        setInDone(true);
    };

    const onRenVMDone = () => {
        setRenVMDone(true);
    };

    const onOutDone = () => {
        setOutDone(true);
        transactionDoneCallback(transaction);
    };

    return (
        <GatewayTx
            fromAsset={transaction.params.asset}
            fromChain={transaction.fromChain.chain}
            toChain={transaction.toChain.chain}
            inTx={transaction.in}
            renVM={transaction.renVM}
            outTx={transaction.out}
            inTxDone={inDone}
            renVMDone={renVMDone}
            outTxDone={outDone}
            txHash={transaction.hash}
            onInDone={onInDone}
            onRenVMDone={onRenVMDone}
            onOutDone={onOutDone}
        />
    );
};

export default GatewayTxController;
