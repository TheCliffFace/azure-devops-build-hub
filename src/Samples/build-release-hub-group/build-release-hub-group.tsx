import * as React from "react";
import * as SDK from "azure-devops-extension-sdk";

import "./build-release-hub-group.scss";

import { Header, TitleSize } from "azure-devops-ui/Header";
import { Page } from "azure-devops-ui/Page";
import { Spinner, SpinnerOrientation, SpinnerSize } from "azure-devops-ui/Spinner";
import { showRootComponent } from "../../Common";
import { IProjectInfo } from "azure-devops-extension-api";
import { getBuildDefinitions, getBuildTimeline, getBuildsInProgress, getCurrentProject, getProjects } from "./build-release-hug-group-functions";
import { Build, BuildStatus, TimelineRecord } from "azure-devops-extension-api/Build";
import BuildTable from "../../Components/BuildTable/BuildTable";
import { IPipelineItem } from "../../Components/BuildTable/IPipelineItem";
import { ObservableValue } from "azure-devops-ui/Core/Observable";
import { ArrayItemProvider } from "azure-devops-ui/Utilities/Provider";
import { IExtensionContext } from "azure-devops-extension-sdk";
import PipelineTable from "../../Components/PipelineTable/PIpelineTable";
import { PipelineTableType } from "../../Components/PipelineTable/PipelineTableType";
import { IHeaderCommandBarItem } from "azure-devops-ui/HeaderCommandBar";
import { Card } from "azure-devops-ui/Card";
import { Checkbox } from "azure-devops-ui/Checkbox";

interface IBuildHubGroup {
    context?: IExtensionContext;
    settings: IBuildHubGroupSettings;
    project: IProjectInfoExtended;
    /*projects: IProjectInfoExtended[];    */
}

interface IBuildHubGroupSettings {
    autoRefresh: ObservableValue<boolean>,
    autoRefreshInterval: ObservableValue<number>,
    loading: boolean,
}

interface IProjectInfoExtended extends IProjectInfo {
    builds: Build[];
    pipelines: ObservableValue<ArrayItemProvider<PipelineTableType>>;
    pipelineItems: ObservableValue<ArrayItemProvider<IPipelineItem>>;
    otherPipelineItems: ObservableValue<ArrayItemProvider<IPipelineItem>>;
}

const defaultProjectContext: IProjectInfo = {
    id: '',
    name: 'retrieving...',
};

const defaultProject: IProjectInfoExtended = {
    ...defaultProjectContext,
    builds: [],
    pipelines: new ObservableValue<ArrayItemProvider<PipelineTableType>>(new ArrayItemProvider([])),
    pipelineItems: new ObservableValue<ArrayItemProvider<IPipelineItem>>(new ArrayItemProvider([])),
    otherPipelineItems: new ObservableValue<ArrayItemProvider<IPipelineItem>>(new ArrayItemProvider([])),
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
            //projects: []
        };  
    }

    public componentDidMount() {
        try {        
            console.log("Component did mount, initializing SDK...");
            
            SDK.init();
            
            SDK.ready().then(() => {
                console.log("SDK is ready, loading project context...");
                this.loadProjectContext();
            }).catch((error) => {
                console.error("SDK ready failed: ", error);
            });
        } catch (error) {
            console.error("Error during SDK initialization or project context loading: ", error);
        }
    }
    
    private commandBarItems: IHeaderCommandBarItem[] = [        
        {
            id: "refresh",
            text: "Refresh",
            onActivate: () => { this.loadProjectContext() },
            iconProps: {
            iconName: 'Refresh'
            },
            isPrimary: true,
            tooltipProps: {
            text: "Open a panel with custom extension content"
            }
        },/*
        {
            id: "messageDialog",
            text: "Message",
            onActivate: () => {  },
            tooltipProps: {
            text: "Open a simple message dialog"
            }
        },
        {
            id: "customDialog",
            text: "Custom Dialog",
            onActivate: () => { },
            tooltipProps: {
            text: "Open a dialog with custom extension content"
            }
        }*/
    ];
    
    private updateAutoRefresh = (checked: boolean): void => {
        this.state.settings.autoRefresh.value = checked;
        if(checked){
            this.loadProjectContext();            
            return;
        }
    
        if(this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = undefined;
        }
    }

    public render(): JSX.Element {
        return (
            <Page className="sample-hub flex-grow">
                <Header 
                    title={`Build Hub ${this.state.context?.version}`}
                    titleSize={TitleSize.Large}
                    commandBarItems={this.commandBarItems}
                    >
                </Header>                
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
    }   

    private async getPipelineItems(builds: Build[], getTimeline: boolean = false) {
        const pipelineItems: IPipelineItem[] = await Promise.all(builds.map(async m => {
            var stages: TimelineRecord[] = [];            
            if(getTimeline && m && m.id) {
                const timeline = await getBuildTimeline(m.project.id, m.id);
                stages = timeline
                    ?.records
                    ?.filter(f => f.type === "Stage") 
                    ?? [];                
            }                

            return {
                name: m.definition.name,
                status: m.status, 
                build: m,
                lastRunData: {                        
                    startTime: m.startTime,
                    endTime: m.finishTime,                                              
                },
                favorite: new ObservableValue(true),
                stages: stages,
            } as IPipelineItem;
        }));

        return pipelineItems;
    }

    private async loadProjectContext(): Promise<void> {
        try {         
            this.state.settings.loading = true;
            this.setState({ 
                settings: this.state.settings,
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

            const pipelineItems: IPipelineItem[] = await this.getPipelineItems(project.builds, true);

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
            
            const otherPipelineItems = await this.getPipelineItems(builds, true);
            project.otherPipelineItems.value = new ArrayItemProvider(otherPipelineItems);
       
            this.setState({ 
                context: context,
                project: project, 
                //projects: projects,                     
            });            
               
            if(this.state.settings.autoRefresh.value) {
                var timeout: any = setTimeout(() => {
                    this.loadProjectContext();
                }, this.state.settings.autoRefreshInterval.value);

                this.timeout = timeout;
            }

            SDK.notifyLoadSucceeded();                                     
        } catch (error) {
            console.error("Failed to load project context: ", error);
                     
            SDK.notifyLoadFailed("Failed to load project context: " + error);            
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