import { useCallback, useState } from "react";

import detectEthereumProvider from "@metamask/detect-provider";
import { Gateway } from "@renproject/ren";

import { createGateway, CreateGatewayParams } from "../../lib/renJS";
import { RenState } from "../../state/renState";
import CreateGateway from "../views/CreateGateway";
import CurrentGateway from "./CurrentGateway";

function GatewaySection() {
    const { renJS, chains, injectedWeb3, setInjectedWeb3, addTransaction } =
        RenState.useContainer();

    // Current gateway
    let [currentGateway, setCurrentGateway] = useState<Gateway | undefined>();
    const onDone = useCallback(() => {
        setCurrentGateway(undefined);
    }, [setCurrentGateway]);

    // const [connecting, setConnecting] = useState<string | undefined>();

    // New gateway
    const [createGatewayParams, setCreateGatewayParams] =
        useState<CreateGatewayParams>({
            amount: "1.5",
            from: undefined,
            to: undefined,

            validFromOptions: [
                {
                    asset: "DAI",
                    chain: "Ethereum",
                },
            ],

            validToOptions: [
                {
                    asset: "DAI",
                    chain: "BinanceSmartChain",
                },
                {
                    asset: "DAI",
                    chain: "Arbitrum",
                },
            ],
        });

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

    return (
        <div>
            {/* {connecting ? <Connect chain={connecting} /> : null} */}

            {currentGateway ? (
                <CurrentGateway gateway={currentGateway} onDone={onDone} />
            ) : (
                <CreateGateway
                    createGatewayParams={createGatewayParams}
                    updateCreateGatewayParams={setCreateGatewayParams}
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
