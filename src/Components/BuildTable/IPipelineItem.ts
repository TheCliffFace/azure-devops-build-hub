import { ObservableValue } from "azure-devops-ui/Core/Observable";
import { IPipelineLastRun } from "./IPipelineLastRun";
import { Build, BuildStatus, TimelineRecord } from "azure-devops-extension-api/Build";

export interface IPipelineItem {
    name: string;
    status: BuildStatus;
    lastRunData: IPipelineLastRun;
    favorite: ObservableValue<boolean>;
    build: Build;
    stages?: TimelineRecord[] 
}
