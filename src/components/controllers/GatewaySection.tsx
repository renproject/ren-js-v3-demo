import { useCallback, useState } from "react";

import detectEthereumProvider from "@metamask/detect-provider";
import { Gateway } from "@renproject/ren";

import { createGateway, CreateGatewayParams } from "../../lib/renJS";
import { RenState } from "../../state/renState";
import CreateGateway from "../views/CreateGateway";
import CurrentGateway from "./CurrentGateway";

const fromOptions = [
    {
        asset: "BTC",
        chain: "Bitcoin",
        assetOrigin: "Bitcoin",
        toAddressRequired: true,
    },
    {
        asset: "BTC",
        chain: "Ethereum",
        assetOrigin: "Bitcoin",
    },
    {
        asset: "DAI",
        chain: "Ethereum",
        assetOrigin: "Ethereum",
    },
    {
        asset: "DAI",
        chain: "BinanceSmartChain",
        assetOrigin: "Ethereum",
    },
    {
        asset: "DAI",
        chain: "Polygon",
        assetOrigin: "Ethereum",
    },
    {
        asset: "DAI",
        chain: "Fantom",
        assetOrigin: "Ethereum",
    },
    {
        asset: "DAI",
        chain: "Avalanche",
        assetOrigin: "Ethereum",
    },
    {
        asset: "USDC",
        chain: "Ethereum",
        assetOrigin: "Ethereum",
    },
    {
        asset: "USDC",
        chain: "BinanceSmartChain",
        assetOrigin: "Ethereum",
    },
    {
        asset: "USDC",
        chain: "Polygon",
        assetOrigin: "Ethereum",
    },
    {
        asset: "USDC",
        chain: "Fantom",
        assetOrigin: "Ethereum",
    },
    {
        asset: "USDC",
        chain: "Avalanche",
        assetOrigin: "Ethereum",
    },
    {
        asset: "ETH",
        chain: "Ethereum",
        assetOrigin: "Ethereum",
    },
    {
        asset: "ETH",
        chain: "BinanceSmartChain",
        assetOrigin: "Ethereum",
    },
    {
        asset: "ETH",
        chain: "Polygon",
        assetOrigin: "Ethereum",
    },
    {
        asset: "ETH",
        chain: "Fantom",
        assetOrigin: "Ethereum",
    },
    {
        asset: "ETH",
        chain: "Avalanche",
        assetOrigin: "Ethereum",
    },
];

const toOptions = fromOptions;

function GatewaySection() {
    const { renJS, chains, injectedWeb3, setInjectedWeb3, addTransaction } =
        RenState.useContainer();

    // Current gateway
    let [currentGateway, setCurrentGateway] = useState<Gateway | undefined>();
    const onDone = useCallback(() => {
        if (currentGateway) {
            currentGateway.removeListener("transaction", addTransaction);
        }
        setCurrentGateway(undefined);
    }, [setCurrentGateway]);

    // const [connecting, setConnecting] = useState<string | undefined>();

    // New gateway
    const [createGatewayParams, setCreateGatewayParams] =
        useState<CreateGatewayParams>({
            amount: "1.5",
            from: undefined,
            to: undefined,
        });
    const [validFromOptions, setValidFromOptions] = useState(fromOptions);
    const [validToOptions, setValidToOptions] = useState(toOptions);

    const handleCreateGateway = useCallback(async () => {
        const gateway = await createGateway(renJS, createGatewayParams, chains);
        setCurrentGateway(gateway);
        gateway.on("transaction", addTransaction);
    }, [renJS, chains, createGatewayParams, addTransaction]);

    const connectFrom = useCallback(async () => {
        const provider: any = await detectEthereumProvider();
        if (provider) {
            await provider.enable();
            setInjectedWeb3(provider);
        } else {
            throw new Error(`Please install MetaMask.`);
        }
    }, [setInjectedWeb3]);

    const updateCreateGatewayParams = useCallback(
        (newParams: CreateGatewayParams) => {
            setCreateGatewayParams(newParams);

            let newFromOptions = fromOptions;
            if (newParams.to) {
                newFromOptions = newFromOptions.filter(
                    (x) =>
                        x.asset === newParams.to!.asset &&
                        x.chain !== newParams.to!.chain &&
                        (newParams.to!.chain === newParams.to!.assetOrigin ||
                            x.chain === newParams.to!.assetOrigin)
                );
            }

            let newToOptions = toOptions;
            if (newParams.from) {
                newToOptions = newToOptions.filter(
                    (x) =>
                        x.asset === newParams.from!.asset &&
                        x.chain !== newParams.from!.chain &&
                        (newParams.from!.chain ===
                            newParams.from!.assetOrigin ||
                            x.chain === newParams.from!.assetOrigin)
                );
            }

            setValidFromOptions(newFromOptions);
            setValidToOptions(newToOptions);
        },
        []
    );

    return (
        <div>
            {/* {connecting ? <Connect chain={connecting} /> : null} */}

            {currentGateway ? (
                <CurrentGateway gateway={currentGateway} onDone={onDone} />
            ) : (
                <CreateGateway
                    createGatewayParams={createGatewayParams}
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
