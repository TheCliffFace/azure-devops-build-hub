import * as SDK from 'azure-devops-extension-sdk';
import { ITableColumn, TableCell } from "azure-devops-ui/Table";
import React from "react";
import { IPipelineItem } from "../IPipelineItem";
import { Button } from "azure-devops-ui/Button";
import { cancelBuild, getProjects } from "../../../Extensions/build-release-hub-group/build-release-hug-group-functions";
import { BuildStatus } from "azure-devops-extension-api/Build";
import { Observable, ObservableValue } from 'azure-devops-ui/Core/Observable';

export const cancelColumn =
{
    id: "cancel",
    ariaLabel: "Cancel",
    readonly: true,
    renderCell: renderColumn,
    width: -5,
};

function renderColumn(
    rowIndex: number,
    columnIndex: number,
    tableColumn: ITableColumn<IPipelineItem>,
    tableItem: IPipelineItem
): JSX.Element {
    const cancelBuildRef = async () => {        
        canCancel.value = false;
        await cancelBuild(tableItem.build);        
    };

    var canCancel: ObservableValue<boolean> = new ObservableValue<boolean>(false)
    canCancel.value = (
        tableItem.build.status === BuildStatus.InProgress 
        || tableItem.build.status === BuildStatus.Postponed
        || tableItem.build.status === BuildStatus.NotStarted
    );

    return (
        <TableCell
            key={"col-" + columnIndex}
            columnIndex={columnIndex}
            tableColumn={tableColumn}            
            >
            {                 
                <Button 
                    primary={false}
                    danger={true}                     
                    onClick={cancelBuildRef}
                    disabled={!canCancel.value}
                        >
                    Cancel       
                </Button>            
            }
        </TableCell>
    );
}