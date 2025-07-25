import {
    AfterViewInit,
    Component, ElementRef,
    EventEmitter,
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
import ElementTemplateIconRenderer from '@bpmn-io/element-template-icon-renderer';
import '@bpmn-io/element-template-chooser/dist/element-template-chooser.css';

import {
    CloudElementTemplatesPropertiesProviderModule
} from 'bpmn-js-element-templates';

import {
    CreateAppendAnythingModule,
    CreateAppendElementTemplatesModule
} from 'bpmn-js-create-append-anything';

import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import '@bpmn-io/properties-panel/dist/assets/properties-panel.css';
import 'bpmn-js-token-simulation/assets/css/bpmn-js-token-simulation.css';
import '@bpmn-io/element-template-chooser/dist/element-template-chooser.css';

import tokenSimulation from 'bpmn-js-token-simulation';
import ElementTemplateChooserModule from '@bpmn-io/element-template-chooser';
import { AutoCompleteService } from '../service/modeler/auto-complete.service';


interface ElementTemplatesLoader {
    setTemplates(templates: any[]): void;
}

interface ElementRegistry {
    get(id: string): any;
    getAll(): any[];
    filter(fn: (element: any) => boolean): any[];
}

// Interfaces pour l'audit BPMN
interface AuditResult {
    idActivite: string;
    resultatAudit: boolean;
    erreurs?: string[];
}

interface AuditRule {
    name: string;
    check: (element: any) => { passed: boolean; errors: string[] };
}



@Component({
    selector: 'app-modeler',
    imports: [CommonModule],
    templateUrl: './modeler.component.html',
    styleUrl: './modeler.component.scss'
})
export class ModelerComponent implements AfterViewInit, OnDestroy {
    private bpmnJS: BpmnModeler;
    isPanelHidden = true;
    isFullscreen = false;
    private elementTemplates: any[] = [];
    private currentAuditResults: Map<string, AuditResult> = new Map();
    private auditRules: AuditRule[] = [];

    @ViewChild('ref', { static: true }) private el: ElementRef;
    @ViewChild('propertiesPanel', { static: true }) private propertiesPanel: ElementRef;
    @ViewChild('fileInput', { static: true }) private fileInput: ElementRef;
    @Output() private importDone: EventEmitter<any> = new EventEmitter();

    constructor(
        private http: HttpClient,
        private autoCompleteService: AutoCompleteService,
    ) {
        this.initializeAuditRules();
    }

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

        try {
            const connectorFiles = [
                'agenticai-adhoctoolsschema-outbound-connector.json',
                'agenticai-aiagent-outbound-connector.json',
                'agenticai-mcp-client-outbound-connector.json',
                'agenticai-mcp-remote-client-outbound-connector.json',
                'asana-connector.json',
                'automation-anywhere-outbound-connector.json',
                'aws-eventbridge-connector-boundary.json',
                'aws-eventbridge-connector-intermediate.json',
                'aws-eventbridge-connector-message-start.json',
                'aws-eventbridge-connector-start-event.json',
                'aws-eventbridge-outbound-connector.json',
                'aws-lambda-outbound-connector.json',
                'aws-s3-outbound-connector.json',
                'blue-prism-connector.json',
                'box-outbound-connector.json',
                'due-date.json',
                'easy-post-connector.json',
                'email-inbound-connector-boundary.json',
                'email-inbound-connector-intermediate.json',
                'email-message-start-event-connector.json',
                'email-outbound-connector.json',
                'embeddings-vector-database-outbound-connector.json',
                'github-connector.json',
                'github-webhook-connector-boundary.json',
                'github-webhook-connector-intermediate.json',
                'github-webhook-connector-message-start.json',
                'github-webhook-connector-start-event.json',
                'gitlab-connector.json',
                'google-gemini-outbound-connector.json',
                'http-json-connector.json',
                'hugging-face-connector.json',
                'jdbc-outbound-connector.json',
                'kafka-inbound-connector-boundary.json',
                'kafka-inbound-connector-intermediate.json',
                'kafka-inbound-connector-start-message.json',
                'kafka-outbound-connector.json',
                'microsoft-teams-outbound-connector.json',
                'openai-connector.json',
                'operate-connector.json',
                'power-automate-connector.json',
                'rabbitmq-inbound-connector-boundary.json',
                'rabbitmq-inbound-connector-intermediate.json',
                'rabbitmq-inbound-connector-message-start.json',
                'rabbitmq-inbound-connector-start-event.json',
                'rabbitmq-outbound-connector.json',
                'salesforce-connector.json',
                'send-message-connector-intermediate-throw-event.json',
                'send-message-connector-message-end-event.json',
                'send-message-connector-send-task.json',
                'slack-connector.json',
                'soap-outbound-connector.json',
                'whatsapp-connector.json'
            ].map(file => `assets/connectors/${file}`);

            const requests = connectorFiles.map(file =>
                this.http.get(file).toPromise().catch(error => {
                    return null;
                })
            );

            const loadedTemplates = await Promise.all(requests);

            loadedTemplates.forEach((templates) => {
                if (templates && Array.isArray(templates)) {
                    templates.forEach(template => {
                        if (template && template.id) {
                            const existingIndex = this.elementTemplates.findIndex(t => t.id === template.id);
                            if (existingIndex >= 0) {
                                this.elementTemplates[existingIndex] = template;
                            } else {
                                this.elementTemplates.push(template);
                            }
                        }
                    });
                } else if (templates && templates.id) {
                    const existingIndex = this.elementTemplates.findIndex(t => t.id === templates.id);
                    if (existingIndex >= 0) {
                        this.elementTemplates[existingIndex] = templates;
                    } else {
                        this.elementTemplates.push(templates);
                    }
                }
            });

        } catch (error) {
        }
    }


    private async initializeBpmnJS(): Promise<void> {
        this.bpmnJS = new BpmnModeler({
            container: this.el.nativeElement,
            additionalModules: [
                BpmnPropertiesPanelModule,
                BpmnPropertiesProviderModule,
                ZeebePropertiesProviderModule,
                CloudElementTemplatesPropertiesProviderModule,
                CreateAppendAnythingModule,
                CreateAppendElementTemplatesModule,
                tokenSimulation,
                ElementTemplateIconRenderer,
                ElementTemplateChooserModule
            ],
            moddleExtensions: {
                zeebe: zeebeModdleDescriptor,
            },
            propertiesPanel: {
                parent: this.propertiesPanel.nativeElement
            }
        });

        const elementTemplatesLoader = this.bpmnJS.get('elementTemplatesLoader') as ElementTemplatesLoader;
        elementTemplatesLoader.setTemplates(this.elementTemplates);

        this.loadEmptyDiagram();

        this.bpmnJS.on('import.done', (event: any) => {
            if (!event.error) {
                const canvas = this.bpmnJS.get('canvas') as any;
                canvas.zoom('fit-viewport');
                this.importDone.emit();
            }
        });

        const eventBus: any = this.bpmnJS.get('eventBus');



        eventBus.on('directEditing.activate', (event: any) => {
            const textbox = document.querySelector('.djs-direct-editing-content');
            if (textbox) {
                textbox.addEventListener('input', (inputEvent: any) => {
                    const currentText = (inputEvent.target as HTMLElement).textContent || '';
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
    }


    private showAutoComplete(suggestions: string[], target: HTMLElement): void {
        this.hideAutoComplete();

        if (suggestions.length === 0) return;

        const dropdown = document.createElement('div');
        dropdown.className = 'autocomplete-dropdown';

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



    triggerFileUpload(): void {
        this.fileInput.nativeElement.click();
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];

        if (!file) return;

        if (!file.name.toLowerCase().endsWith('.bpmn') && !file.name.toLowerCase().endsWith('.xml')) {
            alert('⚠️ Veuillez sélectionner un fichier .bpmn ou .xml');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const bpmnXML = e.target?.result as string;
            this.importBpmnDiagram(bpmnXML, file.name);
        };

        reader.onerror = () => {
            alert('❌ Erreur lors de la lecture du fichier');
        };

        reader.readAsText(file);
        input.value = '';
    }

    private async importBpmnDiagram(bpmnXML: string, filename: string): Promise<void> {
        try {
            await this.bpmnJS.importXML(bpmnXML);
        } catch (error: any) {
            let errorMessage = 'Erreur lors de l\'import du diagramme BPMN.';
            if (error.message) {
                errorMessage += `\n\nDétails: ${error.message}`;
            }
            alert(`❌ ${errorMessage}`);
        }
    }

    async downloadDiagram(): Promise<void> {
        try {
            const result = await this.bpmnJS.saveXML({ format: true });
            const bpmnXML = result.xml;

            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            const filename = `diagramme-bpmn-${timestamp}.bpmn`;

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
        } catch (error) {
            alert('❌ Erreur lors du téléchargement du diagramme');
        }
    }

    createNewDiagram(): void {
            this.loadEmptyDiagram();
    }

    toggleFullscreen(): void {
        this.isFullscreen = !this.isFullscreen;
    }

    // ====== MÉTHODES D'AUDIT BPMN ======

    /**
     * Initialise les règles d'audit BPMN
     */
    private initializeAuditRules(): void {
        this.auditRules = [
            {
                name: 'Nommage des activités - Verbe à l\'infinitif',
                check: (element: any) => {
                    if (this.isTaskElement(element)) {
                        const name = element.businessObject?.name || '';
                        if (!name.trim()) {
                            return { passed: false, errors: ['L\'activité doit avoir un nom'] };
                        }

                        // Vérifier si le nom commence par un verbe à l'infinitif
                        const infinitiveVerbs = [
                            'analyser', 'traiter', 'valider', 'vérifier', 'envoyer', 'recevoir',
                            'créer', 'supprimer', 'modifier', 'calculer', 'générer', 'importer',
                            'exporter', 'sauvegarder', 'charger', 'transformer', 'convertir',
                            'approuver', 'rejeter', 'notifier', 'alerter', 'contrôler'
                        ];

                        const firstWord = name.trim().split(' ')[0].toLowerCase();
                        const startsWithInfinitive = infinitiveVerbs.some(verb =>
                            firstWord === verb || firstWord.startsWith(verb)
                        );

                        if (!startsWithInfinitive) {
                            return {
                                passed: false,
                                errors: [`Le nom "${name}" devrait commencer par un verbe à l'infinitif`]
                            };
                        }
                    }
                    return { passed: true, errors: [] };
                }
            },
            {
                name: 'Longueur du nom des activités',
                check: (element: any) => {
                    if (this.isTaskElement(element)) {
                        const name = element.businessObject?.name || '';
                        if (name.length > 50) {
                            return {
                                passed: false,
                                errors: [`Le nom "${name}" est trop long (${name.length} caractères). Maximum recommandé: 50 caractères`]
                            };
                        }
                        if (name.length < 3) {
                            return {
                                passed: false,
                                errors: [`Le nom "${name}" est trop court. Minimum recommandé: 3 caractères`]
                            };
                        }
                    }
                    return { passed: true, errors: [] };
                }
            },
            {
                name: 'Présence d\'événements de fin',
                check: (element: any) => {
                    if (element.type === 'bpmn:Process') {
                        const elementRegistry = this.bpmnJS.get('elementRegistry') as ElementRegistry;
                        const endEvents = elementRegistry.filter((el: any) => el.type === 'bpmn:EndEvent');
                        if (endEvents.length === 0) {
                            return {
                                passed: false,
                                errors: ['Le processus doit avoir au moins un événement de fin']
                            };
                        }
                    }
                    return { passed: true, errors: [] };
                }
            }
        ];
    }

    /**
     * Vérifie si un élément est une activité/tâche
     */
    private isTaskElement(element: any): boolean {
        return element.type === 'bpmn:Task' ||
               element.type === 'bpmn:UserTask' ||
               element.type === 'bpmn:ServiceTask' ||
               element.type === 'bpmn:ScriptTask' ||
               element.type === 'bpmn:BusinessRuleTask' ||
               element.type === 'bpmn:ManualTask' ||
               element.type === 'bpmn:SendTask' ||
               element.type === 'bpmn:ReceiveTask';
    }

    /**
     * Lance l'audit BPMN du diagramme
     */
    async auditBpmnDiagram(): Promise<void> {
        try {
            // Nettoyer les résultats précédents
            this.clearAuditResults();

            const elementRegistry = this.bpmnJS.get('elementRegistry') as ElementRegistry;
            const allElements = elementRegistry.getAll();

            // Filtrer les éléments à auditer (activités principalement)
            const elementsToAudit = allElements.filter(element =>
                this.isTaskElement(element) || element.type === 'bpmn:Process'
            );

            console.log(`🔍 Début de l'audit BPMN - ${elementsToAudit.length} éléments à analyser`);

            // Simuler un appel API avec des données mockées
            const mockAuditResults = this.generateMockAuditResults(elementsToAudit);

            // Traitement des résultats d'audit
            this.processAuditResults(mockAuditResults);

            // Appliquer la mise en évidence visuelle
            this.applyAuditVisualization();

            // Afficher le résumé
            this.showAuditSummary();

        } catch (error) {
            console.error('Erreur lors de l\'audit BPMN:', error);
            alert('Erreur lors de l\'audit du diagramme BPMN');
        }
    }

    /**
     * Génère des résultats d'audit mockés (simulation API)
     */
    private generateMockAuditResults(elements: any[]): AuditResult[] {
        const results: AuditResult[] = [];

        elements.forEach(element => {
            const errors: string[] = [];
            let passed = true;

            // Appliquer toutes les règles d'audit
            this.auditRules.forEach(rule => {
                const ruleResult = rule.check(element);
                if (!ruleResult.passed) {
                    passed = false;
                    errors.push(...ruleResult.errors);
                }
            });

            // Simulation de résultats variables pour démonstration
            const randomFactor = Math.random();
            if (this.isTaskElement(element) && randomFactor > 0.7) {
                passed = false;
                errors.push('Règle de nommage non respectée (demo)');
            }

            results.push({
                idActivite: element.id,
                resultatAudit: passed,
                erreurs: errors.length > 0 ? errors : undefined
            });
        });

        return results;
    }

    /**
     * Traite les résultats d'audit et les stocke
     */
    private processAuditResults(results: AuditResult[]): void {
        this.currentAuditResults.clear();

        results.forEach(result => {
            this.currentAuditResults.set(result.idActivite, result);
        });
    }

    /**
     * Applique la mise en évidence visuelle des résultats d'audit
     */
    private applyAuditVisualization(): void {
        const elementRegistry = this.bpmnJS.get('elementRegistry') as ElementRegistry;

        this.currentAuditResults.forEach((result, elementId) => {
            const element = elementRegistry.get(elementId);
            if (element) {
                const gfx = this.getElementGraphics(element);
                if (gfx) {
                    // Nettoyer les classes précédentes
                    gfx.classList.remove('audit-failed', 'audit-passed');

                    // Appliquer seulement le style rouge aux éléments non conformes
                    if (!result.resultatAudit) {
                        gfx.classList.add('audit-failed');

                        // Ajouter un gestionnaire de survol pour afficher les erreurs
                        this.addErrorTooltip(element, result.erreurs || []);
                    }
                    // Les éléments conformes restent avec leur style par défaut (pas de classe ajoutée)
                }
            }
        });
    }

    /**
     * Récupère les graphiques d'un élément
     */
    private getElementGraphics(element: any): HTMLElement | null {
        try {
            const canvas = this.bpmnJS.get('canvas') as any;
            return canvas.getGraphics(element);
        } catch (error) {
            return null;
        }
    }

    /**
     * Ajoute une info-bulle d'erreur à un élément
     */
    private addErrorTooltip(element: any, errors: string[]): void {
        const gfx = this.getElementGraphics(element);
        if (!gfx || errors.length === 0) return;

        const showTooltip = (event: MouseEvent) => {
            this.hideErrorTooltip();

            const tooltip = document.createElement('div');
            tooltip.className = 'audit-tooltip';
            tooltip.innerHTML = `
                <strong>Erreurs d'audit:</strong><br>
                ${errors.map(error => `• ${error}`).join('<br>')}
            `;

            tooltip.style.left = event.pageX + 'px';
            tooltip.style.top = (event.pageY - 60) + 'px';

            document.body.appendChild(tooltip);
        };

        const hideTooltip = () => {
            this.hideErrorTooltip();
        };

        gfx.addEventListener('mouseenter', showTooltip);
        gfx.addEventListener('mouseleave', hideTooltip);
    }

    /**
     * Cache l'info-bulle d'erreur
     */
    private hideErrorTooltip(): void {
        const existing = document.querySelector('.audit-tooltip');
        if (existing) {
            existing.remove();
        }
    }

    /**
     * Affiche le résumé des résultats d'audit
     */
    private showAuditSummary(): void {
        const totalElements = this.currentAuditResults.size;
        const failedElements = Array.from(this.currentAuditResults.values())
            .filter(result => !result.resultatAudit).length;
        const passedElements = totalElements - failedElements;

        const successRate = totalElements > 0 ? ((passedElements / totalElements) * 100).toFixed(1) : '0';

        const message = `
📊 RÉSULTATS DE L'AUDIT BPMN

✅ Éléments conformes: ${passedElements}
❌ Éléments non conformes: ${failedElements}
📈 Taux de conformité: ${successRate}%

${failedElements > 0 ?
    '⚠️ Les éléments non conformes sont encadrés en rouge et clignotent.\nSurvole-les pour voir les détails des erreurs.' :
    '🎉 Félicitations ! Tous les éléments respectent les bonnes pratiques BPMN.'}
        `;

        alert(message);

        console.log('📊 Résultats détaillés de l\'audit:');
        this.currentAuditResults.forEach((result, elementId) => {
            console.log(`${result.resultatAudit ? '✅' : '❌'} ${elementId}:`, result);
        });
    }

    /**
     * Nettoie les résultats d'audit précédents
     */
    private clearAuditResults(): void {
        // Nettoyer les classes CSS
        const elementRegistry = this.bpmnJS?.get('elementRegistry') as ElementRegistry;
        if (elementRegistry) {
            elementRegistry.getAll().forEach(element => {
                const gfx = this.getElementGraphics(element);
                if (gfx) {
                    gfx.classList.remove('audit-failed', 'audit-passed');
                }
            });
        }

        // Nettoyer les données
        this.currentAuditResults.clear();

        // Nettoyer les tooltips
        this.hideErrorTooltip();
    }
}
