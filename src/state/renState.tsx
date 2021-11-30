import { ethers } from "ethers";
import { useCallback, useEffect, useState } from "react";
import { createContainer } from "unstated-next";

import RenJS, { GatewayTransaction } from "@renproject/ren";

import { TransactionParams } from "../../../ren-js-v3/packages/ren/build/main/gatewayTransaction";
import { NETWORK } from "../lib/constants";
import { defaultChains } from "../lib/renJS";

function useLocalStorage<T>(
    key: string,
    initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
    // State to store our value
    // Pass initial state function to useState so logic is only executed once
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            // Get from local storage by key
            const item = window.localStorage.getItem(key);
            // Parse stored json or if none return initialValue
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            // If error also return initialValue
            console.log(error);
            return initialValue;
        }
    });

    // Return a wrapped version of useState's setter function that ...
    // ... persists the new value to localStorage.
    const setValue = (value: T | ((value: T) => T)) => {
        try {
            // Allow value to be a function so we have same API as useState
            const valueToStore =
                value instanceof Function ? value(storedValue) : value;
            // Save state
            setStoredValue(valueToStore);
            // Save to local storage
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            // A more advanced implementation would handle the error case
            console.log(error);
        }
    };

    return [storedValue, setValue];
}

function useRenState() {
    const [renJS] = useState<RenJS>(() => new RenJS(NETWORK));
    const [chains, setChains] = useState(() => defaultChains());
    const [localTxs, setLocalTxs] = useLocalStorage<{
        [web3Address: string]: { [key: string]: TransactionParams };
    }>(`ren-js-demo-v3:${NETWORK}:txs`, {});
    const [localTxsLoaded, setLocalTxsLoaded] = useState(false);

    const [transactions, setTransactions] = useState<GatewayTransaction[]>([]);

    // TODO: make chain-generic
    const [injectedWeb3, setInjectedWeb3] = useState<any | undefined>();
    const [injectedWeb3Address, setInjectedWeb3Address] = useState<
        string | undefined
    >();

    const addTransaction = useCallback(
        (tx: GatewayTransaction) => {
            setTransactions((txs) => [tx, ...txs]);
            console.log("injectedWeb3Address", injectedWeb3Address);
            console.log("adding tx", tx.params);
            if (injectedWeb3Address) {
                setLocalTxs((txs) => ({
                    ...txs,
                    [injectedWeb3Address.toLocaleLowerCase()]: {
                        ...txs[injectedWeb3Address.toLocaleLowerCase()],
                        [tx.hash]: tx.params,
                    },
                }));
            }
        },
        [setLocalTxs, injectedWeb3Address]
    );

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
        async (provider: any) => {
            try {
                setInjectedWeb3(provider);
                const signer = new ethers.providers.Web3Provider(
                    provider,
                    "any"
                ).getSigner();
                const address = await signer.getAddress();
                setInjectedWeb3Address(address);
                chains["Ethereum"].chain.withProvider!({
                    signer,
                });
                chains["BinanceSmartChain"].chain.withProvider!({
                    signer,
                });
                chains["Polygon"].chain.withProvider!({
                    signer,
                });
                chains["Fantom"].chain.withProvider!({
                    signer,
                });
                chains["Avalanche"].chain.withProvider!({
                    signer,
                });
                chains["Arbitrum"].chain.withProvider!({
                    signer,
                });

                try {
                    if (!localTxsLoaded) {
                        setLocalTxsLoaded(true);
                        console.log(localTxs);
                        for (const tx of Object.values(
                            localTxs[address.toLowerCase()] || {}
                        )) {
                            renJS
                                .gatewayTransaction(tx)
                                .then((gatewayTx) => addTransaction(gatewayTx));
                        }
                    }
                } catch (error) {
                    console.error(error);
                }
            } catch (error) {
                console.error(error);
                throw error;
            }
        },
        [chains, addTransaction, localTxs, localTxsLoaded, renJS]
    );

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
