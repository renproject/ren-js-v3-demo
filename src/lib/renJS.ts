import { Bitcoin, BitcoinCash } from "@renproject/chains-bitcoin";
import {
    Arbitrum,
    Avalanche,
    BinanceSmartChain,
    Ethereum,
    EthProvider,
    EVMNetworkConfig,
    Fantom,
    Polygon,
    resolveRpcEndpoints,
} from "@renproject/chains-ethereum";
import { EthereumBaseChain } from "@renproject/chains-ethereum//base";
import RenJS, { Gateway } from "@renproject/ren";
import { Chain, RenNetwork } from "@renproject/utils";
import { providers } from "ethers";

import { NETWORK } from "./constants";

export interface AssetOption {
    chain: string;
    asset: string;
    assetOrigin: string;
    toAddressRequired?: boolean;
}

export interface CreateGatewayParams {
    amount?: string;
    toAddress?: string;

    asset?: string;
    from?: AssetOption;
    to?: AssetOption;
}

export interface ChainInstance {
    chain: Chain;
    connectionRequired?: boolean;
    accounts?: string[];
}

interface EVMConstructor<EVM> {
    configMap: {
        [network in RenNetwork]?: EVMNetworkConfig;
    };

    new (config: { network: RenNetwork; provider: EthProvider }): EVM;
}

export const getEVMChain = <EVM extends EthereumBaseChain>(
    ChainClass: EVMConstructor<EVM>,
    network: RenNetwork
): ChainInstance & {
    chain: EVM;
} => {
    const networkConfig = ChainClass.configMap[network];
    if (!networkConfig) {
        throw new Error(
            `No configuration for ${ChainClass.name} on ${network}.`
        );
    }

    let rpcUrls = resolveRpcEndpoints(networkConfig.config.rpcUrls, {
        INFURA_API_KEY: process.env.REACT_APP_INFURA_KEY,
    });

    const provider = new providers.JsonRpcProvider(rpcUrls[0]);

    return {
        chain: new ChainClass({ network, provider }),
        connectionRequired: true,
        accounts: [],
    };
};

export const defaultChains = (): { [chain: string]: ChainInstance } => {
    const ethereum = getEVMChain(Ethereum, NETWORK);
    const binanceSmartChain = getEVMChain(BinanceSmartChain, NETWORK);
    const polygon = getEVMChain(Polygon, NETWORK);
    const avalanche = getEVMChain(Avalanche, NETWORK);
    const fantom = getEVMChain(Fantom, NETWORK);
    const arbitrum = getEVMChain(Arbitrum, NETWORK);
    const bitcoin = {
        chain: new Bitcoin({ network: NETWORK }),
    };
    const bitcoinCash = {
        chain: new BitcoinCash({ network: NETWORK }),
    };

    return {
        [Ethereum.chain]: ethereum,
        [BinanceSmartChain.chain]: binanceSmartChain,
        [Polygon.chain]: polygon,
        [Avalanche.chain]: avalanche,
        [Arbitrum.chain]: arbitrum,
        [Fantom.chain]: fantom,
        [Bitcoin.chain]: bitcoin,
        [BitcoinCash.chain]: bitcoinCash,
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
        case Polygon.chain:
        case Avalanche.chain:
        case Arbitrum.chain:
        case Fantom.chain:
            from = (
                chains[newGatewayState.from.chain].chain as Ethereum
            ).Account({ amount: newGatewayState.amount, convertUnit: true });
            break;
        case Bitcoin.chain:
            from = (
                chains[newGatewayState.from.chain].chain as Bitcoin
            ).GatewayAddress();
            break;
        case BitcoinCash.chain:
            from = (
                chains[newGatewayState.from.chain].chain as BitcoinCash
            ).GatewayAddress();
            break;
        default:
            throw new Error(`Unknown chain ${newGatewayState.from.chain}`);
    }

    let to;
    switch (newGatewayState.to.chain) {
        case Ethereum.chain:
        case BinanceSmartChain.chain:
        case Polygon.chain:
        case Avalanche.chain:
        case Arbitrum.chain:
        case Fantom.chain:
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
        case BitcoinCash.chain:
            if (!newGatewayState.toAddress) {
                throw new Error(`No recipient address provided.`);
            }
            to = (
                chains[newGatewayState.to.chain].chain as BitcoinCash
            ).Address(newGatewayState.toAddress);
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
