import { IProjectInfo } from "azure-devops-extension-api";
import { Build } from "azure-devops-extension-api/Build";
import { ObservableValue } from "azure-devops-ui/Core/Observable";
import { ArrayItemProvider } from "azure-devops-ui/Utilities/Provider";
import { IPipelineItem } from "../../Components/BuildTable/IPipelineItem";
import { PipelineTableType } from "../../Components/PipelineTable/PipelineTableType";


export interface IProjectInfoExtended extends IProjectInfo {
    builds: Build[];
    pipelines: ObservableValue<ArrayItemProvider<PipelineTableType>>;
    pipelineItems: ObservableValue<ArrayItemProvider<IPipelineItem>>;
    otherPipelineItems: ObservableValue<ArrayItemProvider<IPipelineItem>>;
}
