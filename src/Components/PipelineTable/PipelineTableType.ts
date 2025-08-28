import { BuildDefinitionReference } from "azure-devops-extension-api/Build";


export type PipelineTableType = BuildDefinitionReference & {
    branches?: string[];
};
