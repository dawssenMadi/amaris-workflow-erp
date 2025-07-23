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
import BpmnJS from 'bpmn-js/lib/Modeler';

// Imports CSS officiels
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import '@bpmn-io/properties-panel/dist/assets/properties-panel.css';
import 'bpmn-js-token-simulation/assets/css/bpmn-js-token-simulation.css';

import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda.json';
import {
    BpmnPropertiesPanelModule,
    BpmnPropertiesProviderModule,
    CamundaPlatformPropertiesProviderModule
} from 'bpmn-js-properties-panel';
import tokenSimulation from 'bpmn-js-token-simulation';


// Interface pour typer le module de simulation
interface TokenSimulation {
    start(): void;
    reset(): void;
    pause(): void;
    resume(): void;
    trigger(elementId: string): void;
}

@Component({
    selector: 'app-modeler',
    imports: [CommonModule],
    templateUrl: './modeler.component.html',
    styleUrl: './modeler.component.scss'
})
export class ModelerComponent implements AfterViewInit, OnDestroy {
    private bpmnJS: BpmnJS;
    isPanelHidden = false;
    isSimulationActive = false;

    @ViewChild('ref', { static: true }) private el: ElementRef;
    @ViewChild('propertiesPanel', { static: true }) private propertiesPanel: ElementRef;
    @Output() private importDone: EventEmitter<any> = new EventEmitter();
    @Input() private url: string;

    constructor(private http: HttpClient, ) {}

    ngAfterViewInit(): void {
        this.initializeBpmnJS();
    }

    ngOnDestroy(): void {
        if (this.bpmnJS) {
            this.bpmnJS.destroy();
        }
    }

    private initializeBpmnJS(): void {
        this.bpmnJS = new BpmnJS({
            container: this.el.nativeElement,
            additionalModules: [
                BpmnPropertiesPanelModule,
                BpmnPropertiesProviderModule,
                CamundaPlatformPropertiesProviderModule,
                tokenSimulation
            ],
            moddleExtensions: {
                camunda: camundaModdleDescriptor
            },
            propertiesPanel: {
                parent: this.propertiesPanel.nativeElement
            }
        });

        this.bpmnJS.on('import.done', (event: any) => {
            if (!event.error) {
                const canvas = this.bpmnJS.get('canvas') as any;
                canvas.zoom('fit-viewport');
                this.importDone.emit();
            }
        });

        this.loadEmptyDiagram();
    }


    togglePanel(): void {
        this.isPanelHidden = !this.isPanelHidden;
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
                     xmlns:camunda="http://camunda.org/schema/1.0/bpmn"
                     targetNamespace="http://bpmn.io/schema/bpmn"
                     exporter="Camunda Modeler" exporterVersion="5.0.0">
          <process id="Process_1" isExecutable="true" camunda:versionTag="1.0">
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
}
