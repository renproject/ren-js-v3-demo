import { NETWORK } from "../../lib/constants";
import Accounts from "./Accounts";
import AccountSection from "./AccountSection";
import GatewaySection from "./GatewaySection";
import TransactionsSection from "./TransactionsSection";

function App() {
    return (
        <div className="antialiased font-sans bg-gray-100 min-h-screen min-w-screen flex justify-center py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-screen-2xl flex flex-col w-full">
                <div className="pb-4 w-full flex justify-between flex-wrap">
                    <h1 className="font-bold">
                        RenJS v3 Demo ({NETWORK} -{" "}
                        <a
                            className="text-indigo-900"
                            href={
                                NETWORK === "mainnet"
                                    ? "https://renproject.github.io/ren-js-v3-demo/"
                                    : "https://renproject.github.io/ren-js-v3-demo-mainnet/"
                            }
                        >
                            switch network
                        </a>
                        ){" "}
                    </h1>
                    <span>
                        {NETWORK === "mainnet" ? (
                            <span className="text-yellow-500">
                                DEMO SOFTWARE - ONLY SEND SMALL AMOUNTS
                            </span>
                        ) : null}
                    </span>
                </div>
                <div className="flex w-full flex-col h-full md:flex-row md:justify-center">
                    <div className="shadow rounded-md w-full md:w-2/5 ">
                        <div className="px-4 py-5 bg-white space-y-6 sm:p-6 w-full h-full rounded-md">
                            <GatewaySection />
                        </div>
                    </div>
                    <div className="w-full mt-4 md:w-3/5 md:ml-5 md:mt-0">
                        <AccountSection />
                        <br />
                        <TransactionsSection />
                    </div>
                    <Accounts />
                </div>
            </div>
        </div>
    );
}

export default App;
