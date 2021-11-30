import { RenNetwork } from "@renproject/utils";

export const NETWORK: RenNetwork =
    (process.env.REACT_APP_NETWORK as RenNetwork) || RenNetwork.Testnet;
