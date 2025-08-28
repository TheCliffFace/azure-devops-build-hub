import { ObservableValue } from "azure-devops-ui/Core/Observable";
import { ArrayItemProvider } from "azure-devops-ui/Utilities/Provider";
import { IPipelineItem } from "../../Components/BuildTable/IPipelineItem";
import { PipelineTableType } from "../../Components/PipelineTable/PipelineTableType";
import { defaultProjectContext } from "./build-release-hub-group";
import { IProjectInfoExtended } from "./IProjectInfoExtended";

export const defaultProject: IProjectInfoExtended = {
    ...defaultProjectContext,
    builds: [],    
    pipelineItems: new ObservableValue<ArrayItemProvider<IPipelineItem>>(new ArrayItemProvider([])),
    otherPipelineItems: new ObservableValue<ArrayItemProvider<IPipelineItem>>(new ArrayItemProvider([])),
    branches: [],
};
