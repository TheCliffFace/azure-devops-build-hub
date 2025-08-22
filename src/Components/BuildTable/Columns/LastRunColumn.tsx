import { ITableColumn, TwoLineTableCell } from "azure-devops-ui/Table";
import { Tooltip } from "azure-devops-ui/TooltipEx";
import React from "react";
import { IPipelineItem } from "../IPipelineItem";
import { BuildBranch, BuildText, ReleaseTypeFromItem } from "../BuildTableFunctions";
import { Icon } from "azure-devops-ui/Icon";
import { Link } from "azure-devops-ui/Link";
import { ReleaseType } from "../ReleaseType";

export const lastRunColumn = {
    className: "pipelines-two-line-cell",
    id: "lastRun",
    name: "Last run",
    renderCell: renderLastRunColumn,
    width: -46,
};

function renderLastRunColumn(
    rowIndex: number,
    columnIndex: number,
    tableColumn: ITableColumn<IPipelineItem>,
    tableItem: IPipelineItem
): JSX.Element {
    const branchName = BuildBranch(tableItem);
    const releaseType = ReleaseTypeFromItem(tableItem);
    const buildText = BuildText(tableItem);
    const sourceVersion = tableItem.build.sourceVersion;

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
                    <Tooltip text={sourceVersion} overflowOnly>
                        <Link
                            key="release-type-text" 
                            className="monospaced-text bolt-table-link bolt-table-inline-link"
                            href={tableItem.build.repository.url + '/commit/' + sourceVersion}
                            >
                            {sourceVersion.substring(0, 8)}
                        </Link>
                    </Tooltip>
                    <Tooltip text={branchName} overflowOnly>
                        <Link
                            className="monospaced-text bolt-table-link bolt-table-inline-link"
                            excludeTabStop
                            href={tableItem.build.repository.url}
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
