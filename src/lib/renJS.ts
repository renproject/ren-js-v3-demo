import { providers } from "ethers";

import { Bitcoin } from "@renproject/chains-bitcoin";
import {
    Arbitrum,
    BinanceSmartChain,
    Ethereum,
    EthereumBaseChain,
    EthProvider,
    EvmNetworkConfig,
} from "@renproject/chains-ethereum";
import RenJS, { Gateway } from "@renproject/ren";
import { Chain, RenNetwork } from "@renproject/utils";

import { NETWORK } from "./constants";

export interface CreateGatewayParams {
    amount?: string;
    toAddress?: string;

    from?: {
        chain: string;
        asset: string;
    };

    to?: {
        chain: string;
        asset: string;
    };

    validFromOptions: Array<{
        chain: string;
        asset: string;
    }>;

    validToOptions: Array<{
        chain: string;
        asset: string;
    }>;
}

export interface ChainInstance {
    chain: Chain;
    connectionRequired?: boolean;
    accounts?: string[];
}

interface EVMConstructor<EVM> {
    configMap: {
        [network in RenNetwork]?: EvmNetworkConfig;
    };

    new (renNetwork: RenNetwork, web3Provider: EthProvider): EVM;
}

export const getEVMChain = <EVM extends EthereumBaseChain>(
    ChainClass: EVMConstructor<EVM>,
    network: RenNetwork
): ChainInstance & {
    chain: EVM;
} => {
    const config = ChainClass.configMap[network];
    if (!config) {
        throw new Error(
            `No configuration for ${ChainClass.name} on ${network}.`
        );
    }
    const rpcUrl = config.network.rpcUrls[0];

    const provider = new providers.JsonRpcProvider(rpcUrl);

    return {
        chain: new ChainClass(network, {
            provider,
        }),
        connectionRequired: true,
        accounts: [],
    };
};

export const defaultChains = (): { [chain: string]: ChainInstance } => {
    const ethereum = getEVMChain(Ethereum, NETWORK);
    const binanceSmartChain = getEVMChain(BinanceSmartChain, NETWORK);
    const arbitrum = getEVMChain(Arbitrum, NETWORK);
    const bitcoin = {
        chain: new Bitcoin(NETWORK),
    };

    return {
        [Ethereum.chain]: ethereum,
        [BinanceSmartChain.chain]: binanceSmartChain,
        [Arbitrum.chain]: arbitrum,
        [Bitcoin.chain]: bitcoin,
    };
};

export const createGateway = async (
    renJS: RenJS,
    newGatewayState: CreateGatewayParams,
    chains: { [chain: string]: ChainInstance }
): Promise<Gateway> => {
    if (!newGatewayState.from || !newGatewayState.to) {
        throw new Error(`Missing gateway field.`);
    }

    const asset = newGatewayState.from.asset;

    let from;
    switch (newGatewayState.from.chain) {
        case Ethereum.chain:
        case BinanceSmartChain.chain:
        case Arbitrum.chain:
            from = (
                chains[newGatewayState.from.chain].chain as Ethereum
            ).Account({ amount: newGatewayState.amount, convertToWei: true });
            break;
        case Bitcoin.chain:
            from = (
                chains[newGatewayState.from.chain].chain as Bitcoin
            ).GatewayAddress();
            break;
        default:
            throw new Error(`Unknown chain ${newGatewayState.from.chain}`);
    }

    let to;
    switch (newGatewayState.to.chain) {
        case Ethereum.chain:
        case BinanceSmartChain.chain:
        case Arbitrum.chain:
            to = (chains[newGatewayState.to.chain].chain as Ethereum).Account();
            break;
        case Bitcoin.chain:
            if (!newGatewayState.toAddress) {
                throw new Error(`No recipient address provided.`);
            }
            to = (chains[newGatewayState.to.chain].chain as Bitcoin).Address(
                newGatewayState.toAddress
            );
            break;
        default:
            throw new Error(`Unknown chain ${newGatewayState.to.chain}`);
    }

    return await renJS.gateway({
        asset,
        from,
        to,
    });
};
