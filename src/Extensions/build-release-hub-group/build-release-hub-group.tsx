import * as React from "react";
import * as SDK from "azure-devops-extension-sdk";

import "./build-release-hub-group.scss";
import { Header, TitleSize } from "azure-devops-ui/Header";
import { Page } from "azure-devops-ui/Page";
import { Spinner, SpinnerOrientation, SpinnerSize } from "azure-devops-ui/Spinner";
import { showRootComponent } from "../../Common";
import { IProjectInfo } from "azure-devops-extension-api";
import { getBuildDefinitions, getBuildTimeline, getBuildsInProgress, getCurrentProject, getPipelineItems, getProjects } from "./build-release-hug-group-functions";
import { Build, BuildStatus, TimelineRecord } from "azure-devops-extension-api/Build";
import BuildTable from "../../Components/BuildTable/BuildTable";
import { IPipelineItem } from "../../Components/BuildTable/IPipelineItem";
import { ObservableValue, ReadyableObservableArray } from "azure-devops-ui/Core/Observable";
import { ArrayItemProvider } from "azure-devops-ui/Utilities/Provider";
import { IExtensionContext } from "azure-devops-extension-sdk";
import PipelineTable from "../../Components/PipelineTable/PIpelineTable";
import { PipelineTableType } from "../../Components/PipelineTable/PipelineTableType";
import { IHeaderCommandBarItem } from "azure-devops-ui/HeaderCommandBar";
import { Card } from "azure-devops-ui/Card";
import { Checkbox } from "azure-devops-ui/Checkbox";
import { defaultProject } from "./defaultProject";
import { IProjectInfoExtended } from "./IProjectInfoExtended";

interface IBuildHubGroup {
    context?: IExtensionContext;
    settings: IBuildHubGroupSettings;
    project: IProjectInfoExtended;
    organisation: string;
}

interface IBuildHubGroupSettings {
    autoRefresh: ObservableValue<boolean>,
    autoRefreshInterval: ObservableValue<number>,
    loading: boolean,
}

export const defaultProjectContext: IProjectInfo = {
    id: '',
    name: 'retrieving...',
};

class BuildHubGroup extends React.Component<{}, IBuildHubGroup> {   

    private timeout: NodeJS.Timeout | undefined;

    constructor(props: {}) {
        super(props);
        this.state = {             
            settings: {
                autoRefresh: new ObservableValue<boolean>(true),
                autoRefreshInterval: new ObservableValue<number>(5000), // 5 seconds
                loading: false,
            },
            project: defaultProject,             
            organisation: '',
            //projects: []
        };  
    }

    public componentDidMount() {        
        this.componentDidMountAsync().then(() => {})
    }

    private async componentDidMountAsync() {
        this.updateCommandBarItems();
        
        try {        
            console.log("Component did mount, initializing SDK...");
            
            await SDK.init();
            console.log("SDK is ready, loading project context...");
            
            await SDK.ready();            
            console.log("SDK is ready, loading project context...");
                        
            await this.loadProjectAsync();            
        } catch (error) {
            console.error("Error during SDK initialization or project context loading: ", error);
        }
    }

    private updateCommandBarItems() : void {
        /*
        LEAVING THIS IN COMMENTED OUT: 
        
        Whatever I do, I can't prevent a react error with the command bar items, 
        the classic 'Cannot update during an existing state transition' error.
        
        console.log('updateCommandBarItems start')

        this.commandBarItems.subscribe(s => {
            console.log(`commandBarItems updated ${JSON.stringify(s)}`);
        });
        */

        try {
            this.commandBarItems.push(
                {
                    id: "refresh",
                    text: "Refresh",            
                    onActivate: () => { this.loadProjectAsync() },
                    iconProps: {
                        iconName: 'Refresh'
                    },
                    isPrimary: true,
                    tooltipProps: {
                        text: "Open a panel with custom extension content"
                    }
                }
            );
        }
        catch(error){
            // do nothing
        }
        
        //console.log('updateCommandBarItems end')    
    }
    
    private updateAutoRefresh = (checked: boolean): void => {
        this.state.settings.autoRefresh.value = checked;
        if(checked){
            this.loadProjectAsync();            
            return;
        }
    
        if(this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = undefined;
        }
    }

    private commandBarItems = new ReadyableObservableArray<IHeaderCommandBarItem>();
    
