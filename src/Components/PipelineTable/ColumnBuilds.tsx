import { ITableColumn, SimpleTableCell } from "azure-devops-ui/Table";
import React from 'react';
import { PipelineTableType } from "./PipelineTableType";
import { Button } from 'azure-devops-ui/Button';
import { queueBuildForBranch } from '../../Extensions/build-release-hub-group/build-release-hug-group-functions';

export function columnBuilds(organisation: string): ITableColumn<PipelineTableType> {
    var renderColumn = function(
        rowIndex: number,
        columnIndex: number,
        tableColumn: ITableColumn<PipelineTableType>,
        tableItem: PipelineTableType
    ): JSX.Element {   
        
        return (
            <SimpleTableCell
                key={"col-builds-" + columnIndex + "-" + rowIndex}
                columnIndex={columnIndex}
                tableColumn={tableColumn}   
                contentClassName="fontWeightSemiBold font-weight-semibold fontSizeM font-size-m"         
                >
                {tableItem.branches?.map((branch, index) => (
                    <Button 
                        key={"branch-" + rowIndex + "-" + index}                    
                        onClick={async () => { await queueBuildForBranch(organisation, tableItem.project.id, tableItem, branch)}}
                        style={{ marginRight: "5px" }}
                        disabled={organisation == ''}
                        >
                        Queue {branch.replace("refs/heads/", "")}       
                    </Button>
                ))}    
            </SimpleTableCell>
        );
    }

    return {
        id: "pipelineBuilds",
        name: "Builds",
        ariaLabel: "Builds",
        readonly: true,
        renderCell: renderColumn,
        width: -50,
    };

    
}
