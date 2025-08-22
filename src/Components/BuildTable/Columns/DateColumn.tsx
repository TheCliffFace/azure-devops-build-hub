import { Ago } from "azure-devops-ui/Ago";
import { Duration } from "azure-devops-ui/Duration";
import { IIconProps, Icon } from "azure-devops-ui/Icon";
import { ITableColumn, TwoLineTableCell } from "azure-devops-ui/Table";
import { css } from "azure-devops-ui/Util";
import { AgoFormat } from "azure-devops-ui/Utilities/Date";
import React from "react";
import { IPipelineItem } from "../IPipelineItem";

export const dateColumn = {
    id: "time",
    ariaLabel: "Time and duration",
    readonly: true,
    renderCell: renderDateColumn,
    width: -20,
};

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
