import { ethers } from "ethers";
import { useCallback, useEffect, useState } from "react";
import { createContainer } from "unstated-next";

import { Ethereum } from "@renproject/chains-ethereum";
import RenJS, { GatewayTransaction } from "@renproject/ren";

import { NETWORK } from "../lib/constants";
import { defaultChains } from "../lib/renJS";

function useRenState() {
    const [renJS] = useState<RenJS>(() => new RenJS(NETWORK));
    const [chains, setChains] = useState(() => defaultChains());

    const [transactions, setTransactions] = useState<GatewayTransaction[]>([]);

    // TODO: make chain-generic
    const [injectedWeb3, setInjectedWeb3] = useState<any | undefined>();

    useEffect(() => {
        renJS.withChains(...Object.values(chains).map((chain) => chain.chain));
    }, [renJS, chains]);

    const connect = useCallback(
        (chain: string, provider: any, address: string) => {
            const chainObject = chains[chain];
            if (chainObject.chain.withProvider) {
                chainObject.chain.withProvider(provider);
            }
            chains[chain].accounts = [...(chainObject.accounts || []), address];
            chains[chain].connectionRequired = false;
            setChains(chains);
        },
        [chains]
    );

    const setInjectedWeb3AndConnect = useCallback(
        (provider: any) => {
            try {
                setInjectedWeb3(provider);
                chains["Ethereum"].chain.withProvider!({
                    signer: new ethers.providers.Web3Provider(
                        provider,
                        "any"
                    ).getSigner(),
                });
                chains["BinanceSmartChain"].chain.withProvider!({
                    signer: new ethers.providers.Web3Provider(
                        provider,
                        "any"
                    ).getSigner(),
                });
                chains["Arbitrum"].chain.withProvider!({
                    signer: new ethers.providers.Web3Provider(
                        provider,
                        "any"
                    ).getSigner(),
                });
            } catch (error) {
                console.error(error);
                throw error;
            }
        },
        [chains]
    );

    const addTransaction = useCallback((tx: GatewayTransaction) => {
        setTransactions((txs) => [tx, ...txs]);
    }, []);

    return {
        renJS,
        chains,
        connect,
        injectedWeb3,
        setInjectedWeb3: setInjectedWeb3AndConnect,
        transactions,
        addTransaction,
    };
}

export const RenState = createContainer(useRenState);
