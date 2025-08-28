import { Status, StatusSize } from "azure-devops-ui/Status";
import { ITableColumn, SimpleTableCell } from "azure-devops-ui/Table";
import { Tooltip } from "azure-devops-ui/TooltipEx";
import React from "react";
import { IPipelineItem } from "../IPipelineItem";
import { getBuildStatus } from "../BuildTableFunctions";
import { Link } from "azure-devops-ui/Link";
import { BuildDefinitionReference } from "azure-devops-extension-api/Build";

export function nameColumn(builds: BuildDefinitionReference[]): ITableColumn<IPipelineItem> {
    var renderColumn = function(
        rowIndex: number,
        columnIndex: number,
        tableColumn: ITableColumn<IPipelineItem>,
        tableItem: IPipelineItem
    ): JSX.Element {
        var build = builds.find(f => f.id == tableItem.build.definition.id);        
        var link = build?._links.web.href;
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
                        <Link href={link}>{tableItem.name}</Link>                    
                    </Tooltip>
                </div>
            </SimpleTableCell>
        );
    }
    
    return {
        id: "name",
        name: "Pipeline",
        renderCell: renderColumn,
        readonly: true,
        sortProps: {
            ariaLabelAscending: "Sorted A to Z",
            ariaLabelDescending: "Sorted Z to A",
        },
        width: -25,
    };
}