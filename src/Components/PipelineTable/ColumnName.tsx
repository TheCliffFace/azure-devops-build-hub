import { ITableColumn, SimpleTableCell } from "azure-devops-ui/Table";
import React from 'react';
import { PipelineTableType } from "./PipelineTableType";
import { Tooltip } from 'azure-devops-ui/TooltipEx';
import { Link } from 'azure-devops-ui/Link';

export const columnName =
{
    id: "pipelineName",
    name: "Pipeline Name",
    ariaLabel: "Pipeline Name",
    readonly: true,
    renderCell: renderColumn,
    width: -100,
};

function renderColumn(
    rowIndex: number,
    columnIndex: number,
    tableColumn: ITableColumn<PipelineTableType>,
    tableItem: PipelineTableType
): JSX.Element {
    return (
        <SimpleTableCell
            key={"col-" + columnIndex}
            columnIndex={columnIndex}
            tableColumn={tableColumn}   
            contentClassName="fontWeightSemiBold font-weight-semibold fontSizeM font-size-m"         
            >
                <div className="flex-row wrap-text">                    
                    <Tooltip overflowOnly={true}>
                        <Link href={tableItem._links.web.href}>{tableItem.name}</Link>
                    </Tooltip>
                </div>
        </SimpleTableCell>
    );
}