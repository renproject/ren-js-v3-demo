export interface Props {
    gatewayAddress: string;
    fromAsset: string;
    fromChain: string;
    toAsset: string;
    toChain: string;
}

const ViewDepositGateway = ({
    gatewayAddress,
    fromAsset,
    fromChain,
    toAsset,
    toChain,
}: Props) => {
    const conversion = fromAsset === toAsset;

    return (
        <div>
            <div>
                {conversion ? "Move" : "Convert"} {fromAsset} from {fromChain}{" "}
                to {conversion ? <>{toAsset} on</> : null} {toChain}
                <div>
                    <p>
                        Deposit {fromAsset} to {gatewayAddress}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ViewDepositGateway;