    public render(): JSX.Element {        
        var result =  (
            <Page className="sample-hub flex-grow">
                <Header 
                    title={`${this.state.context?.extensionId} ${this.state.context?.version}`}
                    titleSize={TitleSize.Large}
                    commandBarItems={this.commandBarItems}                    
                        />                
                <div className="page-content">                    
                    <div className="webcontext-section">
                        
                        <h2>
                            {this.state.project.name}:
                        </h2>
                        
                        <Card                            
                            >
                            <Checkbox
                                onChange={(event, checked) => (this.updateAutoRefresh(checked))}
                                checked={this.state.settings.autoRefresh}
                                label="Auto Refresh builds Every 5 seconds"
                            />   
                            
                            <div style={{ minHeight: 40, marginLeft: 20 }}>                                                        
                                {(this.state.settings.loading) ? 
                                <Spinner 
                                    orientation={SpinnerOrientation.row} 
                                    size={SpinnerSize.large} 
                                    label="Refreshing...">                                
                                </Spinner>
                                : 
                                null
                                }                        
                            </div>
                        </Card>
                        
                        
                        <PipelineTable
                            projectName={this.state.project.name}
                            organisation={this.state.organisation}                        
                            itemProvider={this.state.project.pipelines}>                                
                                </PipelineTable>

                        <BuildTable 
                            projectName={this.state.project.name}
                            itemProvider={this.state.project.pipelineItems}
                                ></BuildTable>

                        <h2>Other projects:</h2>   
                        <BuildTable 
                            projectName="Other Projects"
                            itemProvider={this.state.project.otherPipelineItems}
                                ></BuildTable>                                                                                             
                    </div>
                </div>
            </Page>
        );        
        return result;
    }   

    private async loadProjectAsync(): Promise<void> {
        try {   
                  
            this.state.settings.loading = true;
            const host = await SDK.getHost();
            
            this.setState({ 
                settings: this.state.settings,
                organisation: host.name,
            });  

            const project: IProjectInfoExtended = 
                {
                    ...defaultProject,
                    ...((await getCurrentProject()) ?? defaultProjectContext),                     
                };
            
            const context = await SDK.getExtensionContext();            
           
            const buildDefinitions = (await getBuildDefinitions(project.id, 100))
                .map(m => {
                    var result: PipelineTableType = {
                        ...m
                    }

                    return result;
                });

            const top = 10;
            let allProjectBuilds = await getBuildsInProgress(
                project.id!, 
                50, 
                BuildStatus.All
            );    

            const branches = Array.from(
                new Set(
                    allProjectBuilds
                        .map(m => m.sourceBranch)
                        .filter(f => f)
                        .sort((a, b) => a.localeCompare(b))
            ));

            for(const build of buildDefinitions) {
                build.branches = branches;
            }
            
            project.builds = allProjectBuilds.slice(0, top);                       
            project.pipelines.value = new ArrayItemProvider(buildDefinitions);

            const pipelineItems: IPipelineItem[] = await getPipelineItems(project.builds, true);

            project.pipelineItems.value = new ArrayItemProvider(pipelineItems);
    
            var projects: IProjectInfoExtended[] = (await getProjects())
                .map(m => {                    
                    return {
                        ...defaultProject,
                        ...m, 
                    }
                });

            projects = projects.filter(p => p.id !== project.id);
     
            var builds: Build[] = [];   
            for(var item of projects){                
                if(item.id) {
                    item.builds = await getBuildsInProgress(item.id!, top);
                    builds = [...builds, ...item.builds];
                }                
            }           
            
            const otherPipelineItems = await getPipelineItems(builds, true);
            project.otherPipelineItems.value = new ArrayItemProvider(otherPipelineItems);
       
            this.setState({ 
                context: context,
                project: project, 
                //projects: projects,                     
            });            
               
            if(this.state.settings.autoRefresh.value) {
                var timeout: any = setTimeout(() => {
                    this.loadProjectAsync();
                }, this.state.settings.autoRefreshInterval.value);

                this.timeout = timeout;
            }

            await SDK.notifyLoadSucceeded();                                     
        } catch (error) {
            console.error("Failed to load project context: ", error);
                     
            await SDK.notifyLoadFailed("Failed to load project context: " + error);            
        }
        finally{
            this.state.settings.loading = false;            
            this.setState({ 
                settings: this.state.settings,                
            });  
        }
    } 
}

showRootComponent(<BuildHubGroup />);