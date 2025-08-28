import * as SDK from 'azure-devops-extension-sdk';
import { Pipeline, Run } from "./PIpelines";

export interface IListResponse<T> {
    count: number;
    value: T[];
}


// your collection url
let orgUrl = "https://dev.azure.com";
let apiVersion = "7.1";

function getUrl(organisation: string, stub: string) : string {
    const url = new URL(`${orgUrl}/${organisation}/${stub}`);
    url.searchParams.append("api-version", apiVersion);
    return url.toString();
}

async function fetchApiResponse<T>(method: "GET" | "POST", organisation: string, stub: string, body: any | undefined = undefined): Promise<T>{
    
    await SDK.ready();
    const accessToken = await SDK.getAccessToken();
    // Construct the Basic Authorization header
    const username = ""; // Azure DevOps username (can be empty for PAT-based auth)
    const credentials = `${username}:${accessToken}`;
    const encodedCredentials = btoa(credentials);

    // Make the fetch call    
    const response = await fetch(
        getUrl(organisation, stub), 
        {
            method: method,
            headers: {
                Authorization: `Basic ${encodedCredentials}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body)
        }
    );

    // Check if the response is OK
    if (!response.ok) {
        throw new Error(`Failed to fetch pipelines: ${response.status} ${response.statusText}`);
    }

    // Parse the response and cast it to the PipelineResponse interface
    const data: T = await response.json();

    // Return the list of pipelines
    return data; 
}

export async function getPipelineRuns(
    organisation: string,
    project: string, 
): Promise<IListResponse<Run>> {
    const response = await fetchApiResponse<IListResponse<Run>>(
        "GET",
        organisation,
        `${project}/_apis/pipelines/runs`
    );

    // Return the list of pipelines
    return response; 
}

export async function startPipeline(
        organisation: string,
        project: string, 
        pipelineId: number,
        branch: string,
            ) : Promise<Run> {   

    const run: any = {
        resources: {
            repositories: {
                self: {
                    refName: branch // e.g., "refs/heads/master"
                }
            },
            builds: {},
            containers: {},
            pipelines: {}
        },      
        createdDate: new Date(),              
    };

    const response = await fetchApiResponse<Run>(
        "POST",
        organisation,
        `${project}/_apis/pipelines/${pipelineId}/runs`,
        run
    );    
        
    // Return the list of pipelines
    return response; 
}