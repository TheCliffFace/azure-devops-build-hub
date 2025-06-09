import * as SDK from 'azure-devops-extension-sdk';
import { ITableColumn, SimpleTableCell, TableCell } from "azure-devops-ui/Table";
import React from "react";
import { IPipelineItem } from "../IPipelineItem";
import { Button } from "azure-devops-ui/Button";
import { cancelBuild, getProjects } from "../../../Samples/build-release-hub-group/build-release-hug-group-functions";
import { BuildStatus } from "azure-devops-extension-api/Build";
import { getBuildStatus, getTimelineStatus } from '../BuildTableFunctions';
import { Status, StatusSize } from 'azure-devops-ui/Status';
import { Tooltip } from 'azure-devops-ui/TooltipEx';

export const stagesColumn =
{
    id: "stages",
    ariaLabel: "Stages",
    readonly: true,
    renderCell: renderColumn,
    width: -40,
};

function renderColumn(
    rowIndex: number,
    columnIndex: number,
    tableColumn: ITableColumn<IPipelineItem>,
    tableItem: IPipelineItem
): JSX.Element {    

    const stages = (tableItem.stages ?? [])
        .sort((a, b) => 
            a.order < b.order ? -1 : 1
        );

    return (
        <SimpleTableCell
            key={"col-" + columnIndex}
            columnIndex={columnIndex}
            tableColumn={tableColumn}  
            contentClassName="fontWeightSemiBold font-weight-semibold fontSizeM font-size-m"       
            >
            {stages.map((stage, index) => (
                <React.Fragment key={`stage-${index}`}>
                    {(index > 0 ? 
                        <span key={`stage-span-${index}`} className="icon icon-chevron-right icon-large-margin" /> 
                    : 
                        null 
                        )}
                    <Status
                        key={`stage-status-${index}`} 
                        {...getTimelineStatus(stage).statusProps}
                        className="icon-large-margin"
                        size={StatusSize.l}
                    />
                    <div
                        key={`stage-div-${index}`} 
                        className="flex-row wrap-text">
                        <Tooltip overflowOnly={true}>
                            <span>{stage.name}</span>
                        </Tooltip>
                    </div>  
                </React.Fragment>              
            ))}
        </SimpleTableCell>
    );
}