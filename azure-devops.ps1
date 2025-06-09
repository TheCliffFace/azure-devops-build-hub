#$env:AZURE_DEVOPS_USER = ''
#$env:AZURE_DEVOPS_PASSWORD = ''
#

function get-azuredevops {
    param(
        $path,
        $debug = $false
    )

    $pair = "$($user):$($pass)"
    
    $encodedCreds = [System.Convert]::ToBase64String([System.Text.Encoding]::ASCII.GetBytes($pair))
    
    $basicAuthValue = "Basic $encodedCreds"
    
    $Headers = @{
        Authorization = $basicAuthValue
    }

    $apiVersion = "api-version=7.1"
    #$apiVersion = "api-version=6.0"    
    
    #write-host "Path: $path"
    if($path -like '*\?*'){
        #write-host "1"
        $path = "$path&$apiVersion"
    } else {
        #write-host "2"
        $path = "$path\?$apiVersion"
    }

    $url = "https://dev.azure.com/$organisation/$path"
    if($debug){
        write-host "Getting $url"
    }    

    $result = Invoke-WebRequest -Uri $url -Headers $Headers

    if($debug){
        write-host "Response: $($result.StatusCode)"
    }

    return $result.Content | convertfrom-json
}

function get-projects {    
    return get-azuredevops "_apis/projects"
}

function get-pipelines {
    param(
        $projectId
    )
    
    # https://dev.azure.com/{organization}/{project}/_apis/pipelines?orderBy={orderBy}&$top={$top}&continuationToken={continuationToken}&api-version=7.2-preview.1
    $top = 100
    return get-azuredevops "$projectId/_apis/pipelines?top=$top&continuationToken=$continuationToken"
}

function get-pipelineruns {
    param(
        $projectId,
        $pipelineId
    )
    
    # https://dev.azure.com/{organization}/{project}/_apis/pipelines/{pipelineId}/runs?api-version=7.2-preview.1
    return get-azuredevops "$projectId/_apis/pipelines/$pipelineId/runs"
}

function get-builds {
    param(
        $projectId
    )
    
    # https://dev.azure.com/{organization}/{project}/_apis/build/builds?definitions={definitions}&queues={queues}&buildNumber={buildNumber}&minTime={minTime}&maxTime={maxTime}&requestedFor={requestedFor}&reasonFilter={reasonFilter}&statusFilter={statusFilter}&resultFilter={resultFilter}&tagFilters={tagFilters}&properties={properties}&$top={$top}&continuationToken={continuationToken}&maxBuildsPerDefinition={maxBuildsPerDefinition}&deletedFilter={deletedFilter}&queryOrder={queryOrder}&branchName={branchName}&buildIds={buildIds}&repositoryId={repositoryId}&repositoryType={repositoryType}&api-version=7.2-preview.7
    return get-azuredevops "$projectId/_apis/build/builds"
}


function get-build {
    param(
        $projectId,
        $runId
    )
    
    # https://dev.azure.com/{organization}/{project}/_apis/build/builds/{buildId}?api-version=7.2-preview.7
    return get-azuredevops "$projectId/_apis/build/builds/$runId"
}

function get-buildProperties {
    param(
        $projectId,
        $runId
    )
    
    # https://dev.azure.com/{organization}/{project}/_apis/build/builds/{buildId}/properties?api-version=7.2-preview.1
    return get-azuredevops "$projectId/_apis/build/builds/$runId/properties"    

}

function get-buildTimeline {
    param(
        $projectId,
        $runId,
        $timelineId
    )
    
    # https://dev.azure.com/{organization}/{project}/_apis/build/builds/{buildId}/timeline/{timelineId}?api-version=7.2-preview.3
    return get-azuredevops "$projectId/_apis/build/builds/$runId/timeline/$timelineId"
}

function get-buildLogs {
    param(
        $projectId,
        $pipelineId
    )

    # https://dev.azure.com/{organization}/{project}/_apis/build/builds/{buildId}/logs?api-version=7.2-preview.2
    return get-azuredevops "$projectId/_apis/build/builds/$pipelineId/logs"
}

function get-buildreport {
    param(
        $projectId,
        $runId
    )
    #GET https://dev.azure.com/{organization}/{project}/_apis/build/builds/{buildId}/report?api-version=7.1
    return get-azuredevops "$projectId/_apis/build/builds/$runId/report" $true
}

function get-buildstatus {
    param(
        $projectId,
        $definitionId
    )

    #GET https://dev.azure.com/{organization}/{project}/_apis/build/status/{definition}?api-version=7.1-preview.1
    return get-azuredevops "$projectId/_apis/build/status/$definitionId" $true
}


    
$organisation = "thecliffface"
$user = $env:AZURE_DEVOPS_USER
$pass = $env:AZURE_DEVOPS_PASSWORD

#VERB https://dev.azure.com/{organization}/_apis/{area}/{resource}?api-version={version}

clear-host
$projects = get-projects

#$buildTimeLine = get-buildTimeline "38630c9f-8b05-48e0-974c-fab193a5d24e" 2349
#$buildLogs = get-buildLogs "38630c9f-8b05-48e0-974c-fab193a5d24e" 2349
#$buildTimeLine | select-object { $_.name, $_.state }
#exit

$inProgressRuns = @()
$buildStages = @()

foreach($project in $projects.value){
        
    $pipelines = get-pipelines $project.id
    
    foreach($pipeline in $pipelines.value){
        
        #$builds = get-builds $pipeline.id
        $pipelineRuns = get-pipelineruns $project.id $pipeline.id
        $inProgress = $pipelineRuns.value | where-object { $_.state -eq "inProgress" }
        $inProgressRuns += $inProgress
        
        foreach($run in $inProgress){            
            $build = get-build $project.id $run.id
            $buildTimeLine = get-buildTimeline $project.id $run.id    
            #$buildStatus = get-buildStatus $project.id $run.id                            
            # build reports not enabled
            #$buildReport = get-buildreport $project.id $run.id  

            # build properties not all that useful
            #$buildProperties = get-buildProperties $project.id $run.id

            $projectExpression = @{label="project";expression={$project.name}}
            $pipelineExpression = @{label="pipeline";expression={$pipeline.name}}
            $runExpression = @{label="run";expression={$run.state}}    
            $branchExpression = @{label="branch";expression={$build.sourceBranch}}            
            $buildNumber = @{label="buildNumber";expression={$build.buildNumber}}            
            $buildTime = @{label="startTime";expression={$build.startTime}}            
            $buildStages += $buildTimeline.records `
                | where-object { `
                    $_.type -eq 'Stage' `
                    -and $_.state -ne 'completed'
                } `
                | select-object `
                    $projectExpression, `
                    $pipelineExpression, `
                    $runExpression, `
                    $branchExpression, `
                    $buildNumber, `
                    $buildTime, `
                    name, `
                    state, `
                    type, `
                    refName, `
                    identifier 
                        
        #    $logs = get-logs $project.id $pipeline.id $inProgress[0].id            
        }
    }    
}

$buildStages = $buildStages `
    | sort-object -property state 

$buildStages | format-table 
    