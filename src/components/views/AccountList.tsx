export interface Props {
    web3Account: string | undefined;
    connectWeb3Account: () => Promise<void>;
}

function AccountList({ web3Account, connectWeb3Account }: Props) {
    return (
        <div className="flex flex-col">
            <div className="shadow rounded-md w-full">
                <div className="px-4 py-5 bg-white space-y-6 sm:p-6 w-full h-full rounded-md">
                    <h2 className="font-bold">Accounts</h2>
                </div>
            </div>
            <div className="w-full py-6 px-4">
                <div className="flex content-center items-center">
                    <span>Web3 account:</span>
                    {web3Account ? (
                        <span className="ml-4">
                            <a
                                className="text-indigo-600"
                                target="_blank"
                                rel="noopener noreferrer"
                                href={`https://blockscan.com/address/${web3Account}`}
                            >
                                {web3Account}
                            </a>
                        </span>
                    ) : (
                        <button
                            className="group ml-4 relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-black bg-gray-300 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 disabled:opacity-50"
                            onClick={connectWeb3Account}
                        >
                            Connect
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AccountList;
