import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

// PrimeNG imports
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { PanelMenuModule } from 'primeng/panelmenu';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { MenuItem } from 'primeng/api';
import { MessageService, ConfirmationService } from 'primeng/api';

interface AuditDecision {
  rule: string;
  decision: boolean;
}

interface AuditRule {
  id: string;
  name: string;
  description: string;
  category: string;
  activities: AuditDecision[];
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  isValidated: boolean;
  validatedBy?: string;
  validatedAt?: Date;
}

interface DeployedProcess {
  id: string;
  name: string;
  version: string;
  deployedAt: Date;
  status: 'active' | 'inactive';
  description: string;
  auditStatus: 'not-started' | 'in-progress' | 'completed' | 'failed';
  auditRules: AuditRule[];
  completedRules: number;
  totalRules: number;
  lastAuditDate?: Date;
}

@Component({
  selector: 'app-process-detail',
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    PanelMenuModule,
    TagModule,
    BadgeModule,
    ProgressBarModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './process-detail.component.html',
  styleUrl: './process-detail.component.scss'
})
export class ProcessDetailComponent implements OnInit {
  process: DeployedProcess | null = null;
  auditMenuItems: MenuItem[] = [];
  processId: string = '';
  expandedRules: Set<string> = new Set();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.processId = params['id'];
      this.loadProcessDetails();
    });
  }

  loadProcessDetails() {
    // Simulation - remplacer par l'appel API réel
    this.process = this.getProcessById(this.processId);
    if (this.process) {
      this.buildAuditMenuItems();
    }
  }

  getProcessById(id: string): DeployedProcess | null {
    // Simulation des données - à remplacer par l'API
    const processes: DeployedProcess[] = [
      {
        id: 'proc-001',
        name: 'Processus de validation des commandes',
        version: '1.2.0',
        deployedAt: new Date(2025, 6, 25),
        status: 'active',
        description: 'Processus automatisé pour la validation et l\'approbation des commandes clients',
        auditStatus: 'in-progress',
        auditRules: this.generateAuditRules('proc-001'),
        completedRules: 3,
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
        totalRules: 4,
      },
      {
        id: 'proc-003',
        name: 'Onboarding collaborateurs',
        version: '1.0.0',
        deployedAt: new Date(2025, 6, 15),
        status: 'active',
        description: 'Processus d\'intégration automatisée des nouveaux collaborateurs',
        auditStatus: 'completed',
        auditRules: this.generateAuditRules('proc-003'),
        completedRules: 6,
        totalRules: 6,
        lastAuditDate: new Date(2025, 6, 26)
      }
    ];

    return processes.find(p => p.id === id) || null;
  }

  generateAuditRules(processId: string): AuditRule[] {
    return [
      {
        id: `${processId}-rule-01`,
        name: 'Contraintes pour les noms des activités',
        description: 'Validation des conventions de nommage des activités BPMN',
        category: 'Conventions de nommage',
        activities: [
          { rule: 'Valider les résultats manuellement', decision: true },
          { rule: '[STAGE1] Valider si les noms des activités sont à l\'infinitif?', decision: false },
          { rule: 'Télécharger la dernière version de BPMN', decision: true },
          { rule: 'corriger le fichier BPMN', decision: true }
        ],
        status: 'completed' as const,
        isValidated: true,
        validatedBy: 'Tech Lead',
        validatedAt: new Date(2025, 6, 28)
      },
      {
        id: `${processId}-rule-02`,
        name: 'Validation des événements',
        description: 'Vérification de la structure et nommage des événements',
        category: 'Structure BPMN',
        activities: [
          { rule: '[STAGE2] Valider si les événements sont écrits au passé', decision: false },
          { rule: '[STAGE4] Vérifier les start events', decision: false },
          { rule: '[STAGE5] Vérifier les end events', decision: false }
        ],
        status: 'in-progress' as const,
        isValidated: false
      },
      {
        id: `${processId}-rule-03`,
        name: 'Contrôle qualité du contenu',
        description: 'Validation du contenu et des abréviations',
        category: 'Qualité',
        activities: [
          { rule: '[STAGE3] Vérifier s\'il y a des abréviations', decision: false },
          { rule: 'Demander au BA de corriger le fichier', decision: true },
          { rule: 'Renotifier le BA avec un email', decision: true }
        ],
        status: 'pending' as const,
        isValidated: false
      }
    ];
  }

  buildAuditMenuItems() {
    if (!this.process) return;

    this.auditMenuItems = this.process.auditRules.map(rule => ({
      label: rule.name,
      icon: this.getRuleIcon(rule.status),
      styleClass: this.getRuleStyleClass(rule.status),
      expanded: rule.status === 'in-progress' || rule.status === 'pending',
      items: rule.activities.map(activity => ({
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
    switch (status) {
      case 'completed': return 'pi pi-check-circle';
      case 'in-progress': return 'pi pi-clock';
      case 'failed': return 'pi pi-times-circle';
      default: return 'pi pi-circle';
    }
  }

  getRuleStyleClass(status: string): string {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'in-progress': return 'text-blue-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }

  toggleActivityDecision(ruleId: string, activity: AuditDecision) {
    if (!this.process) return;

    const rule = this.process.auditRules.find(r => r.id === ruleId);
    if (rule) {
      activity.decision = !activity.decision;
      this.updateRuleStatus(rule);
      this.buildAuditMenuItems();
    }
  }

  setActivityDecision(ruleId: string, activity: AuditDecision, decision: boolean) {
    if (!this.process) return;

    const rule = this.process.auditRules.find(r => r.id === ruleId);
    if (rule) {
      activity.decision = decision;
      this.updateRuleStatus(rule);

      // Message de feedback
      this.messageService.add({
        severity: decision ? 'success' : 'info',
        summary: decision ? 'Activité validée' : 'Activité marquée NOK',
        detail: `"${activity.rule}" marquée comme ${decision ? 'OK' : 'NOK'}`,
        life: 2000
      });
    }
  }

  updateRuleStatus(rule: AuditRule) {
    const allDecisionsTrue = rule.activities.every(a => a.decision);

    if (allDecisionsTrue) {
      rule.status = 'completed';
    } else {
      rule.status = 'in-progress';
    }

    if (this.process) {
      this.process.completedRules = this.process.auditRules.filter(r => r.status === 'completed').length;

      if (this.process.completedRules === this.process.totalRules) {
        this.process.auditStatus = 'completed';
      } else if (this.process.completedRules > 0) {
        this.process.auditStatus = 'in-progress';
      }
    }
  }

  validateRule(rule: AuditRule) {
    this.confirmationService.confirm({
      message: `Valider la règle "${rule.name}" ? Cette action ne peut pas être annulée.`,
      header: 'Validation Tech Lead',
      icon: 'pi pi-check-circle',
      acceptLabel: 'Valider',
      rejectLabel: 'Annuler',
      accept: () => {
        rule.isValidated = true;
        rule.validatedBy = 'Tech Lead';
        rule.validatedAt = new Date();

        this.messageService.add({
          severity: 'success',
          summary: 'Règle validée',
          detail: `La règle "${rule.name}" a été validée par le Tech Lead`
        });

        this.buildAuditMenuItems();
      }
    });
  }

  runAudit() {
    if (!this.process) return;

    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir lancer l'audit pour le processus "${this.process.name}" ?`,
      header: 'Confirmation d\'audit',
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

    this.process.auditStatus = 'in-progress';
    this.messageService.add({
      severity: 'info',
      summary: 'Audit en cours',
      detail: `L'audit du processus "${this.process.name}" a été lancé`
    });

    setTimeout(() => {
      this.simulateAuditResults();
    }, 2000);
  }

  simulateAuditResults() {
    if (!this.process) return;

    this.process.auditRules.forEach(rule => {
      if (rule.status === 'pending') {
        rule.status = Math.random() > 0.5 ? 'completed' : 'in-progress';
      }
    });

    this.process.completedRules = this.process.auditRules.filter(r => r.status === 'completed').length;
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
      case 'completed': return 'success';
      case 'in-progress': return 'warning';
      case 'failed': return 'danger';
      default: return 'info';
    }
  }

  getAuditStatusLabel(status: string): string {
    switch (status) {
      case 'not-started': return 'Non démarré';
      case 'in-progress': return 'En cours';
      case 'completed': return 'Terminé';
      case 'failed': return 'Échec';
      default: return 'Inconnu';
    }
  }

  getValidatedActivitiesCount(rule: AuditRule): number {
    return rule.activities.filter(activity => activity.decision).length;
  }

  goBack() {
    this.location.back();
  }

  exportReport() {
    this.messageService.add({
      severity: 'info',
      summary: 'Export en cours',
      detail: 'Génération du rapport d\'audit...'
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
    return rule.activities.every(activity => activity.decision);
  }
}
