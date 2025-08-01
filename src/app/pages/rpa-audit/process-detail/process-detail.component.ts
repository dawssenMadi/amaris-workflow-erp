import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { animate, state, style, transition, trigger } from '@angular/animations';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { PanelMenuModule } from 'primeng/panelmenu';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';

import { WebSocketAuditResult, WebSocketAuditService } from '../../../services/websocket-audit.service';
import { AuditProcessService, ProcessStartResponse } from '../../../services/audit-process.service';
import { DeployedProcess } from '../../../core/deployed.process';
import { AuditRule } from '../../../core/audit.rule';
import { AuditDecision } from '../../../core/audit.decision';

@Component({
    selector: 'app-process-detail',
    imports: [CommonModule, ButtonModule, CardModule, PanelMenuModule, TagModule, BadgeModule, ProgressBarModule, ToastModule, ConfirmDialogModule, TooltipModule],
    providers: [MessageService, ConfirmationService],
    templateUrl: './process-detail.component.html',
    styleUrl: './process-detail.component.scss',
    animations: [
        trigger('slideInAnimation', [
            state('in', style({ transform: 'translateX(0)', opacity: 1 })),
            state('static', style({ transform: 'translateX(0)', opacity: 1 })),
            transition('void => in', [style({ transform: 'translateX(-100%)', opacity: 0 }), animate('600ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))]),
            transition('void => static', [style({ transform: 'translateX(0)', opacity: 1 })])
        ])
    ]
})
export class ProcessDetailComponent implements OnInit, OnDestroy {
    process: DeployedProcess | null = null;
    auditMenuItems: MenuItem[] = [];
    processId: string = '';
    expandedRules: Set<string> = new Set();
    private websocketSubscription: Subscription | null = null;
    isWebSocketConnected = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private location: Location,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private websocketService: WebSocketAuditService,
        private auditProcessService: AuditProcessService
    ) {}

    ngOnInit() {
        this.route.params.subscribe((params) => {
            this.processId = params['id'];
            this.loadProcessDetails();
        });

        this.subscribeToWebSocketResults();

        this.checkWebSocketConnection();
    }

    ngOnDestroy() {
        if (this.websocketSubscription) {
            this.websocketSubscription.unsubscribe();
        }
    }

    private subscribeToWebSocketResults() {
        this.websocketSubscription = this.websocketService.auditResults$.subscribe((results: WebSocketAuditResult[]) => {
            if (results.length > 0) {
                this.updateAuditResultsFromWebSocket(results);
            }
        });
    }

    private checkWebSocketConnection() {
        this.isWebSocketConnected = this.websocketService.isConnected();

        // Vérifier périodiquement le statut de connexion
        setInterval(() => {
            this.isWebSocketConnected = this.websocketService.isConnected();
        }, 2000);
    }

    private updateAuditResultsFromWebSocket(results: WebSocketAuditResult[]) {
        if (!this.process) return;

        console.log('🔄 Données WebSocket reçues:', results);

        // Trouver la règle active (enabled et non validée)
        const activeRule = this.process.auditRules.find((rule) =>
            rule.isEnabled && !rule.isValidated && !rule.isLoading
        );

        if (!activeRule) {
            console.warn('❌ Aucune règle active trouvée pour recevoir les données WebSocket');
            // Fallback: chercher la première règle par nom pour compatibilité
            const nameConstraintRule = this.process.auditRules.find((rule) =>
                rule.name === 'Contraintes pour les noms des activités'
            );
            if (nameConstraintRule && nameConstraintRule.isEnabled) {
                this.processWebSocketResults(nameConstraintRule, results);
            }
            return;
        }

        console.log('✅ Règle active trouvée:', activeRule.name, 'Stage:', activeRule.stage);
        this.processWebSocketResults(activeRule, results);
    }

    private processWebSocketResults(rule: AuditRule, results: WebSocketAuditResult[]) {
        if (results.length === 0) return;

        // Calculer les statistiques pour le toast
        const okCount = results.filter((r) => r.decision).length;
        const nokCount = results.filter((r) => !r.decision).length;
        const successRate = Math.round((okCount / results.length) * 100);

        // Déterminer la sévérité du toast selon le taux de réussite
        let severity: 'success' | 'info' | 'warn' | 'error' = 'info';
        let icon = '📡';
        if (successRate >= 90) {
            severity = 'success';
            icon = '🎉';
        } else if (successRate >= 80) {
            severity = 'success';
            icon = '✅';
        } else if (successRate >= 60) {
            severity = 'info';
            icon = '📊';
        } else if (successRate >= 40) {
            severity = 'warn';
            icon = '⚠️';
        } else {
            severity = 'error';
            icon = '🚨';
        }

        // Toast d'information avec détails des résultats
        this.messageService.add({
            key: 'audit-received',
            severity: severity,
            summary: `${icon} Stage ${rule.stage} - Résultats d'audit reçus`,
            detail: `
                <div style="font-size: 14px; line-height: 1.6; margin-top: 8px;">
                    <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 12px;">
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <span style="font-size: 18px;">📊</span>
                            <strong>${results.length}</strong> nouvelles activités pour "${rule.name}"
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                        <div style="text-align: center; padding: 8px; background: rgba(34, 197, 94, 0.1); border-radius: 6px;">
                            <div style="font-size: 16px; color: #22c55e;">✅</div>
                            <div style="font-weight: bold; color: #22c55e;">${okCount}</div>
                            <div style="font-size: 11px; color: #6b7280;">Validées</div>
                        </div>

                        <div style="text-align: center; padding: 8px; background: rgba(239, 68, 68, 0.1); border-radius: 6px;">
                            <div style="font-size: 16px; color: #ef4444;">❌</div>
                            <div style="font-weight: bold; color: #ef4444;">${nokCount}</div>
                            <div style="font-size: 11px; color: #6b7280;">À corriger</div>
                        </div>

                        <div style="text-align: center; padding: 8px; background: rgba(59, 130, 246, 0.1); border-radius: 6px;">
                            <div style="font-size: 16px; color: #3b82f6;">📈</div>
                            <div style="font-weight: bold; color: #3b82f6;">${successRate}%</div>
                            <div style="font-size: 11px; color: #6b7280;">Réussite</div>
                        </div>
                    </div>

                    <div style="text-align: center; padding: 6px; background: rgba(156, 163, 175, 0.1); border-radius: 4px; font-size: 12px; color: #6b7280;">
                        🔄 Mise à jour automatique via WebSocket
                    </div>
                </div>
            `,
            life: 8000,
            sticky: false
        });

        // Toast de félicitations pour excellent résultat
        if (successRate >= 90) {
            setTimeout(() => {
                this.messageService.add({
                    key: 'congratulations',
                    severity: 'success',
                    summary: '🎉 Performance exceptionnelle !',
                    detail: `
                        <div style="font-size: 14px; line-height: 1.6; text-align: center; margin-top: 8px;">
                            <div style="font-size: 32px; margin-bottom: 8px;">🏆</div>
                            <div style="font-size: 16px; font-weight: bold; color: #22c55e; margin-bottom: 8px;">
                                Taux de réussite de ${successRate}% !
                            </div>
                            <div style="color: #6b7280; font-size: 13px;">
                                Excellent travail d'audit pour le Stage ${rule.stage} 👏
                            </div>
                        </div>
                    `,
                    life: 5000
                });
            }, 1000);
        }

        // Marquer les nouvelles activités pour l'animation
        const newActivities = results.map((wsResult) => ({
            rule: wsResult.rule,
            decision: wsResult.decision,
            isNew: true
        }));

        // Mettre à jour les activités de la règle
        rule.activities = newActivities;
        rule.status = 'in-progress';
        rule.isLoading = false;

        // Animation d'apparition des activités
        setTimeout(() => {
            rule.activities.forEach(activity => {
                activity.isNew = false;
            });
        }, 1000);

        // Mettre à jour le statut de la règle
        this.updateRuleStatus(rule);

        // Ouvrir automatiquement la règle pour montrer les résultats
        if (!this.isRuleExpanded(rule.id)) {
            this.expandedRules.add(rule.id);
        }

        // Rebuilder les menu items
        this.buildAuditMenuItems();

        console.log('✅ Règle mise à jour avec', newActivities.length, 'activités:', rule.name);
    }


    loadProcessDetails() {
        this.process = this.getProcessById(this.processId);
        if (this.process) {
            this.buildAuditMenuItems();
        }
    }

    getProcessById(id: string): DeployedProcess | null {
        // Simulation des données - à remplacer par l'API
        const processes: DeployedProcess[] = [
            {
                id: 'Process_pt085ol',
                name: 'Processus d\'audit automatique',
                version: '1.2.0',
                deployedAt: new Date(2025, 6, 25),
                status: 'active',
                description: "Processus d\'audit automatique",
                auditStatus: 'not-started',
                auditRules: this.generateAuditRules('Process_pt085ol'),
                completedRules: 0,
                totalRules: 5,
                lastAuditDate: new Date(2025, 6, 28)
            },
            {
                id: 'proc-002',
                name: 'Gestion des factures fournisseurs',
                version: '2.1.0',
                deployedAt: new Date(2025, 6, 20),
                status: 'active',
                description: 'Automatisation du traitement et de la validation des factures fournisseurs',
                auditStatus: 'not-started',
                auditRules: this.generateAuditRules('proc-002'),
                completedRules: 0,
                totalRules: 4
            },
            {
                id: 'proc-003',
                name: 'Onboarding collaborateurs',
                version: '1.0.0',
                deployedAt: new Date(2025, 6, 15),
                status: 'active',
                description: "Processus d'intégration automatisée des nouveaux collaborateurs",
                auditStatus: 'completed',
                auditRules: this.generateAuditRules('proc-003'),
                completedRules: 6,
                totalRules: 6,
                lastAuditDate: new Date(2025, 6, 26)
            }
        ];

        return processes.find((p) => p.id === id) || null;
    }

    generateAuditRules(processId: string): AuditRule[] {
        return [
            {
                id: `${processId}-rule-01`,
                name: 'Contraintes pour les noms des activités',
                description: 'Validation des conventions de nommage des activités BPMN',
                category: 'Conventions de nommage',
                activities: [], // Commencer avec une liste vide
                status: 'pending' as const,
                isValidated: false,
                validatedBy: undefined,
                validatedAt: undefined,
                stage: 1,
                isEnabled: true, // Premier stage toujours activé
                isLoading: true // Premier stage en chargement
            },
            {
                id: `${processId}-rule-02`,
                name: 'Validation des événements',
                description: 'Vérification de la structure et nommage des événements',
                category: 'Structure BPMN',
                activities: [],
                status: 'pending' as const,
                isValidated: false,
                validatedBy: undefined,
                validatedAt: undefined,
                stage: 2,
                isEnabled: false, // Désactivé initialement
                isLoading: false
            },
            {
                id: `${processId}-rule-03`,
                name: 'Contrôle qualité du contenu',
                description: 'Validation du contenu et des abréviations',
                category: 'Qualité',
                activities: [],
                status: 'pending' as const,
                isValidated: false,
                validatedBy: undefined,
                validatedAt: undefined,
                stage: 3,
                isEnabled: false, // Désactivé initialement
                isLoading: false
            }
        ];
    }

    // Nouvelle méthode pour gérer l'activation séquentielle des stages
    private updateStageActivation() {
        if (!this.process) return;

        // Trier les règles par stage
        const sortedRules = this.process.auditRules.sort((a, b) => a.stage - b.stage);

        for (let i = 0; i < sortedRules.length; i++) {
            const currentRule = sortedRules[i];
            const previousRule = i > 0 ? sortedRules[i - 1] : null;

            if (i === 0) {
                // Premier stage toujours activé
                currentRule.isEnabled = true;
                currentRule.isLoading = !currentRule.isValidated && currentRule.activities.length === 0;
            } else {
                // Les stages suivants ne sont activés que si le précédent est validé
                if (previousRule?.isValidated) {
                    currentRule.isEnabled = true;
                    currentRule.isLoading = !currentRule.isValidated && currentRule.activities.length === 0;
                } else {
                    currentRule.isEnabled = false;
                    currentRule.isLoading = false;
                }
            }
        }
    }

    // Nouvelle méthode pour valider une règle et activer la suivante
    validateRule(rule: AuditRule) {
        if (!rule.isEnabled) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Stage non accessible',
                detail: 'Vous devez d\'abord valider le stage précédent',
                life: 3000
            });
            return;
        }

        this.confirmationService.confirm({
            message: `Valider la règle "${rule.name}" et passer au stage suivant ?`,
            header: 'Validation de stage',
            icon: 'pi pi-check-circle',
            acceptLabel: 'Valider',
            rejectLabel: 'Annuler',
            accept: () => {
                rule.isValidated = true;
                rule.validatedBy = 'Tech Lead';
                rule.validatedAt = new Date();
                rule.status = 'completed';
                rule.isLoading = false;

                // Mettre à jour l'activation des stages
                this.updateStageActivation();

                // Trouver le prochain stage et l'activer
                const nextStage = this.getNextStage(rule.stage);
                if (nextStage) {
                    nextStage.isLoading = true;

                    this.messageService.add({
                        severity: 'success',
                        summary: `✅ Stage ${rule.stage} validé`,
                        detail: `"${rule.name}" validée. Stage ${nextStage.stage} activé : "${nextStage.name}"`,
                        life: 5000
                    });

                    // Simuler le chargement du prochain stage
                    setTimeout(() => {
                        if (nextStage) {
                            nextStage.isLoading = false;
                            this.simulateStageData(nextStage);
                        }
                    }, 2000);
                } else {
                    this.messageService.add({
                        severity: 'success',
                        summary: '🎉 Audit terminé !',
                        detail: 'Tous les stages ont été validés avec succès',
                        life: 5000
                    });
                }

                this.buildAuditMenuItems();
            }
        });
    }

    // Nouvelle méthode pour marquer une règle comme valide manuellement
    markRuleAsValid(rule: AuditRule) {
        if (!rule.isEnabled) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Stage non accessible',
                detail: 'Vous devez d\'abord activer ce stage',
                life: 3000
            });
            return;
        }

        this.confirmationService.confirm({
            message: `Marquer la règle "${rule.name}" comme VALIDE ? Cette action forcera la validation même si certaines activités sont NOK.`,
            header: 'Validation manuelle - VALIDE',
            icon: 'pi pi-thumbs-up',
            acceptLabel: 'Marquer Valide',
            rejectLabel: 'Annuler',
            acceptButtonStyleClass: 'p-button-success',
            accept: () => {
                rule.isValidated = true;
                rule.validatedBy = 'Manual-Valid';
                rule.validatedAt = new Date();
                rule.status = 'completed';
                rule.isLoading = false;

                // Mettre à jour l'activation des stages
                this.updateStageActivation();

                // Trouver le prochain stage et l'activer
                const nextStage = this.getNextStage(rule.stage);
                if (nextStage) {
                    nextStage.isLoading = true;

                    this.messageService.add({
                        severity: 'success',
                        summary: `✅ Stage ${rule.stage} marqué VALIDE`,
                        detail: `"${rule.name}" validée manuellement. Stage ${nextStage.stage} activé : "${nextStage.name}"`,
                        life: 5000
                    });

                    // Simuler le chargement du prochain stage
                    setTimeout(() => {
                        if (nextStage) {
                            nextStage.isLoading = false;
                            this.simulateStageData(nextStage);
                        }
                    }, 2000);
                } else {
                    this.messageService.add({
                        severity: 'success',
                        summary: '🎉 Audit terminé !',
                        detail: 'Tous les stages ont été validés avec succès',
                        life: 5000
                    });
                }

                this.buildAuditMenuItems();
            }
        });
    }

    // Nouvelle méthode pour marquer une règle comme invalide manuellement
    markRuleAsInvalid(rule: AuditRule) {
        if (!rule.isEnabled) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Stage non accessible',
                detail: 'Vous devez d\'abord activer ce stage',
                life: 3000
            });
            return;
        }

        this.confirmationService.confirm({
            message: `Marquer la règle "${rule.name}" comme INVALIDE ? Cette action marquera la règle comme non conforme et bloquera la progression.`,
            header: 'Validation manuelle - INVALIDE',
            icon: 'pi pi-thumbs-down',
            acceptLabel: 'Marquer Invalide',
            rejectLabel: 'Annuler',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                rule.isValidated = true;
                rule.validatedBy = 'Manual-Invalid';
                rule.validatedAt = new Date();
                rule.status = 'failed';
                rule.isLoading = false;

                this.messageService.add({
                    severity: 'warn',
                    summary: `❌ Stage ${rule.stage} marqué INVALIDE`,
                    detail: `"${rule.name}" marquée comme non conforme. Progression bloquée.`,
                    life: 5000
                });

                setTimeout(() => {
                    this.messageService.add({
                        severity: 'info',
                        summary: '📋 Action requise',
                        detail: 'Corrigez les problèmes identifiés avant de continuer l\'audit',
                        life: 4000
                    });
                }, 1000);

                this.buildAuditMenuItems();
            }
        });
    }

    // Méthode pour obtenir le prochain stage
    private getNextStage(currentStage: number): AuditRule | null {
        if (!this.process) return null;
        return this.process.auditRules.find(rule => rule.stage === currentStage + 1) || null;
    }

    // Méthode pour simuler des données pour un stage
    private simulateStageData(rule: AuditRule) {
        const mockActivities = {
            1: [
                { rule: '[STAGE1] Vérifier les conventions de nommage', decision: false, isNew: true },
                { rule: '[STAGE1] Valider la cohérence des noms', decision: false, isNew: true },
                { rule: '[STAGE1] Contrôler les abréviations', decision: false, isNew: true }
            ],
            2: [
                { rule: '[STAGE2] Valider les événements de début', decision: false, isNew: true },
                { rule: '[STAGE2] Contrôler les événements de fin', decision: false, isNew: true },
                { rule: '[STAGE2] Vérifier les événements intermédiaires', decision: false, isNew: true }
            ],
            3: [
                { rule: '[STAGE3] Analyser la qualité du contenu', decision: false, isNew: true },
                { rule: '[STAGE3] Vérifier la documentation', decision: false, isNew: true },
                { rule: '[STAGE3] Contrôler les métadonnées', decision: false, isNew: true }
            ]
        };

        rule.status = 'in-progress';

        // Animation d'apparition des activités
        setTimeout(() => {
            rule.activities.forEach(activity => {
                activity.isNew = false;
            });
        }, 1000);

        // Ouvrir automatiquement la règle
        if (!this.isRuleExpanded(rule.id)) {
            this.expandedRules.add(rule.id);
        }

        this.buildAuditMenuItems();
    }

    // Méthode pour démarrer le premier stage
    startFirstStage() {
        if (!this.process) return;

        const firstStage = this.process.auditRules.find(rule => rule.stage === 1);
        if (firstStage && firstStage.isLoading) {
            // Simuler le chargement des données du premier stage
            setTimeout(() => {
                this.simulateStageData(firstStage);
            }, 2000);
        }
    }

    buildAuditMenuItems() {
        if (!this.process) return;

        this.auditMenuItems = this.process.auditRules.map((rule) => ({
            label: rule.name,
            icon: this.getRuleIcon(rule.status),
            styleClass: this.getRuleStyleClass(rule.status),
            expanded: rule.status === 'in-progress' || rule.status === 'pending',
            items: rule.activities.map((activity) => ({
                label: activity.rule,
                icon: activity.decision ? 'pi pi-check-circle' : 'pi pi-times-circle',
                styleClass: activity.decision ? 'text-green-600' : 'text-red-600',
                template: this.createActivityTemplate(rule.id, activity)
            }))
        }));
    }

    createActivityTemplate(ruleId: string, activity: AuditDecision): any {
        return {
            rule: ruleId,
            activity: activity,
            component: 'activity-buttons'
        };
    }

    getRuleIcon(status: string): string {
        // Vérifier d'abord les états spéciaux des stages
        if (!this.process) return 'pi pi-circle';

        const rule = this.process.auditRules.find(r => r.status === status);
        if (rule) {
            if (rule.isLoading) return 'pi pi-spin pi-spinner';
            if (!rule.isEnabled) return 'pi pi-lock';
        }

        switch (status) {
            case 'completed': return 'pi pi-check-circle';
            case 'in-progress': return 'pi pi-clock';
            case 'failed': return 'pi pi-times-circle';
            default: return 'pi pi-circle';
        }
    }

    getRuleStyleClass(status: string): string {
        // Vérifier d'abord les états spéciaux des stages
        if (!this.process) return 'text-gray-600';

        const rule = this.process.auditRules.find(r => r.status === status);
        if (rule) {
            if (rule.isLoading) return 'text-blue-600 animate-pulse';
            if (!rule.isEnabled) return 'text-gray-400';
        }

        switch (status) {
            case 'completed': return 'text-green-600';
            case 'in-progress': return 'text-blue-600';
            case 'failed': return 'text-red-600';
            default: return 'text-gray-600';
        }
    }

    setActivityDecision(ruleId: string, activity: AuditDecision, decision: boolean) {
        if (!this.process) return;

        const rule = this.process.auditRules.find((r) => r.id === ruleId);
        if (rule && rule.isEnabled) { // Vérifier que la règle est activée
            activity.decision = decision;
            this.updateRuleStatus(rule);

            this.messageService.add({
                severity: decision ? 'success' : 'info',
                summary: decision ? 'Activité validée' : 'Activité marquée NOK',
                detail: `"${activity.rule}" marquée comme ${decision ? 'OK' : 'NOK'}`,
                life: 2000
            });
        } else if (rule && !rule.isEnabled) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Action non autorisée',
                detail: 'Ce stage n\'est pas encore activé',
                life: 3000
            });
        }
    }

    updateRuleStatus(rule: AuditRule) {
        const allDecisionsTrue = rule.activities.every((a) => a.decision);

        if (allDecisionsTrue) {
            rule.status = 'completed';
        } else {
            rule.status = 'in-progress';
        }

        if (this.process) {
            this.process.completedRules = this.process.auditRules.filter((r) => r.status === 'completed').length;

            if (this.process.completedRules === this.process.totalRules) {
                this.process.auditStatus = 'completed';
            } else if (this.process.completedRules > 0) {
                this.process.auditStatus = 'in-progress';
            }
        }
    }

    runAudit() {
        if (!this.process) return;

        this.confirmationService.confirm({
            message: `Êtes-vous sûr de vouloir lancer l'audit pour le processus "${this.process.name}" ?`,
            header: "Confirmation d'audit",
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: () => {
                this.executeAudit();
            }
        });
    }

    executeAudit() {
        if (!this.process) return;

        // Afficher le message de démarrage
        this.messageService.add({
            severity: 'info',
            summary: 'Lancement de l\'audit...',
            detail: `Appel de l'API pour démarrer l'audit du processus "${this.process.name}"`
        });

        // Appeler l'API avec le processKey (ID du processus)
        this.auditProcessService.startProcessWithoutVariables(this.process.id)
            .subscribe({
                next: (response: ProcessStartResponse) => {
                    console.log('🚀 Réponse API:', response);

                    if (response.success) {
                        // Succès de l'API
                        this.process!.auditStatus = 'in-progress';

                        this.messageService.add({
                            severity: 'success',
                            summary: '✅ Audit démarré avec succès',
                            detail: `Processus lancé avec l'ID d'instance: ${response.processInstanceId || 'N/A'}`
                        });

                        // Démarrer le premier stage
                        this.startFirstStage();
                    } else {
                        // Échec côté serveur mais réponse reçue
                        this.messageService.add({
                            severity: 'error',
                            summary: '❌ Échec du démarrage',
                            detail: response.message || response.error || 'Erreur inconnue du serveur'
                        });
                    }
                },
                error: (errorMessage: string) => {
                    console.error('❌ Erreur API:', errorMessage);

                    // Erreur de communication ou autre problème
                    this.messageService.add({
                        severity: 'error',
                        summary: '🚨 Erreur lors du lancement',
                        detail: `Impossible de démarrer l'audit: ${errorMessage}`
                    });

                    // Optionnel: proposer un mode dégradé
                    setTimeout(() => {
                        this.messageService.add({
                            severity: 'info',
                            summary: '💡 Mode dégradé disponible',
                            detail: 'Vous pouvez continuer en mode simulation en attendant la résolution du problème'
                        });
                    }, 2000);
                }
            });
    }

    simulateAuditResults() {
        if (!this.process) return;

        this.process.auditRules.forEach((rule) => {
            if (rule.status === 'pending') {
                rule.status = Math.random() > 0.5 ? 'completed' : 'in-progress';
            }
        });

        this.process.completedRules = this.process.auditRules.filter((r) => r.status === 'completed').length;
        this.process.lastAuditDate = new Date();

        if (this.process.completedRules === this.process.totalRules) {
            this.process.auditStatus = 'completed';
            this.messageService.add({
                severity: 'success',
                summary: 'Audit terminé',
                detail: `L'audit du processus "${this.process.name}" s'est terminé avec succès`
            });
        } else {
            this.process.auditStatus = 'in-progress';
            this.messageService.add({
                severity: 'warn',
                summary: 'Audit partiel',
                detail: `L'audit du processus "${this.process.name}" nécessite une validation manuelle`
            });
        }

        this.buildAuditMenuItems();
    }

    getProcessStatusSeverity(status: string): string {
        return status === 'active' ? 'success' : 'warning';
    }

    getAuditStatusSeverity(status: string): string {
        switch (status) {
            case 'completed':
                return 'success';
            case 'in-progress':
                return 'warning';
            case 'failed':
                return 'danger';
            default:
                return 'info';
        }
    }

    getAuditStatusLabel(status: string): string {
        switch (status) {
            case 'not-started':
                return 'Non démarré';
            case 'in-progress':
                return 'En cours';
            case 'completed':
                return 'Terminé';
            case 'failed':
                return 'Échec';
            default:
                return 'Inconnu';
        }
    }

    getValidatedActivitiesCount(rule: AuditRule): number {
        return rule.activities.filter((activity) => activity.decision).length;
    }

    goBack() {
        this.location.back();
    }

    exportReport() {
        this.messageService.add({
            severity: 'info',
            summary: 'Export en cours',
            detail: "Génération du rapport d'audit..."
        });
    }

    toggleRuleExpansion(ruleId: string) {
        if (this.expandedRules.has(ruleId)) {
            this.expandedRules.delete(ruleId);
        } else {
            this.expandedRules.add(ruleId);
        }
    }

    isRuleExpanded(ruleId: string): boolean {
        return this.expandedRules.has(ruleId);
    }

    isRuleCompleted(rule: AuditRule): boolean {
        return rule.activities.every((activity) => activity.decision);
    }
}
