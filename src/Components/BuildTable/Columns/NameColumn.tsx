import { Status, StatusSize } from "azure-devops-ui/Status";
import { ITableColumn, SimpleTableCell } from "azure-devops-ui/Table";
import { Tooltip } from "azure-devops-ui/TooltipEx";
import React from "react";
import { IPipelineItem } from "../IPipelineItem";
import { getBuildStatus } from "../BuildTableFunctions";

export const nameColumn = {
    id: "name",
    name: "Pipeline",
    renderCell: renderNameColumn,
    readonly: true,
    sortProps: {
        ariaLabelAscending: "Sorted A to Z",
        ariaLabelDescending: "Sorted Z to A",
    },
    width: -25,
};

function renderNameColumn(
    rowIndex: number,
    columnIndex: number,
    tableColumn: ITableColumn<IPipelineItem>,
    tableItem: IPipelineItem
): JSX.Element {
    return (
        <SimpleTableCell
            columnIndex={columnIndex}
            tableColumn={tableColumn}
            key={"col-" + columnIndex}
            contentClassName="fontWeightSemiBold font-weight-semibold fontSizeM font-size-m"
        >
            <Status
                {...getBuildStatus(tableItem.build).statusProps}
                className="icon-large-margin"
                size={StatusSize.l}
            />
            <div className="flex-row wrap-text">
                <Tooltip overflowOnly={true}>
                    <span>{tableItem.name}</span>
                </Tooltip>
            </div>
        </SimpleTableCell>
    );
}