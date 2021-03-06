import { AssetOption } from "../../lib/renJS";
import { Dropdown } from "./Dropdown";

interface Props {
    option?: AssetOption;

    validOptions: Array<AssetOption>;

    onSelectOption: (options: AssetOption) => void;
    onCancelOption: () => void;
}

export const TokenSelection = ({
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
                          label: `${option.chain}`,
                      }
                    : option
            }
            validOptions={validOptions.map((option) => ({
                value: option,
                label: `${option.chain}`,
            }))}
            onSelectOption={(option) => onSelectOption(option.value)}
            onCancelOption={onCancelOption}
        />
    );
};
