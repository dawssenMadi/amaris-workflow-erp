import {
    AfterViewInit,
    Component, ElementRef,
    EventEmitter,
    Input,
    OnDestroy,
    Output,
    ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import zeebeModdleDescriptor from 'zeebe-bpmn-moddle/resources/zeebe.json';
import {
    BpmnPropertiesPanelModule,
    BpmnPropertiesProviderModule,
    ZeebePropertiesProviderModule
} from 'bpmn-js-properties-panel';

import {
    CloudElementTemplatesPropertiesProviderModule
} from 'bpmn-js-element-templates';

// Import du module Create Append Anything
import {
    CreateAppendAnythingModule,
    CreateAppendElementTemplatesModule
} from 'bpmn-js-create-append-anything';

// Imports CSS officiels
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import '@bpmn-io/properties-panel/dist/assets/properties-panel.css';
import 'bpmn-js-token-simulation/assets/css/bpmn-js-token-simulation.css';
import '@bpmn-io/element-template-chooser/dist/element-template-chooser.css';

import tokenSimulation from 'bpmn-js-token-simulation';
import ElementTemplateChooserModule from '@bpmn-io/element-template-chooser';
import { AutoCompleteService } from '../service/modeler/auto-complete.service';
import { CamundaPropertiesService } from '../service/camunda/camunda-properties.service';
import { forkJoin } from 'rxjs';

// Interfaces pour typer les services bpmn-js
interface TokenSimulation {
    start(): void;
    reset(): void;
    pause(): void;
    resume(): void;
    trigger(elementId: string): void;
}

interface ElementTemplatesLoader {
    setTemplates(templates: any[]): void;
}

interface ElementTemplateChooser {
    open(element: any): Promise<any>;
}

interface Canvas {
    getGraphics(element: any): SVGElement;
    zoom(mode: string): void;
}

interface ElementRegistry {
    get(id: string): any;
    getAll(): any[];
    filter(fn: (element: any) => boolean): any[];
}

interface GraphicsFactory {
    create(type: string, element: any): any;
}

@Component({
    selector: 'app-modeler',
    imports: [CommonModule],
    templateUrl: './modeler.component.html',
    styleUrl: './modeler.component.scss'
})
export class ModelerComponent implements AfterViewInit, OnDestroy {
    private bpmnJS: BpmnModeler;
    isPanelHidden = true; // Panneau masqué par défaut pour un affichage propre
    isSimulationActive = false;
    isFullscreen = false; // Propriété pour gérer le mode plein écran
    private elementTemplates: any[] = [];

    @ViewChild('ref', { static: true }) private el: ElementRef;
    @ViewChild('propertiesPanel', { static: true }) private propertiesPanel: ElementRef;
    @ViewChild('fileInput', { static: true }) private fileInput: ElementRef;
    @Output() private importDone: EventEmitter<any> = new EventEmitter();
    @Input() private url: string;

    constructor(
        private http: HttpClient,
        private autoCompleteService: AutoCompleteService,
        private camundaPropertiesService: CamundaPropertiesService
    ) {}

    ngAfterViewInit(): void {
        this.loadConnectorTemplates().then(() => {
            this.initializeBpmnJS();
        });
    }

    ngOnDestroy(): void {
        if (this.bpmnJS) {
            this.bpmnJS.destroy();
        }
    }

    private async loadConnectorTemplates(): Promise<void> {
        console.log('🔄 Chargement des templates de connecteurs...');

        // Commencer avec les templates par défaut
        this.elementTemplates = [...this.getDefaultTemplates()];
        console.log('✅ Templates par défaut chargés:', this.elementTemplates.length);

        try {
            // Charger tous les fichiers JSON de connecteurs depuis assets/connectors
            const connectorFiles = [
                'assets/connectors/due-date.json',
                'assets/connectors/http-json-connector.json',
                'assets/connectors/slack-connector.json'
            ];

            const requests = connectorFiles.map(file =>
                this.http.get(file).toPromise().catch(error => {
                    console.warn(`⚠️ Impossible de charger ${file}:`, error.message);
                    return null;
                })
            );

            const loadedTemplates = await Promise.all(requests);

            // Traiter les templates chargés depuis les fichiers
            loadedTemplates.forEach((templates, index) => {
                if (templates && Array.isArray(templates)) {
                    // Si c'est un tableau de templates
                    templates.forEach(template => {
                        if (template && template.id) {
                            // Éviter les doublons en vérifiant l'ID
                            const existingIndex = this.elementTemplates.findIndex(t => t.id === template.id);
                            if (existingIndex >= 0) {
                                // Remplacer le template existant par la version du fichier
                                this.elementTemplates[existingIndex] = template;
                                console.log(`🔄 Template mis à jour depuis fichier: ${template.name}`);
                            } else {
                                // Ajouter le nouveau template
                                this.elementTemplates.push(template);
                                console.log(`➕ Nouveau template ajouté: ${template.name}`);
                            }
                        }
                    });
                } else if (templates && templates.id) {
                    const existingIndex = this.elementTemplates.findIndex(t => t.id === templates.id);
                    if (existingIndex >= 0) {
                        this.elementTemplates[existingIndex] = templates;
                        console.log(`🔄 Template mis à jour depuis fichier: ${templates.name}`);
                    } else {
                        this.elementTemplates.push(templates);
                        console.log(`➕ Nouveau template ajouté: ${templates.name}`);
                    }
                }
            });

            console.log('✅ Total des templates chargés:', this.elementTemplates.length);

            // Log détaillé des templates disponibles
            this.elementTemplates.forEach((template, index) => {
                console.log(`📋 ${index + 1}. ${template.name} (${template.id})`);
                console.log(`   📝 Description: ${template.description || 'Aucune'}`);
                console.log(`   🎯 S'applique à: ${template.appliesTo ? template.appliesTo.join(', ') : 'Non spécifié'}`);
                console.log(`   📂 Catégorie: ${template.category?.name || 'Aucune'}`);
            });

        } catch (error) {
            console.error('❌ Erreur lors du chargement des connecteurs depuis les fichiers:', error);
            console.log('📋 Utilisation des templates par défaut uniquement');
        }
    }

    private getDefaultTemplates(): any[] {
        return [
            {
                "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
                "name": "REST Connector",
                "id": "io.camunda.connectors.HttpJson.v2",
                "description": "Invoke REST API",
                "icon": {
                    "contents": "data:image/svg+xml;utf8,%3Csvg%20width%3D%2218%22%20height%3D%2218%22%20viewBox%3D%220%200%2018%2018%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%3Cpath%20d%3D%22M17.0335%208.99997C17.0335%2013.4475%2013.4281%2017.0529%208.98065%2017.0529C4.53316%2017.0529%200.927765%2013.4475%200.927765%208.99997C0.927765%204.55248%204.53316%200.947083%208.98065%200.947083C13.4281%200.947083%2017.0335%204.55248%2017.0335%208.99997Z%22%20fill%3D%22%23505562%22%2F%3E%0A%3Cpath%20d%3D%22M4.93126%2014.1571L6.78106%203.71471H10.1375C11.1917%203.71471%2011.9824%203.98323%2012.5095%204.52027C13.0465%205.04736%2013.315%205.73358%2013.315%206.57892C13.315%207.44414%2013.0714%208.15522%2012.5841%208.71215C12.1067%209.25913%2011.4553%209.63705%2010.6298%209.8459L12.0619%2014.1571H10.3315L9.03364%2010.0249H7.24351L6.51254%2014.1571H4.93126ZM7.49711%208.59281H9.24248C9.99832%208.59281%2010.5901%208.42374%2011.0177%208.08561C11.4553%207.73753%2011.6741%207.26513%2011.6741%206.66842C11.6741%206.19106%2011.5249%205.81811%2011.2265%205.54959C10.9282%205.27113%2010.4558%205.1319%209.80936%205.1319H8.10874L7.49711%208.59281Z%22%20fill%3D%22white%22%2F%3E%0A%3C%2Fsvg%3E%0A"
                },
                "category": {
                    "id": "connectors",
                    "name": "Connectors"
                },
                "appliesTo": ["bpmn:Task"],
                "elementType": {
                    "value": "bpmn:ServiceTask"
                },
                "groups": [
                    {
                        "id": "endpoint",
                        "label": "HTTP Endpoint"
                    },
                    {
                        "id": "authentication",
                        "label": "Authentication"
                    },
                    {
                        "id": "input",
                        "label": "Payload"
                    },
                    {
                        "id": "output",
                        "label": "Response Mapping"
                    }
                ],
                "properties": [
                    {
                        "type": "Hidden",
                        "value": "io.camunda:http-json:1",
                        "binding": {
                            "type": "zeebe:taskDefinition:type"
                        }
                    },
                    {
                        "label": "Method",
                        "id": "method",
                        "group": "endpoint",
                        "type": "Dropdown",
                        "value": "get",
                        "choices": [
                            { "name": "GET", "value": "get" },
                            { "name": "POST", "value": "post" },
                            { "name": "PUT", "value": "put" },
                            { "name": "DELETE", "value": "delete" },
                            { "name": "PATCH", "value": "patch" }
                        ],
                        "binding": {
                            "type": "zeebe:input",
                            "name": "method"
                        }
                    },
                    {
                        "label": "URL",
                        "id": "url",
                        "group": "endpoint",
                        "type": "String",
                        "feel": "optional",
                        "binding": {
                            "type": "zeebe:input",
                            "name": "url"
                        },
                        "constraints": {
                            "notEmpty": true
                        }
                    },
                    {
                        "label": "Request Body",
                        "id": "body",
                        "group": "input",
                        "type": "String",
                        "feel": "optional",
                        "binding": {
                            "type": "zeebe:input",
                            "name": "body"
                        }
                    }
                ]
            },
            // SendGrid Email Connector
            {
                "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
                "name": "SendGrid Connector",
                "id": "io.camunda.connectors.SendGrid.v2",
                "description": "Send emails via SendGrid",
                "icon": {
                    "contents": "data:image/svg+xml;utf8,%3Csvg%20width%3D%2218%22%20height%3D%2218%22%20viewBox%3D%220%200%2018%2018%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%3Cpath%20d%3D%22M17.0335%208.99997C17.0335%2013.4475%2013.4281%2017.0529%208.98065%2017.0529C4.53316%2017.0529%200.927765%2013.4475%200.927765%208.99997C0.927765%204.55248%204.53316%200.947083%208.98065%200.947083C13.4281%200.947083%2017.0335%204.55248%2017.0335%208.99997Z%22%20fill%3D%22%2399E1F4%22%2F%3E%0A%3Cpath%20d%3D%22M4.93126%2014.1571L6.78106%203.71471H10.1375C11.1917%203.71471%2011.9824%203.98323%2012.5095%204.52027C13.0465%205.04736%2013.315%205.73358%2013.315%206.57892C13.315%207.44414%2013.0714%208.15522%2012.5841%208.71215C12.1067%209.25913%2011.4553%209.63705%2010.6298%209.8459L12.0619%2014.1571H10.3315L9.03364%2010.0249H7.24351L6.51254%2014.1571H4.93126ZM7.49711%208.59281H9.24248C9.99832%208.59281%2010.5901%208.42374%2011.0177%208.08561C11.4553%207.73753%2011.6741%207.26513%2011.6741%206.66842C11.6741%206.19106%2011.5249%205.81811%2011.2265%205.54959C10.9282%205.27113%2010.4558%205.1319%209.80936%205.1319H8.10874L7.49711%208.59281Z%22%20fill%3D%22white%22%2F%3E%0A%3C%2Fsvg%3E%0A"
                },
                "category": {
                    "id": "connectors",
                    "name": "Connectors"
                },
                "appliesTo": ["bpmn:Task"],
                "elementType": {
                    "value": "bpmn:ServiceTask"
                },
                "groups": [
                    {
                        "id": "authentication",
                        "label": "Authentication"
                    },
                    {
                        "id": "content",
                        "label": "Email Content"
                    }
                ],
                "properties": [
                    {
                        "type": "Hidden",
                        "value": "io.camunda:sendgrid:1",
                        "binding": {
                            "type": "zeebe:taskDefinition:type"
                        }
                    },
                    {
                        "label": "API Key",
                        "id": "apiKey",
                        "group": "authentication",
                        "type": "String",
                        "feel": "optional",
                        "binding": {
                            "type": "zeebe:input",
                            "name": "apiKey"
                        },
                        "constraints": {
                            "notEmpty": true
                        }
                    },
                    {
                        "label": "From",
                        "id": "from",
                        "group": "content",
                        "type": "String",
                        "feel": "optional",
                        "binding": {
                            "type": "zeebe:input",
                            "name": "from"
                        },
                        "constraints": {
                            "notEmpty": true
                        }
                    },
                    {
                        "label": "To",
                        "id": "to",
                        "group": "content",
                        "type": "String",
                        "feel": "optional",
                        "binding": {
                            "type": "zeebe:input",
                            "name": "to"
                        },
                        "constraints": {
                            "notEmpty": true
                        }
                    },
                    {
                        "label": "Subject",
                        "id": "subject",
                        "group": "content",
                        "type": "String",
                        "feel": "optional",
                        "binding": {
                            "type": "zeebe:input",
                            "name": "subject"
                        }
                    },
                    {
                        "label": "Content",
                        "id": "content",
                        "group": "content",
                        "type": "Text",
                        "feel": "optional",
                        "binding": {
                            "type": "zeebe:input",
                            "name": "content"
                        }
                    }
                ]
            },
            // Slack Connector
            {
                "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
                "name": "Slack Connector",
                "id": "io.camunda.connectors.Slack.v1",
                "description": "Send messages to Slack",
                "icon": {
                    "contents": "data:image/svg+xml;utf8,%3Csvg%20width%3D%2218%22%20height%3D%2218%22%20viewBox%3D%220%200%2018%2018%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%3Cpath%20d%3D%22M17.0335%208.99997C17.0335%2013.4475%2013.4281%2017.0529%208.98065%2017.0529C4.53316%2017.0529%200.927765%2013.4475%200.927765%208.99997C0.927765%204.55248%204.53316%200.947083%208.98065%200.947083C13.4281%200.947083%2017.0335%204.55248%2017.0335%208.99997Z%22%20fill%3D%22%234A154B%22%2F%3E%0A%3Cpath%20d%3D%22M4.93126%2014.1571L6.78106%203.71471H10.1375C11.1917%203.71471%2011.9824%203.98323%2012.5095%204.52027C13.0465%205.04736%2013.315%205.73358%2013.315%206.57892C13.315%207.44414%2013.0714%208.15522%2012.5841%208.71215C12.1067%209.25913%2011.4553%209.63705%2010.6298%209.8459L12.0619%2014.1571H10.3315L9.03364%2010.0249H7.24351L6.51254%2014.1571H4.93126ZM7.49711%208.59281H9.24248C9.99832%208.59281%2010.5901%208.42374%2011.0177%208.08561C11.4553%207.73753%2011.6741%207.26513%2011.6741%206.66842C11.6741%206.19106%2011.5249%205.81811%2011.2265%205.54959C10.9282%205.27113%2010.4558%205.1319%209.80936%205.1319H8.10874L7.49711%208.59281Z%22%20fill%3D%22white%22%2F%3E%0A%3C%2Fsvg%3E%0A"
                },
                "category": {
                    "id": "connectors",
                    "name": "Connectors"
                },
                "appliesTo": ["bpmn:Task"],
                "elementType": {
                    "value": "bpmn:ServiceTask"
                },
                "groups": [
                    {
                        "id": "authentication",
                        "label": "Authentication"
                    },
                    {
                        "id": "message",
                        "label": "Message"
                    }
                ],
                "properties": [
                    {
                        "type": "Hidden",
                        "value": "io.camunda:slack:1",
                        "binding": {
                            "type": "zeebe:taskDefinition:type"
                        }
                    },
                    {
                        "label": "OAuth Token",
                        "id": "token",
                        "group": "authentication",
                        "type": "String",
                        "feel": "optional",
                        "binding": {
                            "type": "zeebe:input",
                            "name": "token"
                        },
                        "constraints": {
                            "notEmpty": true
                        }
                    },
                    {
                        "label": "Channel",
                        "id": "channel",
                        "group": "message",
                        "type": "String",
                        "feel": "optional",
                        "binding": {
                            "type": "zeebe:input",
                            "name": "channel"
                        },
                        "constraints": {
                            "notEmpty": true
                        }
                    },
                    {
                        "label": "Text",
                        "id": "text",
                        "group": "message",
                        "type": "Text",
                        "feel": "optional",
                        "binding": {
                            "type": "zeebe:input",
                            "name": "text"
                        },
                        "constraints": {
                            "notEmpty": true
                        }
                    }
                ]
            },
            // GraphQL Connector
            {
                "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
                "name": "GraphQL Connector",
                "id": "io.camunda.connectors.GraphQL.v1",
                "description": "Execute GraphQL queries",
                "icon": {
                    "contents": "data:image/svg+xml;utf8,%3Csvg%20width%3D%2218%22%20height%3D%2218%22%20viewBox%3D%220%200%2018%2018%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%3Cpath%20d%3D%22M17.0335%208.99997C17.0335%2013.4475%2013.4281%2017.0529%208.98065%2017.0529C4.53316%2017.0529%200.927765%2013.4475%200.927765%208.99997C0.927765%204.55248%204.53316%200.947083%208.98065%200.947083C13.4281%200.947083%2017.0335%204.55248%2017.0335%208.99997Z%22%20fill%3D%22%23E10098%22%2F%3E%0A%3Cpath%20d%3D%22M4.93126%2014.1571L6.78106%203.71471H10.1375C11.1917%203.71471%2011.9824%203.98323%2012.5095%204.52027C13.0465%205.04736%2013.315%205.73358%2013.315%206.57892C13.315%207.44414%2013.0714%208.15522%2012.5841%208.71215C12.1067%209.25913%2011.4553%209.63705%2010.6298%209.8459L12.0619%2014.1571H10.3315L9.03364%2010.0249H7.24351L6.51254%2014.1571H4.93126ZM7.49711%208.59281H9.24248C9.99832%208.59281%2010.5901%208.42374%2011.0177%208.08561C11.4553%207.73753%2011.6741%207.26513%2011.6741%206.66842C11.6741%206.19106%2011.5249%205.81811%2011.2265%205.54959C10.9282%205.27113%2010.4558%205.1319%209.80936%205.1319H8.10874L7.49711%208.59281Z%22%20fill%3D%22white%22%2F%3E%0A%3C%2Fsvg%3E%0A"
                },
                "category": {
                    "id": "connectors",
                    "name": "Connectors"
                },
                "appliesTo": ["bpmn:Task"],
                "elementType": {
                    "value": "bpmn:ServiceTask"
                },
                "groups": [
                    {
                        "id": "endpoint",
                        "label": "GraphQL Endpoint"
                    },
                    {
                        "id": "query",
                        "label": "Query"
                    }
                ],
                "properties": [
                    {
                        "type": "Hidden",
                        "value": "io.camunda:graphql:1",
                        "binding": {
                            "type": "zeebe:taskDefinition:type"
                        }
                    },
                    {
                        "label": "URL",
                        "id": "url",
                        "group": "endpoint",
                        "type": "String",
                        "feel": "optional",
                        "binding": {
                            "type": "zeebe:input",
                            "name": "url"
                        },
                        "constraints": {
                            "notEmpty": true
                        }
                    },
                    {
                        "label": "Query",
                        "id": "query",
                        "group": "query",
                        "type": "Text",
                        "feel": "optional",
                        "binding": {
                            "type": "zeebe:input",
                            "name": "query"
                        },
                        "constraints": {
                            "notEmpty": true
                        }
                    }
                ]
            },
            // Webhook Connector
            {
                "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
                "name": "Webhook Connector",
                "id": "io.camunda.connectors.webhook.WebhookConnectorIntermediate.v1",
                "description": "Configure webhook to receive callbacks",
                "icon": {
                    "contents": "data:image/svg+xml;utf8,%3Csvg%20width%3D%2218%22%20height%3D%2218%22%20viewBox%3D%220%200%2018%2018%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%3Cpath%20d%3D%22M17.0335%208.99997C17.0335%2013.4475%2013.4281%2017.0529%208.98065%2017.0529C4.53316%2017.0529%200.927765%2013.4475%200.927765%208.99997C0.927765%204.55248%204.53316%200.947083%208.98065%200.947083C13.4281%200.947083%2017.0335%204.55248%2017.0335%208.99997Z%22%20fill%3D%22%23FF6D00%22%2F%3E%0A%3Cpath%20d%3D%22M4.93126%2014.1571L6.78106%203.71471H10.1375C11.1917%203.71471%2011.9824%203.98323%2012.5095%204.52027C13.0465%205.04736%2013.315%205.73358%2013.315%206.57892C13.315%207.44414%2013.0714%208.15522%2012.5841%208.71215C12.1067%209.25913%2011.4553%209.63705%2010.6298%209.8459L12.0619%2014.1571H10.3315L9.03364%2010.0249H7.24351L6.51254%2014.1571H4.93126ZM7.49711%208.59281H9.24248C9.99832%208.59281%2010.5901%208.42374%2011.0177%208.08561C11.4553%207.73753%2011.6741%207.26513%2011.6741%206.66842C11.6741%206.19106%2011.5249%205.81811%2011.2265%205.54959C10.9282%205.27113%2010.4558%205.1319%209.80936%205.1319H8.10874L7.49711%208.59281Z%22%20fill%3D%22white%22%2F%3E%0A%3C%2Fsvg%3E%0A"
                },
                "category": {
                    "id": "connectors",
                    "name": "Connectors"
                },
                "appliesTo": ["bpmn:IntermediateCatchEvent"],
                "elementType": {
                    "value": "bpmn:IntermediateCatchEvent",
                    "eventDefinition": "bpmn:MessageEventDefinition"
                },
                "groups": [
                    {
                        "id": "webhook",
                        "label": "Webhook Configuration"
                    }
                ],
                "properties": [
                    {
                        "type": "Hidden",
                        "value": "io.camunda:webhook:1",
                        "binding": {
                            "type": "zeebe:taskDefinition:type"
                        }
                    },
                    {
                        "label": "Webhook ID",
                        "id": "inbound.context",
                        "group": "webhook",
                        "type": "String",
                        "description": "The webhook ID is a part of the URL",
                        "binding": {
                            "type": "zeebe:property",
                            "name": "inbound.context"
                        },
                        "constraints": {
                            "notEmpty": true
                        }
                    }
                ]
            }
        ];
    }

    private async initializeBpmnJS(): Promise<void> {
        this.bpmnJS = new BpmnModeler({
            container: this.el.nativeElement,
            additionalModules: [
                BpmnPropertiesPanelModule,
                BpmnPropertiesProviderModule,
                ZeebePropertiesProviderModule,
                CloudElementTemplatesPropertiesProviderModule,
                ElementTemplateChooserModule,
                CreateAppendAnythingModule,        // Module principal
                CreateAppendElementTemplatesModule, // Module pour les templates
                tokenSimulation
            ],
            moddleExtensions: {
                zeebe: zeebeModdleDescriptor,
            },
            propertiesPanel: {
                parent: this.propertiesPanel.nativeElement
            }
        });

        this.bpmnJS.on('elementTemplates.errors', (event: any) => {
            const { errors } = event;
            console.error('❌ Element template errors:', errors);

            errors.forEach((error: any, index: number) => {
                console.error(`Erreur ${index + 1}:`, error.message);
                if (error.element) {
                    console.error('Template concerné:', error.element.name || error.element.id);
                }
            });
        });

        // Charger les templates depuis les fichiers JSON
        const elementTemplatesLoader = this.bpmnJS.get('elementTemplatesLoader') as ElementTemplatesLoader;
        elementTemplatesLoader.setTemplates(this.elementTemplates);

        console.log('🔧 Templates configurés dans le modeler:', this.elementTemplates.length);

        try {
            const elementTemplateChooser = this.bpmnJS.get('elementTemplateChooser') as ElementTemplateChooser;
            console.log('✅ Element Template Chooser initialisé et prêt');
            console.log('🔧 Pour utiliser la clé à molette:');
            console.log('   1. Créez ou sélectionnez une tâche (Task)');
            console.log('   2. Cliquez sur l\'icône de clé à molette dans le panneau de propriétés');
            console.log('   3. Choisissez parmi les connecteurs disponibles');
        } catch (error) {
            console.error('❌ Element Template Chooser non disponible:', error);
        }

        this.loadEmptyDiagram();

        this.bpmnJS.on('import.done', (event: any) => {
            if (!event.error) {
                const canvas = this.bpmnJS.get('canvas') as any;
                canvas.zoom('fit-viewport');

                console.log('✅ Modeler initialisé avec les fonctionnalités:');
                console.log('📋 Element Templates: ' + this.elementTemplates.length + ' connecteurs chargés');
                console.log('🎨 Create Append Anything: Navigation étendue activée');
                console.log('🎯 Raccourcis clavier:');
                console.log('  - N: Ouvrir le menu de création');
                console.log('  - A: Ouvrir le menu d\'ajout depuis un élément sélectionné');
                console.log('🔧 Element Template Chooser: Sélection de templates activée');

                this.importDone.emit();
            }
        });

        const eventBus: any = this.bpmnJS.get('eventBus');

        // Monitor les événements de templates
        eventBus.on('elementTemplates.applied', (event: any) => {
            console.log('✅ Template appliqué:', event.element.id, '→', event.newTemplate.name);

            // Ajouter l'icône du template à l'élément
            this.addTemplateIconToElement(event.element, event.newTemplate);
        });

        eventBus.on('elementTemplates.removed', (event: any) => {
            console.log('🗑️ Template supprimé de:', event.element.id);

            // Supprimer l'icône du template
            this.removeTemplateIconFromElement(event.element);
        });

        // Monitor les événements de création/ajout
        eventBus.on('create.start', (event: any) => {
            console.log('🎨 Début de création d\'élément:', event);
        });

        eventBus.on('create.end', (event: any) => {
            console.log('✅ Élément créé:', event.shape?.type || 'unknown');
        });

        eventBus.on('shape.added', (event: any) => {
            console.log('➕ Forme ajoutée:', event.element.type, event.element.id);
        });

        // Monitor all text-related events
        eventBus.on('directEditing.activate', (event: any) => {
            console.log('Started editing:', event.element);

            const textbox = document.querySelector('.djs-direct-editing-content');
            if (textbox) {
                textbox.addEventListener('input', (inputEvent: any) => {
                    const currentText = (inputEvent.target as HTMLElement).textContent || '';
                    console.log('Real-time text:', currentText);

                    if (currentText.length >= 2) {
                        this.autoCompleteService.getSuggestions(currentText).subscribe(suggestions => {
                            this.showAutoComplete(suggestions, inputEvent.target);
                        });
                    } else {
                        this.hideAutoComplete();
                    }
                });
            }
        });

        eventBus.on('directEditing.complete', (event: any) => {
            console.log('Finished editing. Final text:', event.newLabel);
        });

        eventBus.on('commandStack.element.updateLabel.executed', (event: any) => {
            console.log('Label updated:', event.context.newLabel);
        });

        eventBus.on('element.click', (event: any) => {
            this.handleElementSelection(event.element);
        });

        eventBus.on('keyboard.keydown', (event: any) => {
            if (event.keyEvent.key === 'n' || event.keyEvent.key === 'N') {
                console.log('🔥 Raccourci N détecté - Menu de création ouvert');
            }
            if (event.keyEvent.key === 'a' || event.keyEvent.key === 'A') {
                console.log('🔥 Raccourci A détecté - Menu d\'ajout ouvert');
            }
        });
    }

    async openTemplateChooser(element: any): Promise<void> {
        try {
            const elementTemplateChooser = this.bpmnJS.get('elementTemplateChooser') as ElementTemplateChooser;
            const template = await elementTemplateChooser.open(element);
            console.log('✅ Template sélectionné:', template);
        } catch (error) {
            console.log('❌ Template chooser fermé sans sélection');
        }
    }

    async reloadConnectorTemplates(): Promise<void> {
        await this.loadConnectorTemplates();
        if (this.bpmnJS) {
            const elementTemplatesLoader = this.bpmnJS.get('elementTemplatesLoader') as ElementTemplatesLoader;
            elementTemplatesLoader.setTemplates(this.elementTemplates);
            console.log('🔄 Templates rechargés:', this.elementTemplates.length);
        }
    }

    listAvailableTemplates(): void {
        console.log('📋 Templates disponibles:');
        this.elementTemplates.forEach((template, index) => {
            console.log(`${index + 1}. ${template.name} (${template.id})`);
            console.log(`   Description: ${template.description || 'Aucune description'}`);
            console.log(`   Version: ${template.version || 'Non spécifiée'}`);
            console.log(`   Catégorie: ${template.category?.name || 'Aucune catégorie'}`);
            console.log('---');
        });
    }

    demonstrateCreateAppendFeatures(): void {
        console.log('🚀 Fonctionnalités Create Append Anything disponibles:');
        console.log('1. Palette étendue - Créez n\'importe quel élément BPMN depuis la palette');
        console.log('2. Menu contextuel étendu - Clic droit sur un élément pour voir toutes les options d\'ajout');
        console.log('3. Raccourcis clavier:');
        console.log('   - Appuyez sur "N" pour ouvrir le menu de création global');
        console.log('   - Sélectionnez un élément et appuyez sur "A" pour ouvrir le menu d\'ajout');
        console.log('4. Intégration avec les Element Templates:');
        this.elementTemplates.forEach(template => {
            console.log(`   - ${template.name}: ${template.description}`);
        });
    }

    private handleElementSelection(element: any): void {
        const elementType = element.type;
        const properties = this.camundaPropertiesService.getElementProperties(elementType);

        this.showPropertiesPanel(element, properties);

        // Log des possibilités d'ajout pour l'élément sélectionné
        console.log(`🎯 Élément sélectionné: ${elementType}`);
        console.log('💡 Astuce: Appuyez sur "A" pour voir tous les éléments que vous pouvez ajouter à cet élément');

        // Afficher les templates applicables à cet élément
        const applicableTemplates = this.elementTemplates.filter(template =>
            template.appliesTo && template.appliesTo.includes(elementType)
        );

        if (applicableTemplates.length > 0) {
            console.log('🔧 Templates applicables à cet élément:');
            applicableTemplates.forEach(template => {
                console.log(`  - ${template.name}: ${template.description}`);
            });
        }
    }

    private showPropertiesPanel(element: any, properties: any[]): void {
        console.log('Element sélectionné:', element.type, element.id);
        console.log('Propriétés disponibles:', properties);

        if (properties.length > 0) {
            console.log('Configuration des propriétés pour:', element.type);
            properties.forEach(prop => {
                console.log(`- ${prop.name} (${prop.type}):`, prop.placeholder || prop.default || '');
            });
        }
    }

    private showAutoComplete(suggestions: string[], target: HTMLElement): void {
        this.hideAutoComplete();

        if (suggestions.length === 0) return;

        const dropdown = document.createElement('div');
        dropdown.className = 'autocomplete-dropdown';

        // Utiliser un z-index dynamique selon le mode plein écran
        const zIndexValue = this.isFullscreen ? '200000' : '1000';

        dropdown.style.cssText = `
            position: absolute;
            background: white;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            max-height: 150px;
            overflow-y: auto;
            z-index: ${zIndexValue};
            min-width: 150px;
        `;

        suggestions.forEach(suggestion => {
            const item = document.createElement('div');
            item.textContent = suggestion;
            item.style.cssText = `
                padding: 8px 12px;
                cursor: pointer;
                border-bottom: 1px solid #eee;
            `;

            item.addEventListener('mouseenter', () => {
                item.style.backgroundColor = '#f0f0f0';
            });

            item.addEventListener('mouseleave', () => {
                item.style.backgroundColor = 'white';
            });

            item.addEventListener('click', () => {
                target.textContent = suggestion;
                this.hideAutoComplete();
            });

            dropdown.appendChild(item);
        });

        const rect = target.getBoundingClientRect();
        dropdown.style.left = rect.left + 'px';
        dropdown.style.top = (rect.bottom + 5) + 'px';

        document.body.appendChild(dropdown);
    }

    private hideAutoComplete(): void {
        const existing = document.querySelector('.autocomplete-dropdown');
        if (existing) {
            existing.remove();
        }
    }

    togglePanel(): void {
        this.isPanelHidden = !this.isPanelHidden;
    }

    // Nouvelle méthode pour montrer les fonctionnalités
    showCreateAppendHelp(): void {
        this.demonstrateCreateAppendFeatures();
        this.listAvailableTemplates();
    }

    toggleSimulation(): void {
        const tokenSimulation = this.bpmnJS.get('tokenSimulation') as TokenSimulation;

        if (this.isSimulationActive) {
            tokenSimulation.reset();
            this.isSimulationActive = false;
        } else {
            tokenSimulation.start();
            this.isSimulationActive = true;
        }
    }

    resetSimulation(): void {
        const tokenSimulation = this.bpmnJS.get('tokenSimulation') as TokenSimulation;
        tokenSimulation.reset();
        this.isSimulationActive = false;
    }

    pauseSimulation(): void {
        const tokenSimulation = this.bpmnJS.get('tokenSimulation') as TokenSimulation;
        if (this.isSimulationActive) {
            tokenSimulation.pause();
        }
    }

    resumeSimulation(): void {
        const tokenSimulation = this.bpmnJS.get('tokenSimulation') as TokenSimulation;
        if (this.isSimulationActive) {
            tokenSimulation.resume();
        }
    }

    private loadEmptyDiagram(): void {
        const emptyBpmn = `<?xml version="1.0" encoding="UTF-8"?>
        <definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL"
                     xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
                     xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
                     xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
                     xmlns:zeebe="http://camunda.org/schema/zeebe/1.0"
                     targetNamespace="http://bpmn.io/schema/bpmn"
                     exporter="Camunda Modeler" exporterVersion="5.0.0">
          <process id="Process_1" isExecutable="true">
            <startEvent id="StartEvent_1"/>
          </process>
          <bpmndi:BPMNDiagram id="BPMNDiagram_1">
            <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
              <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
                <dc:Bounds x="179" y="99" width="36" height="36"/>
              </bpmndi:BPMNShape>
            </bpmndi:BPMNPlane>
          </bpmndi:BPMNDiagram>
        </definitions>`;

        this.bpmnJS.importXML(emptyBpmn);
    }

    private addTemplateIconToElement(element: any, template: any): void {
        try {
            console.log('🎨 Ajout de l\'icône du template:', template.name, 'à l\'élément:', element.id);

            // Obtenir l'élément graphique dans le SVG avec le bon typage
            const canvas = this.bpmnJS.get('canvas') as Canvas;

            // Trouver l'élément graphique correspondant
            const gfx = canvas.getGraphics(element);
            if (!gfx) {
                console.warn('⚠️ Élément graphique non trouvé pour:', element.id);
                return;
            }

            // Supprimer l'ancienne icône si elle existe
            this.removeTemplateIconFromElement(element);

            if (template.icon && template.icon.contents) {
                // Créer un nouvel élément SVG pour l'icône
                const iconGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                iconGroup.classList.add('template-icon');
                iconGroup.setAttribute('data-element-id', element.id);

                // Positionner l'icône dans le coin supérieur droit de l'élément
                const bounds = element.width && element.height ?
                    { width: element.width, height: element.height } :
                    { width: 100, height: 80 }; // Taille par défaut pour les tâches

                const iconSize = 18;
                const iconX = bounds.width - iconSize - 2;
                const iconY = 2;

                iconGroup.setAttribute('transform', `translate(${iconX}, ${iconY})`);

                // Créer un cercle de fond pour l'icône avec conversion en string
                const iconBackground = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                iconBackground.setAttribute('cx', (iconSize / 2).toString());
                iconBackground.setAttribute('cy', (iconSize / 2).toString());
                iconBackground.setAttribute('r', (iconSize / 2).toString());
                iconBackground.setAttribute('fill', 'white');
                iconBackground.setAttribute('stroke', '#ddd');
                iconBackground.setAttribute('stroke-width', '1');
                iconBackground.setAttribute('opacity', '0.9');

                // Décoder l'icône SVG du template
                const decodedIcon = decodeURIComponent(template.icon.contents.replace('data:image/svg+xml;utf8,', ''));

                // Créer un conteneur pour l'icône décodée
                const iconContainer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                iconContainer.setAttribute('transform', `scale(1)`);
                iconContainer.innerHTML = decodedIcon;

                // Ajouter les éléments au groupe d'icône
                iconGroup.appendChild(iconBackground);
                iconGroup.appendChild(iconContainer);

                // Ajouter l'icône à l'élément graphique
                gfx.appendChild(iconGroup);

                console.log('✅ Icône ajoutée avec succès à l\'élément:', element.id);
            }
        } catch (error) {
            console.error('❌ Erreur lors de l\'ajout de l\'icône:', error);
        }
    }

    private removeTemplateIconFromElement(element: any): void {
        try {
            console.log('🗑️ Suppression de l\'icône de l\'élément:', element.id);

            const canvas = this.bpmnJS.get('canvas') as Canvas;
            const gfx = canvas.getGraphics(element);

            if (gfx) {
                // Supprimer toutes les icônes existantes pour cet élément
                const existingIcons = gfx.querySelectorAll(`.template-icon[data-element-id="${element.id}"]`);
                existingIcons.forEach(icon => icon.remove());

                console.log('✅ Icône supprimée de l\'élément:', element.id);
            }
        } catch (error) {
            console.error('❌ Erreur lors de la suppression de l\'icône:', error);
        }
    }

    // Méthodes pour la gestion des fichiers BPMN

    /**
     * Déclencher l'ouverture du sélecteur de fichier
     */
    triggerFileUpload(): void {
        this.fileInput.nativeElement.click();
    }

    /**
     * Gérer la sélection d'un fichier BPMN
     */
    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];

        if (!file) {
            return;
        }

        console.log('📂 Fichier sélectionné:', file.name);

        // Vérifier le type de fichier
        if (!file.name.toLowerCase().endsWith('.bpmn') && !file.name.toLowerCase().endsWith('.xml')) {
            alert('⚠️ Veuillez sélectionner un fichier .bpmn ou .xml');
            return;
        }

        // Lire le contenu du fichier
        const reader = new FileReader();
        reader.onload = (e) => {
            const bpmnXML = e.target?.result as string;
            this.importBpmnDiagram(bpmnXML, file.name);
        };

        reader.onerror = () => {
            console.error('❌ Erreur lors de la lecture du fichier');
            alert('❌ Erreur lors de la lecture du fichier');
        };

        reader.readAsText(file);

        // Réinitialiser l'input pour permettre de sélectionner le même fichier à nouveau
        input.value = '';
    }

    /**
     * Importer un diagramme BPMN depuis le XML
     */
    private async importBpmnDiagram(bpmnXML: string, filename: string): Promise<void> {
        try {
            console.log('📥 Import du diagramme:', filename);

            await this.bpmnJS.importXML(bpmnXML);

            // Ajuster la vue
            const canvas = this.bpmnJS.get('canvas') as Canvas;
            canvas.zoom('fit-viewport');

            console.log('✅ Diagramme importé avec succès:', filename);

            // Recharger les icônes des templates si nécessaire
            this.reapplyTemplateIcons();


        } catch (error: any) {
            console.error('❌ Erreur lors de l\'import du diagramme:', error);

            let errorMessage = 'Erreur lors de l\'import du diagramme BPMN.';
            if (error.message) {
                errorMessage += `\n\nDétails: ${error.message}`;
            }

            alert(`❌ ${errorMessage}`);
        }
    }

    /**
     * Télécharger le diagramme BPMN actuel
     */
    async downloadDiagram(): Promise<void> {
        try {
            const result = await this.bpmnJS.saveXML({ format: true });
            const bpmnXML = result.xml;

            // Créer un nom de fichier avec horodatage
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            const filename = `diagramme-bpmn-${timestamp}.bpmn`;

            // Créer et déclencher le téléchargement
            const blob = new Blob([bpmnXML], { type: 'application/xml' });
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.style.display = 'none';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            window.URL.revokeObjectURL(url);

            console.log('💾 Diagramme téléchargé:', filename);

        } catch (error) {
            console.error('❌ Erreur lors du téléchargement:', error);
            alert('❌ Erreur lors du téléchargement du diagramme');
        }
    }

    /**
     * Créer un nouveau diagramme vide
     */
    createNewDiagram(): void {
        const confirmNew = confirm('⚠️ Créer un nouveau diagramme effacera le diagramme actuel.\n\nVoulez-vous continuer ?');

        if (confirmNew) {
            this.loadEmptyDiagram();
            console.log('📄 Nouveau diagramme créé');
        }
    }

    /**
     * Réappliquer les icônes des templates après import
     */
    private reapplyTemplateIcons(): void {
        try {
            const elementRegistry = this.bpmnJS.get('elementRegistry') as ElementRegistry;
            const elements = elementRegistry.getAll();

            elements.forEach(element => {
                // Vérifier si l'élément a un template appliqué
                const businessObject = element.businessObject;
                if (businessObject && businessObject.$attrs && businessObject.$attrs['zeebe:modelerTemplate']) {
                    const templateId = businessObject.$attrs['zeebe:modelerTemplate'];
                    const template = this.elementTemplates.find(t => t.id === templateId);

                    if (template) {
                        console.log('🔄 Réapplication de l\'icône pour:', element.id, '→', template.name);
                        this.addTemplateIconToElement(element, template);
                    }
                }
            });
        } catch (error) {
            console.error('❌ Erreur lors de la réapplication des icônes:', error);
        }
    }

    /**
     * Basculer entre le mode normal et le mode plein écran
     */
    toggleFullscreen(): void {
        this.isFullscreen = !this.isFullscreen;

        if (this.isFullscreen) {
            console.log('🖥️ Passage en mode plein écran');
        } else {
            console.log('🔙 Retour au mode normal');
        }

        // Ajuster la vue du modeler après le changement de mode
        setTimeout(() => {
            if (this.bpmnJS) {
                const canvas = this.bpmnJS.get('canvas') as Canvas;
                canvas.zoom('fit-viewport');
            }
        }, 300); // Délai pour permettre la transition CSS
    }
}
