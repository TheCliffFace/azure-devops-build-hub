import * as React from "react";
import {
    BuildBranch,
    BuildText,
    ReleaseTypeFromItem,
    ReleaseTypeText,
} from "./BuildTableFunctions";
import { IPipelineItem } from "./IPipelineItem";
import { ReleaseType } from "./ReleaseType";

import { Card } from "azure-devops-ui/Card";
import { Icon, IIconProps } from "azure-devops-ui/Icon";
import { Link } from "azure-devops-ui/Link";
import {
    ColumnMore,
    ITableColumn,
    Table,
    TwoLineTableCell,
    ColumnSorting,
    SortOrder,
    sortItems,
} from "azure-devops-ui/Table";
import { Ago } from "azure-devops-ui/Ago";
import { Duration } from "azure-devops-ui/Duration";
import { Tooltip } from "azure-devops-ui/TooltipEx";
import { css } from "azure-devops-ui/Util";
import { ArrayItemProvider } from "azure-devops-ui/Utilities/Provider";
import { ObservableValue } from "azure-devops-ui/Core/Observable";
import { Observer } from "azure-devops-ui/Observer";
import { cancelColumn } from "./Columns/CancelColumn";
import { stagesColumn } from "./Columns/StagesColumn";
import { nameColumn } from "./Columns/NameColumn";
import { AgoFormat } from "azure-devops-ui/Utilities/Date";

export interface IBuildTableProps {
    projectName: string;
    itemProvider: ObservableValue<ArrayItemProvider<IPipelineItem>>;
}

export default class BuildTable extends React.Component<IBuildTableProps> {
    public render(): JSX.Element {
        return (
            <Card
                className="flex-grow bolt-table-card"
                contentProps={{ contentPadding: false }}
                titleProps={{ text: `Pipeline Runs for ${this.props.projectName}` }}
            >
                <Observer itemProvider={this.props.itemProvider}>
                    {(observableProps: { itemProvider: ArrayItemProvider<IPipelineItem> }) => (
                        <Table<Partial<IPipelineItem>>
                            ariaLabel="Advanced table"
                            behaviors={[this.sortingBehavior]}
                            className="table-example"
                            columns={this.columnsPartial}
                            containerClassName="h-scroll-auto"
                            itemProvider={observableProps.itemProvider}
                            showLines={true}
                            onSelect={(event, data) => console.log("Selected Row - " + data.index)}
                            onActivate={(event, row) => console.log("Activated Row - " + row.index)}
                        />
                    )}
                </Observer>
            </Card>
        );
    }


    private columns: ITableColumn<IPipelineItem>[] = [
        nameColumn,
        stagesColumn,
        {
            className: "pipelines-two-line-cell",
            id: "lastRun",
            name: "Last run",
            renderCell: renderLastRunColumn,
            width: -46,
        },
        {
            id: "time",
            ariaLabel: "Time and duration",
            readonly: true,
            renderCell: renderDateColumn,
            width: -20,
        },
        cancelColumn,
        /*
        new ColumnMore(() => {
            return {
                id: "sub-menu",
                items: [
                    { id: "submenu-one", text: "SubMenuItem 1" },
                    { id: "submenu-two", text: "SubMenuItem 2" },
                ],
            };
        }),*/
    ];

    private columnsPartial: ITableColumn<Partial<IPipelineItem>>[] = this.columns.map((column) => {
        return column as ITableColumn<Partial<IPipelineItem>>;
    });

    private sortingBehavior = new ColumnSorting<Partial<IPipelineItem>>(
        (columnIndex: number, proposedSortOrder: SortOrder) => {
            this.props.itemProvider.value = new ArrayItemProvider(
                sortItems(
                    columnIndex,
                    proposedSortOrder,
                    this.sortFunctions,
                    this.columns,
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


function renderLastRunColumn(
    rowIndex: number,
    columnIndex: number,
    tableColumn: ITableColumn<IPipelineItem>,
    tableItem: IPipelineItem
): JSX.Element {
    const branchName = BuildBranch(tableItem);
    const releaseType = ReleaseTypeFromItem(tableItem);
    const buildText = BuildText(tableItem);
    const releaseTypeText = ReleaseTypeText({releaseType});

    return (
        <TwoLineTableCell
            className="bolt-table-cell-content-with-inline-link no-v-padding"
            key={"col-" + columnIndex}
            columnIndex={columnIndex}
            tableColumn={tableColumn}
            line1={
                <span className="flex-row wrap-text">
                    <Tooltip text={buildText} overflowOnly>
                        <Link
                            className="fontSizeM font-size-m bolt-table-link bolt-table-inline-link"
                            excludeTabStop
                            href={tableItem.build._links.web.href}
                        >
                            {buildText}
                        </Link>
                    </Tooltip>
                </span>
            }
            line2={
                <span className="fontSize font-size secondary-text flex-row flex-center">
                    {releaseTypeIcon({ releaseType: releaseType })}
                    <Tooltip text={releaseTypeText} overflowOnly>
                        <span key="release-type-text" style={{flexShrink: 10}}>
                            {releaseTypeText}
                        </span>
                    </Tooltip>
                    <Tooltip text={branchName} overflowOnly>
                        <Link
                            className="monospaced-text bolt-table-link bolt-table-inline-link"
                            excludeTabStop
                            href="#branch"
                        >
                            {Icon({
                                className: "icon-margin",
                                iconName: "OpenSource",
                                key: "branch-name",
                            })}
                            {branchName}
                        </Link>
                    </Tooltip>
                </span>
            }
        />
    );
}

function renderDateColumn(
    rowIndex: number,
    columnIndex: number,
    tableColumn: ITableColumn<IPipelineItem>,
    tableItem: IPipelineItem
): JSX.Element {

    var startTime = tableItem?.lastRunData?.startTime;
    var endTime = tableItem?.lastRunData?.endTime;
    
    return (
        <TwoLineTableCell
            key={"col-" + columnIndex}
            columnIndex={columnIndex}
            tableColumn={tableColumn}
            line1={withIcon({
                className: "fontSize font-size",
                iconProps: { iconName: "Calendar" },
                children: (
                    (startTime ? 
                    <Ago date={startTime} format={AgoFormat.Extended} />
                    : 
                    <span className="secondary-text">No start time</span>
                    )
                ),
            })}
            line2={withIcon({
                className: "fontSize font-size bolt-table-two-line-cell-item wrap-text",
                iconProps: { iconName: "Clock" },
                children: (
                    (startTime ? 
                    <Duration
                        startDate={startTime}
                        endDate={endTime}
                    />
                    : 
                    null
                    )
                ),
            })}
        />
    );
}

function withIcon(props: {
    className?: string;
    iconProps: IIconProps;
    children?: React.ReactNode;
}) {
    return (
        <div className={css(props.className, "flex-row flex-center")}>
            {Icon({ ...props.iconProps, className: "icon-margin" })}
            {props.children}
        </div>
    );
}

function releaseTypeIcon(props: { releaseType: ReleaseType }) {
    let iconName: string = "";
    switch (props.releaseType) {
        case ReleaseType.prAutomated:
            iconName = "BranchPullRequest";
            break;
        default:
            iconName = "Tag";
    }

    return Icon({
        className: "bolt-table-inline-link-left-padding icon-margin",
        iconName: iconName,
        key: "release-type",
    });
}
