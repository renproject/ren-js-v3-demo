import { ethers } from "ethers";
import { List } from "immutable";
import { useCallback, useEffect, useState } from "react";
import { createContainer } from "unstated-next";

import RenJS, { GatewayTransaction } from "@renproject/ren";

import { TransactionParams } from "@renproject/ren/build/main/gatewayTransaction";
import { NETWORK } from "../lib/constants";
import { defaultChains } from "../lib/renJS";

// Source: https://usehooks.com/useLocalStorage/
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
            console.error(error);
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
            console.error(error);
        }
    };

    return [storedValue, setValue];
}

function useRenState() {
    const [renJS] = useState<RenJS>(() => new RenJS(NETWORK));
    const [chains, setChains] = useState(() => defaultChains());
    const [localTxs, setLocalTxs] = useLocalStorage<{
        [web3Address: string]: {
            [key: string]: {
                params: TransactionParams;
                done: boolean;
                timestamp: number;
            };
        };
    }>(`ren-js-demo-v3:${NETWORK}:txs`, {});
    const [localTxsLoaded, setLocalTxsLoaded] = useState(false);
    const [loadingLocalTxs, setLoadingLocalTxs] = useState(false);

    const [transactions, setTransactions] = useState<GatewayTransaction[]>([]);

    // TODO: make chain-generic
    const [injectedWeb3, setInjectedWeb3] = useState<any | undefined>();
    const [injectedWeb3Address, setInjectedWeb3Address] = useState<
        string | undefined
    >();

    const addTransaction = useCallback(
        (tx: GatewayTransaction) => {
            setTransactions((txs) => [tx, ...txs]);
            if (injectedWeb3Address) {
                setLocalTxs((txs) => ({
                    ...txs,
                    [injectedWeb3Address.toLowerCase()]: {
                        ...txs[injectedWeb3Address.toLowerCase()],
                        [tx.hash]: {
                            params: tx.params,
                            done: false,
                            timestamp:
                                (
                                    (txs[injectedWeb3Address.toLowerCase()] ||
                                        {})[tx.hash] || {}
                                ).timestamp || Date.now(),
                        },
                    },
                }));
            }
        },
        [setLocalTxs, injectedWeb3Address]
    );

    const transactionDoneCallback = useCallback(
        (tx: GatewayTransaction) => {
            if (injectedWeb3Address) {
                setLocalTxs((txs) => ({
                    ...txs,
                    [injectedWeb3Address.toLowerCase()]: {
                        ...txs[injectedWeb3Address.toLowerCase()],
                        [tx.hash]: {
                            ...(txs[injectedWeb3Address.toLowerCase()] || {})[
                                tx.hash
                            ],
                            done: true,
                        },
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
                        let toLoad = localTxs[address.toLowerCase()];
                        if (toLoad && Object.values(toLoad).length > 0) {
                            setLoadingLocalTxs(true);
                            Promise.allSettled(
                                List(
                                    Object.values(
                                        localTxs[address.toLowerCase()] || {}
                                    )
                                )
                                    .sortBy((tx) => tx.timestamp || 0)
                                    .map(async (tx) => {
                                        if (!tx.done) {
                                            return await renJS.gatewayTransaction(
                                                tx.params || tx
                                            );
                                        }
                                    })
                                    .toArray()
                            )
                                .then((results) => {
                                    results.forEach((result) => {
                                        if (
                                            result &&
                                            result.status === "fulfilled"
                                        ) {
                                            const value = result.value;
                                            if (value) {
                                                setTransactions((txs) => [
                                                    value,
                                                    ...txs,
                                                ]);
                                            }
                                        }
                                    });
                                })
                                .finally(() => {
                                    setLoadingLocalTxs(false);
                                });
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
        injectedWeb3Address,
        setInjectedWeb3: setInjectedWeb3AndConnect,
        transactions,
        addTransaction,
        loadingLocalTxs,
        transactionDoneCallback,
    };
}

export const RenState = createContainer(useRenState);
