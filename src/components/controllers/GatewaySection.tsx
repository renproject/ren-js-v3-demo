import detectEthereumProvider from "@metamask/detect-provider";
import Chains from "@renproject/chains";
import { Gateway } from "@renproject/ren";
import { useCallback, useState } from "react";

import { NETWORK } from "../../lib/constants";
import { AssetOption, createGateway, CreateGatewayParams } from "../../lib/renJS";
import { RenState } from "../../state/renState";
import CreateGateway from "../views/CreateGateway";
import CurrentGateway from "./CurrentGateway";

const mintChains = [
    "Ethereum",
    "BinanceSmartChain",
    "Polygon",
    "Fantom",
    "Avalanche",
    "Arbitrum",
    "Catalog",
    "Moonbeam",
    "Kava",
];

const assets = Object.values(Chains)
    .filter((chain) => !!chain.assets[NETWORK as "testnet"])
    .reduce(
        (acc, chain) => [
            ...acc,
            ...Object.values(chain.assets[NETWORK as "testnet"]).map(
                (asset) => ({
                    asset,
                    lockChain: chain.chain,
                    mintChains: mintChains.filter(
                        (mintChain) => mintChain !== chain.chain
                    ),
                })
            ),
        ],
        [] as Array<{
            asset: string;
            lockChain: string;
            mintChains: string[];
        }>
    )
    .filter(
        (asset) =>
            mintChains.includes(asset.lockChain) ||
            asset.asset === "BTC" ||
            asset.asset === "BCH"
    );

const fromOptions = assets.reduce(
    (acc, asset) => [
        ...acc,
        {
            asset: asset.asset,
            chain: asset.lockChain,
            assetOrigin: asset.lockChain,
            toAddressRequired: !mintChains.includes(asset.lockChain),
        },
        ...asset.mintChains.map(
            (mintChain) => ({
                asset: asset.asset,
                chain: mintChain,
                assetOrigin: asset.lockChain,
            }),
            [] as AssetOption[]
        ),
    ],
    [] as AssetOption[]
);

const toOptions = fromOptions;

function GatewaySection() {
    const { renJS, chains, injectedWeb3, setInjectedWeb3, addTransaction } =
        RenState.useContainer();

    // Current gateway
    let [currentGateway, setCurrentGateway] = useState<Gateway | undefined>();
    const onDone = useCallback(() => {
        if (currentGateway) {
            currentGateway.eventEmitter.removeListener(
                "transaction",
                addTransaction
            );
        }
        setCurrentGateway(undefined);
    }, [addTransaction, currentGateway, setCurrentGateway]);

    // const [connecting, setConnecting] = useState<string | undefined>();

    // New gateway
    const [createGatewayParams, setCreateGatewayParams] =
        useState<CreateGatewayParams>({
            amount: "1.5",
            from: undefined,
            to: undefined,
        });
    const [validFromOptions, setValidFromOptions] = useState<AssetOption[]>([]);
    const [validToOptions, setValidToOptions] = useState<AssetOption[]>([]);

    const handleCreateGateway = useCallback(async () => {
        const gateway = await createGateway(renJS, createGatewayParams, chains);
        setCurrentGateway(gateway);
        gateway.on("transaction", addTransaction);
    }, [renJS, chains, createGatewayParams, addTransaction]);

    const connectFrom = useCallback(async () => {
        const provider: any = await detectEthereumProvider();
        if (provider) {
            await provider.enable();
            await setInjectedWeb3(provider);
        } else {
            throw new Error(`Please install MetaMask.`);
        }
    }, [setInjectedWeb3]);

    const updateCreateGatewayParams = useCallback(
        (newParams: CreateGatewayParams) => {
            setCreateGatewayParams(newParams);

            let newFromOptions = fromOptions;
            newFromOptions = newFromOptions.filter(
                (x) =>
                    x.asset === newParams.asset &&
                    (newParams.to
                        ? x.asset === newParams.to.asset &&
                          x.chain !== newParams.to.chain &&
                          (newParams.to.chain === newParams.to.assetOrigin ||
                              x.chain === newParams.to.assetOrigin)
                        : true)
            );

            let newToOptions = toOptions;
            newToOptions = newToOptions.filter(
                (x) =>
                    x.asset === newParams.asset &&
                    (newParams.from
                        ? x.asset === newParams.from.asset &&
                          x.chain !== newParams.from.chain &&
                          (newParams.from.chain ===
                              newParams.from.assetOrigin ||
                              x.chain === newParams.from.assetOrigin)
                        : true)
            );

            setValidFromOptions(newFromOptions);
            setValidToOptions(newToOptions);
        },
        []
    );

    return (
        <div>
            {/* {connecting ? <Connect chain={connecting} /> : null} */}

            {currentGateway ? (
                <CurrentGateway
                    amount={createGatewayParams.amount}
                    gateway={currentGateway}
                    onDone={onDone}
                />
            ) : (
                <CreateGateway
                    createGatewayParams={createGatewayParams}
                    assets={assets.map((asset) => asset.asset)}
                    validFromOptions={validFromOptions}
                    validToOptions={validToOptions}
                    updateCreateGatewayParams={updateCreateGatewayParams}
                    handleCreateGateway={handleCreateGateway}
                    connectFrom={
                        !injectedWeb3 && createGatewayParams.from
                            ? connectFrom
                            : undefined
                    }
                />
            )}
        </div>
    );
}

export default GatewaySection;
