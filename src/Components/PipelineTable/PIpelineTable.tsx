import * as React from "react";

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
import { columnName } from "./ColumnName";
import { PipelineTableType } from "./PipelineTableType";
import { columnState } from "./ColumnState";
import { columnBuilds } from "./ColumnBuilds";

export interface IPipelineTableProps {
    projectName: string;
    organisation: string;
    itemProvider: ObservableValue<ArrayItemProvider<PipelineTableType>>;
}

export default class PipelineTable extends React.Component<IPipelineTableProps> {
    public render(): JSX.Element {

        return (
            <Card
                className="flex-grow bolt-table-card"
                contentProps={{ contentPadding: false }}
                titleProps={{ text: `Pipelines for ${this.props.projectName}` }}
            >
                <Observer itemProvider={this.props.itemProvider}>
                    {(observableProps: { itemProvider: ArrayItemProvider<PipelineTableType> }) => (
                        <Table<Partial<PipelineTableType>>
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
            </Card>
        );
    }

    private columns(): ITableColumn<PipelineTableType>[]{
        return [
            columnName,
            columnState,
            columnBuilds(this.props.organisation),
        ];
    }

    private columnsPartial(): ITableColumn<Partial<PipelineTableType>>[]{
        return this.columns().map((column) => {
            return column as ITableColumn<Partial<PipelineTableType>>;
        });
    }

    private sortingBehavior = new ColumnSorting<Partial<PipelineTableType>>(
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
        (item1: PipelineTableType, item2: PipelineTableType) => {
            return item1.name.localeCompare(item2.name!);
        },
    ];
}
