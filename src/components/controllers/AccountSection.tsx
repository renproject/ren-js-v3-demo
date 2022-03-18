import { useCallback } from "react";

import detectEthereumProvider from "@metamask/detect-provider";

import { RenState } from "../../state/renState";
import AccountList from "../views/AccountList";

(window as any).detectEthereumProvider = detectEthereumProvider;

const AccountSection = () => {
    const { injectedWeb3Address, setInjectedWeb3 } = RenState.useContainer();

    const connectWeb3 = useCallback(async () => {
        const provider: any = await detectEthereumProvider();
        if (provider) {
            await provider.enable();
            await setInjectedWeb3(provider);
        } else {
            throw new Error(`Please install MetaMask.`);
        }
    }, [setInjectedWeb3]);

    return (
        <AccountList
            web3Account={injectedWeb3Address}
            connectWeb3Account={connectWeb3}
        />
    );
};

export default AccountSection;
