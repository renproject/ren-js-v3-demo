import { RenState } from "../../state/renState";
import GatewayTxList from "../views/GatewayTxList";

const TransactionsSection = () => {
    const { transactions, loadingLocalTxs } = RenState.useContainer();

    return (
        <GatewayTxList
            transactions={transactions}
            loadingLocalTxs={loadingLocalTxs}
        />
    );
};

export default TransactionsSection;
