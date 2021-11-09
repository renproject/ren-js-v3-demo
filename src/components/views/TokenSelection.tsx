import { Fragment } from "react";

import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon, XIcon } from "@heroicons/react/solid";

import { AssetOption } from "../../lib/renJS";

interface Props {
    option?: AssetOption;

    validOptions: Array<AssetOption>;

    onSelectOption: (options: AssetOption) => void;
    onCancelOption: () => void;
}

const classNames = (...classes: string[]) => {
    return classes.filter(Boolean).join(" ");
};

export const TokenSelection = ({
    option,
    validOptions,
    onSelectOption,
    onCancelOption,
}: Props) => {
    return (
        <div className="w-full flex items-center">
            <Menu as="div" className="w-full relative inline-block text-left">
                <div>
                    <Menu.Button className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500">
                        {option ? (
                            <>
                                {option.asset} on {option.chain}
                            </>
                        ) : (
                            <>Select a token</>
                        )}
                        <ChevronDownIcon
                            className="-mr-1 ml-2 h-5 w-5"
                            aria-hidden="true"
                        />
                    </Menu.Button>
                </div>

                <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                >
                    <Menu.Items className="origin-top-right absolute mt-2 w-full rounded-md border-2 border-indigo-600 shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                        <div className="py-1">
                            {validOptions.map((validOption) => {
                                const onClick = () =>
                                    onSelectOption(validOption);
                                return (
                                    <Menu.Item
                                        onClick={onClick}
                                        key={
                                            validOption.asset +
                                            "-" +
                                            validOption.chain
                                        }
                                    >
                                        {({ active }) => (
                                            <span
                                                className={classNames(
                                                    active
                                                        ? "bg-gray-100 text-gray-900"
                                                        : "text-gray-700",
                                                    "block px-4 py-2 text-sm"
                                                )}
                                            >
                                                {validOption.asset} on{" "}
                                                {validOption.chain}
                                            </span>
                                        )}
                                    </Menu.Item>
                                );
                            })}
                        </div>
                    </Menu.Items>
                </Transition>
            </Menu>
            <div className="ml-2 w-5">
                {option ? (
                    <button onClick={onCancelOption}>
                        <XIcon
                            className="text-indigo-600 -mb-1 h-5 w-5"
                            aria-hidden="true"
                        />
                    </button>
                ) : null}
            </div>
        </div>
    );
};
