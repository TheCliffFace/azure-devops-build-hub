import { ITableColumn, SimpleTableCell } from "azure-devops-ui/Table";
import React from 'react';
import { RadioButton, RadioButtonGroup, RadioButtonGroupDirection } from 'azure-devops-ui/RadioButton';
import { BuildDefinitionReference, DefinitionQueueStatus } from 'azure-devops-extension-api/Build';
import { ObservableValue } from 'azure-devops-ui/Core/Observable';
import { updateBuildDefinitionStatus } from '../../Extensions/build-release-hub-group/build-release-hug-group-functions';

export const columnState =
{
    id: "pipelineState",
    name: "State",
    ariaLabel: "State",
    readonly: true,
    renderCell: renderColumn,
    width: -100,
};


function renderColumn(
    rowIndex: number,
    columnIndex: number,
    tableColumn: ITableColumn<BuildDefinitionReference>,
    tableItem: BuildDefinitionReference
): JSX.Element {

    const queueStatus$ = new ObservableValue<string>(tableItem.queueStatus.toString());

    const updateQueueStatus = async (queueStatus: string) => {
        queueStatus$.value = queueStatus;
        tableItem.queueStatus = DefinitionQueueStatus[queueStatus as keyof typeof DefinitionQueueStatus];

        await updateBuildDefinitionStatus(
            tableItem.project.id,
            tableItem
        );        
    };

    return (
        <SimpleTableCell
            key={"col-" + columnIndex}
            columnIndex={columnIndex}
            tableColumn={tableColumn}   
            contentClassName="fontWeightSemiBold font-weight-semibold fontSizeM font-size-m"         
            >
                <RadioButtonGroup
                    onSelect={updateQueueStatus}
                    selectedButtonId={queueStatus$}
                    text={""}
                    direction={RadioButtonGroupDirection.Horizontal}
                >
                    
                    <RadioButton 
                        id={DefinitionQueueStatus.Enabled.toString()} 
                        text="Enabled"
                        key="1" /> 

                    <RadioButton 
                        id={DefinitionQueueStatus.Disabled.toString()} 
                        text="Disabled" 
                        key="0" />                        
                        
                    <RadioButton 
                        id={DefinitionQueueStatus.Paused.toString()} 
                        text="Paused"
                        key="2" />                                                                    
                </RadioButtonGroup>
        </SimpleTableCell>
    );
}