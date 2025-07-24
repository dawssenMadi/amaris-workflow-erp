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
import { AutoCompleteService } from '../service/modeler/auto-complete.service';


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

    constructor(private http: HttpClient,private autoCompleteService:AutoCompleteService ) {}

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


        this.loadEmptyDiagram();

        this.bpmnJS.on('import.done', (event: any) => {
            if (!event.error) {
                const canvas = this.bpmnJS.get('canvas') as any;
                canvas.zoom('fit-viewport');
                this.importDone.emit();
            }
        });

        const eventBus: any = this.bpmnJS.get('eventBus');
// Monitor all text-related events
        eventBus.on('directEditing.activate', (event) => {
            console.log('Started editing:', event.element);

            // Get the actual input element for real-time monitoring
            const textbox = document.querySelector('.djs-direct-editing-content');
            if (textbox) {
                textbox.addEventListener('input', (inputEvent) => {
                    const currentText = (inputEvent.target as HTMLElement).textContent || '';
                    console.log('Real-time text:', currentText);

                    if (currentText.length >= 2) {
                        this.autoCompleteService.getSuggestions(currentText).subscribe(suggestions => {
                            this.showAutoComplete(suggestions, inputEvent.target as HTMLElement);
                        });
                    } else {
                        this.hideAutoComplete();
                    }
                });
            }
        });

        eventBus.on('directEditing.complete', (event) => {
            console.log('Finished editing. Final text:', event.newLabel);
        });

        eventBus.on('commandStack.element.updateLabel.executed', (event) => {
            console.log('Label updated:', event.context.newLabel);
        });











    }

    private showAutoComplete(suggestions: string[], target: HTMLElement): void {
        this.hideAutoComplete(); // Supprime l'ancienne liste

        if (suggestions.length === 0) return;

        const dropdown = document.createElement('div');
        dropdown.className = 'autocomplete-dropdown';
        dropdown.style.cssText = `
        position: absolute;
        background: white;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        max-height: 150px;
        overflow-y: auto;
        z-index: 1000;
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
