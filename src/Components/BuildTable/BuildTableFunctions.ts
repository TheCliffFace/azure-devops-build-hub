
import { Statuses } from "azure-devops-ui/Status";
import { ReleaseType } from "./ReleaseType";
import { IStatusIndicatorData } from "./IStatusIndicatorData";
import { Build, BuildResult, BuildStatus, TaskResult, TimelineRecord, TimelineRecordState } from "azure-devops-extension-api/Build";
import { IPipelineItem } from "./IPipelineItem";

export function getTimelineStatus(record: TimelineRecord): IStatusIndicatorData {

    const status = record.state;
    const indicatorData: IStatusIndicatorData = {
        label: "Success",
        statusProps: { ...Statuses.Success, ariaLabel: "Success" },
    };
    
    switch (status) {
        case TimelineRecordState.Pending:
            indicatorData.statusProps = { ...Statuses.Waiting, ariaLabel: "Waiting" };
            indicatorData.label = "Waiting";
            break;
        case TimelineRecordState.InProgress:
            indicatorData.statusProps = { ...Statuses.Running, ariaLabel: "Running" };
            indicatorData.label = "Running";
            break;
        case TimelineRecordState.Completed: 
            switch (record.result) {
                case TaskResult.Succeeded:
                    indicatorData.statusProps = { ...Statuses.Success, ariaLabel: "Success" };
                    indicatorData.label = "Success";
                    break;
                case TaskResult.Failed:
                    indicatorData.statusProps = { ...Statuses.Failed, ariaLabel: "Failed" };
                    indicatorData.label = "Failed";
                    break;
                case TaskResult.Canceled:
                    indicatorData.statusProps = { ...Statuses.Canceled, ariaLabel: "Cancelled" };
                    indicatorData.label = "Cancelled";
                    break;
                case TaskResult.Skipped:
                    indicatorData.statusProps = { ...Statuses.Skipped, ariaLabel: "Skipped" };
                    indicatorData.label = "Skipped";
                case TaskResult.Abandoned:
                    indicatorData.statusProps = { ...Statuses.Skipped, ariaLabel: "Abandoned" };
                    indicatorData.label = "Abandoned";                                                                           
                default:
                    indicatorData.statusProps = { ...Statuses.Warning, ariaLabel: "Warning" };
                    indicatorData.label = "Warning";
            }
    }

    return indicatorData;
}

export function getBuildStatus(build: Build): IStatusIndicatorData {

    const status = build.status;
    
    const indicatorData: IStatusIndicatorData = {
        label: "Success",
        statusProps: { ...Statuses.Success, ariaLabel: "Success" },
    };
    
    switch (status) {
        case BuildStatus.None:
            indicatorData.statusProps = { ...Statuses.Information, ariaLabel: "None" };
            indicatorData.label = "None";
            break;
        case BuildStatus.InProgress:                        
            indicatorData.statusProps = { ...Statuses.Running, ariaLabel: "Running" };
            indicatorData.label = "Running";
            break;
        case BuildStatus.Cancelling:
            indicatorData.statusProps = { ...Statuses.Canceled, ariaLabel: "Cancelling" };
            indicatorData.label = "Cancelling";
            break;        
        case BuildStatus.NotStarted:
            indicatorData.statusProps = { ...Statuses.Waiting, ariaLabel: "Not Started" };
            indicatorData.label = "Not Started";
            break;
        case BuildStatus.Postponed:
            indicatorData.statusProps = { ...Statuses.Waiting, ariaLabel: "Postponed" };
            indicatorData.label = "Postponed";
            break;
        case BuildStatus.Completed:
            switch (build.result) {
                case BuildResult.Succeeded:
                    indicatorData.statusProps = { ...Statuses.Success, ariaLabel: "Success" };
                    indicatorData.label = "Success";
                    break;
                case BuildResult.Failed:
                    indicatorData.statusProps = { ...Statuses.Failed, ariaLabel: "Failed" };
                    indicatorData.label = "Failed";
                    break;
                case BuildResult.Canceled:
                    indicatorData.statusProps = { ...Statuses.Canceled, ariaLabel: "Warning" };
                    indicatorData.label = "Warning";
                    break;
                default:
                    indicatorData.statusProps = { ...Statuses.Warning, ariaLabel: "Warning" };
                    indicatorData.label = "Warning";
            }
            break;
    }

    return indicatorData;
}

export function ReleaseTypeFromItem(props: IPipelineItem): ReleaseType {
    if(!props.build.triggerInfo){
        return ReleaseType.manual;
    }

    if(props.build.triggerInfo['ci.message']) {
        return ReleaseType.prAutomated;
    }

    return ReleaseType.tag;
}

export function BuildText(props: IPipelineItem): string {
    var result = "#" + props.build.buildNumber 

    if(props.build.triggerInfo['ci.message']) {
        result += " \u00b7 " + props.build.triggerInfo['ci.message'];
    }

    return result;
}

export function BuildBranch(props: IPipelineItem): string {
    return props.build.sourceBranch.replace('refs/heads/', '');
}
