import { useCallback, useState } from "react";

import { CheckIcon } from "@heroicons/react/solid";

import { AssetOption, CreateGatewayParams } from "../../lib/renJS";
import { Spinner } from "./Spinner";
import { TokenSelection } from "./TokenSelection";

interface Props {
    connectFrom?: () => Promise<void>;

    createGatewayParams: CreateGatewayParams;
    validFromOptions: Array<AssetOption>;

    validToOptions: Array<AssetOption>;

    updateCreateGatewayParams: (state: CreateGatewayParams) => void;
    handleCreateGateway: () => Promise<void>;
}

function CreateGateway({
    connectFrom,
    // connectTo,

    createGatewayParams,
    validFromOptions,
    validToOptions,
    updateCreateGatewayParams,
    handleCreateGateway,
}: Props) {
    const [connectingFrom, setConnectingFrom] = useState(false);
    const [connectingFromError, setConnectingFromError] = useState<Error>();
    const [creatingGateway, setCreatingGateway] = useState(false);
    const [errorCreatingGateway, setErrorCreatingGateway] = useState<
        Error | undefined
    >();
    const [connectedFrom, setConnectedFrom] = useState(false);

    const onSelectFromOption = useCallback(
        (from: { asset: string; chain: string; assetOrigin: string }) => {
            updateCreateGatewayParams({
                ...createGatewayParams,
                from,
            });
        },
        [createGatewayParams, updateCreateGatewayParams]
    );

    const onSelectToOption = useCallback(
        (to: { asset: string; chain: string; assetOrigin: string }) => {
            updateCreateGatewayParams({
                ...createGatewayParams,
                to,
            });
        },
        [createGatewayParams, updateCreateGatewayParams]
    );

    const onCancelFromOption = useCallback(() => {
        updateCreateGatewayParams({
            ...createGatewayParams,
            from: undefined,
        });
    }, [createGatewayParams, updateCreateGatewayParams]);

    const onCancelToOption = useCallback(() => {
        updateCreateGatewayParams({
            ...createGatewayParams,
            to: undefined,
        });
    }, [createGatewayParams, updateCreateGatewayParams]);

    const onConnectFrom = useCallback(async () => {
        if (!connectFrom) {
            return;
        }

        setConnectingFrom(true);
        try {
            await connectFrom();
            setConnectedFrom(true);
        } catch (error: any) {
            console.error(error);
            setConnectingFromError(error);
        }
        setConnectingFrom(false);
    }, [connectFrom]);

    const onAmountChange: React.ChangeEventHandler<HTMLInputElement> =
        useCallback(
            (e) => {
                updateCreateGatewayParams({
                    ...createGatewayParams,
                    amount: e.target.value,
                });
            },
            [updateCreateGatewayParams, createGatewayParams]
        );

    const onToAddressChange: React.ChangeEventHandler<HTMLInputElement> =
        useCallback(
            (e) => {
                updateCreateGatewayParams({
                    ...createGatewayParams,
                    toAddress: e.target.value,
                });
            },
            [updateCreateGatewayParams, createGatewayParams]
        );

    const onCreateGateway = useCallback(async () => {
        setCreatingGateway(true);
        try {
            await handleCreateGateway();
        } catch (error: any) {
            console.error(error);
            setErrorCreatingGateway(error);
        }
        setCreatingGateway(false);
    }, [handleCreateGateway]);

    return (
        <div className="flex flex-col w-full space-y-4">
            <h3 className="font-bold">Create Gateway</h3>
            <div className="flex items-center">
                <span className="mr-2">Amount:</span>
                <input
                    type="text"
                    className="p-2 mt-1 border focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    value={createGatewayParams.amount}
                    onChange={onAmountChange}
                />
                <div className="ml-2 w-5"></div>
            </div>
            <div className="flex items-center">
                <span className="mr-2">From:</span>
                <TokenSelection
                    option={createGatewayParams.from}
                    validOptions={validFromOptions}
                    onSelectOption={onSelectFromOption}
                    onCancelOption={onCancelFromOption}
                />
            </div>
            <div className="flex items-center">
                <span className="mr-2">To:</span>
                <TokenSelection
                    option={createGatewayParams.to}
                    validOptions={validToOptions}
                    onSelectOption={onSelectToOption}
                    onCancelOption={onCancelToOption}
                />
            </div>

            {createGatewayParams.to?.toAddressRequired ? (
                <div className="flex items-center">
                    <span className="mr-2">Address:</span>
                    <input
                        type="text"
                        className="p-2 mt-1 border focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        value={createGatewayParams.toAddress}
                        onChange={onToAddressChange}
                    />
                </div>
            ) : null}

            {/* {connectFrom || connectTo ? ( */}
            {connectFrom ? (
                <div className="flex flex-col">
                    {/* {connectFrom ? ( */}
                    <button
                        disabled={connectingFrom}
                        onClick={onConnectFrom}
                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {connectingFrom ? (
                            <>
                                <Spinner /> Connecting{" "}
                                {createGatewayParams.from?.chain} wallet
                            </>
                        ) : (
                            <>
                                Connect {createGatewayParams.from?.chain} wallet
                            </>
                        )}
                    </button>
                    {connectingFromError ? (
                        <p className="text-red-500">
                            {String(connectingFromError.message)}
                        </p>
                    ) : null}
                    {/* ) : null} */}

                    {/* {connectTo ? (
                        <button
                            onClick={connectTo}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            Connect {createGatewayParams.to?.chain} wallet
                        </button>
                    ) : null} */}
                </div>
            ) : (
                <div>
                    <button
                        disabled={
                            !createGatewayParams.from ||
                            !createGatewayParams.to ||
                            creatingGateway ||
                            (createGatewayParams.to?.toAddressRequired &&
                                !createGatewayParams.toAddress)
                        }
                        onClick={onCreateGateway}
                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {creatingGateway ? (
                            <>
                                <Spinner /> Creating gateway
                            </>
                        ) : (
                            <>
                                {connectedFrom ? (
                                    <>
                                        Connected
                                        <CheckIcon className="text-white h-5 w-5 inline-block ml-2" />
                                        <span className="mx-4">-</span>
                                    </>
                                ) : null}
                                Create gateway
                            </>
                        )}
                    </button>
                    {errorCreatingGateway ? (
                        <p className="text-red-500">
                            {String(errorCreatingGateway.message)}
                        </p>
                    ) : null}
                </div>
            )}
        </div>
    );
}

export default CreateGateway;
