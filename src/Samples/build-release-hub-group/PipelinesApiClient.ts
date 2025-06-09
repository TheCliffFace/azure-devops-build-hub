import * as SDK from 'azure-devops-extension-sdk';
import { Pipeline, Run } from "./PIpelines";

export interface IListResponse<T> {
    count: number;
    value: T[];
}


// your collection url
let orgUrl = "https://dev.azure.com/thecliffface";
let apiVersion = "7.1";

function getUrl(stub: string) : string {
    const url = new URL(`${orgUrl}/${stub}`);
    url.searchParams.append("api-version", apiVersion);
    return url.toString();
}

async function postApiResponse<T>(stub: string, body: any): Promise<T>{
    
    await SDK.ready();
    const accessToken = await SDK.getAccessToken();
    // Construct the Basic Authorization header
    const username = ""; // Azure DevOps username (can be empty for PAT-based auth)
    const credentials = `${username}:${accessToken}`;
    const encodedCredentials = btoa(credentials);

    // Make the fetch call    
    const response = await fetch(
        getUrl(stub), 
        {
            method: "POST",
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

export async function startPipeline(
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
        //id: 12345,        
        createdDate: new Date(),              
    };

    //run.resources.repositories["refName"] = branch;

    const response = await postApiResponse<Run>(
        `${project}/_apis/pipelines/${pipelineId}/runs`,
        run
    );    
    
    
    /*
    $postBody = {         
        "resources": {
            "repositories": {
                "self": {
                    "refName": "refs/heads/master"
                }
            }
        },
        "templateParameters": {
            "testParam": "new value for parameter"
        },
        "variables": {
            "testVar": { 
                "value": "new value for variable"
            }
        }
    }*/
    // Return the list of pipelines
    return response; 
}