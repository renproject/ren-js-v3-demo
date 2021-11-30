import { Dropdown } from "./Dropdown";

interface Props {
    option?: string;

    validOptions: Array<string>;

    onSelectOption: (options: string) => void;
    onCancelOption: () => void;
}

export const AssetSelection = ({
    option,
    validOptions,
    onSelectOption,
    onCancelOption,
}: Props) => {
    return (
        <Dropdown
            option={
                option
                    ? {
                          value: option,
                          label: option,
                      }
                    : undefined
            }
            validOptions={validOptions.map((option) => ({
                value: option,
                label: option,
            }))}
            onSelectOption={(option) => onSelectOption(option.value)}
            onCancelOption={onCancelOption}
        />
    );
};
