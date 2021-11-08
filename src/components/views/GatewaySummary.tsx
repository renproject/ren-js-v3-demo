export interface Props {
    fromAsset: string;
    fromChain: string;
    toAsset: string;
    toChain: string;
    amount?: string;
}

const GatewaySummary = ({
    amount,
    fromAsset,
    fromChain,
    toAsset,
    toChain,
}: Props) => {
    const conversion = fromAsset === toAsset;

    return (
        <div>
            <div className="font-bold">
                {conversion ? "Move" : "Convert"}
                {amount ? <> {amount}</> : <></>} {fromAsset} from {fromChain}{" "}
                to {conversion ? <>{toAsset} on</> : null} {toChain}
            </div>
        </div>
    );
};

export default GatewaySummary;
