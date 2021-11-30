import { NETWORK } from "../../lib/constants";
import Accounts from "./Accounts";
import GatewaySection from "./GatewaySection";
import TransactionsSection from "./TransactionsSection";

function App() {
    return (
        <div className="antialiased font-sans bg-gray-100 h-screen w-screen flex justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-screen-2xl flex flex-col w-full">
                <div className="py-4">
                    <h1 className="font-bold">RenJS v3 Demo ({NETWORK})</h1>
                </div>
                <div className="flex w-full flex-col h-full md:flex-row md:justify-center">
                    <div className="shadow rounded-md w-full md:w-2/5 ">
                        <div className="px-4 py-5 bg-white space-y-6 sm:p-6 w-full h-full rounded-md">
                            <GatewaySection />
                        </div>
                    </div>
                    <div className="w-full mt-4 md:w-3/5 md:ml-5 md:mt-0">
                        <TransactionsSection />
                    </div>
                    <Accounts />
                </div>
            </div>
        </div>
    );
}

export default App;
