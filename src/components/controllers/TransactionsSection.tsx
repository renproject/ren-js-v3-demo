import { RenState } from "../../state/renState";
import GatewayTxList from "../views/GatewayTxList";

const TransactionsSection = () => {
    const { transactions } = RenState.useContainer();

    return <GatewayTxList transactions={transactions} />;
};

export default TransactionsSection;
