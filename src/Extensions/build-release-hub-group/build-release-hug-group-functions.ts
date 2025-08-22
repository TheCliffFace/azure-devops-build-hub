import * as SDK from 'azure-devops-extension-sdk';
import { CommonServiceIds, IProjectInfo, IProjectPageService,  getClient } from 'azure-devops-extension-api';
import { 
  Build, 
  BuildDefinition, 
  BuildDefinitionReference, 
  BuildQueryOrder, 
  BuildRestClient, 
  BuildStatus, 
  DefinitionQueryOrder, 
  Timeline,
} from 'azure-devops-extension-api/Build';

import { CoreRestClient, TeamProjectReference } from 'azure-devops-extension-api/Core';
import { PagedList } from 'azure-devops-extension-api/WebApi';
import { Run } from './PIpelines';
import { startPipeline } from './PipelinesApiClient';

export async function getCurrentProject(): Promise<IProjectInfo | undefined> {
  const pps = await SDK.getService<IProjectPageService>(
    CommonServiceIds.ProjectPageService
  );
  const project = await pps.getProject();
  return project;
}

export async function getProjects() : Promise<TeamProjectReference[]> {
  
  // Get the CoreRestClient
  const coreClient = getClient(CoreRestClient);
  
  // Fetch all projects
  const projects =  await coreClient.getProjects();
  return projects;
}


export async function updateBuildDefinitionStatus( 
      projectId: string,
      definition: BuildDefinitionReference ){ 
    const client = getClient(BuildRestClient);

    var buildDefinition = await client.getDefinition(
      projectId,
      definition.id
    );

    buildDefinition.queueStatus = definition.queueStatus;

    await client.updateDefinition(
      buildDefinition,
      projectId,
      definition.id
    )
}

export async function queueBuildForBranch(
  projectId: string,
  buildDefinition: BuildDefinitionReference,
  branchName: string
): Promise<Run> {
  var response = await startPipeline(projectId, buildDefinition.id, branchName)

  return response;
}

export async function getBuildDefinitions( 
  projectId: string,
  top: number = 100,
): Promise<PagedList<BuildDefinitionReference>> {
  const client = getClient(BuildRestClient);

  const name: string | undefined  = undefined;
  const repositoryId: string | undefined  = undefined;
  const repositoryType: string | undefined = undefined;
  const queryOrder: DefinitionQueryOrder = DefinitionQueryOrder.DefinitionNameAscending;

  const definitions = await client.getDefinitions(
    projectId,
    name,
    repositoryId,
    repositoryType,
    queryOrder,
    top,
  );  

  return definitions;
}

export async function getBuildTimeline( 
  projectId: string,
  buildId: number,
): Promise<Timeline> {
  const client = getClient(BuildRestClient);

  const timeline = await client.getBuildTimeline(
      projectId,
      buildId,
  );  

  return timeline;
}

export async function cancelBuild(
    build: Build
): Promise<Build> {  
  const client = getClient(BuildRestClient);
  
  build.status = BuildStatus.Cancelling;

  // Cancel the build
  return await client.updateBuild(
    build,
    build.project.id,
    build.id
  );
}

export async function getBuildsInProgress(
  projectId: string,
  top: number = 100, 
  status: BuildStatus | undefined = BuildStatus.InProgress
  ): Promise<Build[]> {  
  const client = getClient(BuildRestClient);
  
  const builds = await client.getBuilds(
    projectId, 
    [],
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    status,
    undefined,
    undefined,
    undefined,
    top,
    undefined,
    undefined,
    undefined,
    BuildQueryOrder.QueueTimeDescending,
    undefined,
    undefined,
    undefined,
    undefined
  );
    
  return builds;
}

export async function getPipelineDefinition(pipelineId: number): Promise<BuildDefinition> {
  const projectId = (await getCurrentProject())?.id;
  return await getClient(BuildRestClient).getDefinition(projectId!, pipelineId);
}
