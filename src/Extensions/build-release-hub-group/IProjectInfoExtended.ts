import { IProjectInfo } from "azure-devops-extension-api";
import { Build, BuildDefinitionReference } from "azure-devops-extension-api/Build";
import { ObservableValue } from "azure-devops-ui/Core/Observable";
import { ArrayItemProvider } from "azure-devops-ui/Utilities/Provider";
import { IPipelineItem } from "../../Components/BuildTable/IPipelineItem";


export interface IProjectInfoExtended extends IProjectInfo {
    builds: Build[];
    pipelines?: ObservableValue<ArrayItemProvider<BuildDefinitionReference>>;
    pipelineItems: ObservableValue<ArrayItemProvider<IPipelineItem>>;
    otherPipelineItems: ObservableValue<ArrayItemProvider<IPipelineItem>>;
    otherPipelines?: ObservableValue<ArrayItemProvider<BuildDefinitionReference>>;
    branches: string[];
}
