import * as React from "react";
import { IPipelineItem } from "./IPipelineItem";

import { Card } from "azure-devops-ui/Card";
import {
    ITableColumn,
    Table,
    ColumnSorting,
    SortOrder,
    sortItems,
} from "azure-devops-ui/Table";
import { ArrayItemProvider } from "azure-devops-ui/Utilities/Provider";
import { ObservableValue } from "azure-devops-ui/Core/Observable";
import { Observer } from "azure-devops-ui/Observer";
import { cancelColumn } from "./Columns/CancelColumn";
import { stagesColumn } from "./Columns/StagesColumn";
import { nameColumn } from "./Columns/NameColumn";
import { lastRunColumn } from "./Columns/LastRunColumn";
import { dateColumn } from "./Columns/DateColumn";
import { BuildDefinitionReference } from "azure-devops-extension-api/Build";

export interface IBuildTableProps {
    projectName: string;
    itemProvider: ObservableValue<ArrayItemProvider<IPipelineItem>>;
    builds?: BuildDefinitionReference[]
}

export default class BuildTable extends React.Component<IBuildTableProps> {
    public render(): JSX.Element {        
        return (
            <Card
                className="flex-grow bolt-table-card"
                contentProps={{ contentPadding: false }}
                titleProps={{ text: `Pipeline Runs for ${this.props.projectName}` }}
            >
                {(this.props.builds) ? 
                    <Observer itemProvider={this.props.itemProvider}>
                        {(observableProps: { itemProvider: ArrayItemProvider<IPipelineItem> }) => (
                            <Table<Partial<IPipelineItem>>
                                ariaLabel="Advanced table"
                                behaviors={[this.sortingBehavior]}
                                className="table-example"
                                columns={this.columnsPartial()}
                                containerClassName="h-scroll-auto"
                                itemProvider={observableProps.itemProvider}
                                showLines={true}
                            />
                        )}
                    </Observer>
                    : 
                    null
                }          
                
            </Card>
        );
    }


    private columns(): ITableColumn<IPipelineItem>[]{
        return [
            nameColumn(this.props.builds!),
            stagesColumn,
            lastRunColumn,
            dateColumn,
            cancelColumn,
        ];
    } 

    private columnsPartial(): ITableColumn<Partial<IPipelineItem>>[]{
        return this.columns().map((column) => {
            return column as ITableColumn<Partial<IPipelineItem>>;
        });
    } 

    private sortingBehavior = new ColumnSorting<Partial<IPipelineItem>>(
        (columnIndex: number, proposedSortOrder: SortOrder) => {
            this.props.itemProvider.value = new ArrayItemProvider(
                sortItems(
                    columnIndex,
                    proposedSortOrder,
                    this.sortFunctions,
                    this.columns(),
                    this.props.itemProvider.value.value
                )
            );
        }
    );

    private sortFunctions = [
        // Sort on Name column
        (item1: IPipelineItem, item2: IPipelineItem) => {
            return item1.name.localeCompare(item2.name!);
        },
    ];
}
