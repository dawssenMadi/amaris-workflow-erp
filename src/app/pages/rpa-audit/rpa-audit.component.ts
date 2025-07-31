import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG imports
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { PanelMenuModule } from 'primeng/panelmenu';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
import { ProgressBarModule } from 'primeng/progressbar';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
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
  selector: 'app-rpa-audit',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    PanelMenuModule,
    TagModule,
    BadgeModule,
    ProgressBarModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    TableModule,
    TooltipModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './rpa-audit.component.html',
  styleUrl: './rpa-audit.component.scss'
})
export class RpaAuditComponent implements OnInit {
  deployedProcesses: DeployedProcess[] = [];
  selectedProcess: DeployedProcess | null = null;
  showProcessDetails = false;
  auditMenuItems: MenuItem[] = [];

  constructor(
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadDeployedProcesses();
  }

  loadDeployedProcesses() {
    // Simulation des processus déployés - à remplacer par l'API Operate
    this.deployedProcesses = [
      {
        id: 'Process_pt085ol',
        name: 'Processus de validation des commandes',
        version: '1.2.0',
        deployedAt: new Date(2025, 6, 25),
        status: 'active',
        description: 'Processus automatisé pour la validation et l\'approbation des commandes clients',
        auditStatus: 'in-progress',
        auditRules: this.generateAuditRules('Process_pt085ol'),
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

  openProcessDetails(process: DeployedProcess) {
    this.router.navigate(['/rpa-audit/process', process.id]);
  }

  buildAuditMenuItems() {
    if (!this.selectedProcess) return;

    this.auditMenuItems = this.selectedProcess.auditRules.map(rule => ({
      label: rule.name,
      icon: this.getRuleIcon(rule.status),
      styleClass: this.getRuleStyleClass(rule.status),
      expanded: rule.status === 'in-progress',
      items: rule.activities.map(activity => ({
        label: activity.rule,
        icon: activity.decision ? 'pi pi-check-circle' : 'pi pi-times-circle',
        styleClass: activity.decision ? 'text-green-600' : 'text-red-600',
        command: () => this.toggleActivityDecision(rule.id, activity)
      }))
    }));
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

  runAudit(process: DeployedProcess) {
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir lancer l'audit pour le processus "${process.name}" ?`,
      header: 'Confirmation d\'audit',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      accept: () => {
        this.executeAudit(process);
      }
    });
  }

  executeAudit(process: DeployedProcess) {
    process.auditStatus = 'in-progress';
    this.messageService.add({
      severity: 'info',
      summary: 'Audit en cours',
      detail: `L'audit du processus "${process.name}" a été lancé`
    });

    // Simulation de l'audit - remplacer par l'appel API réel
    setTimeout(() => {
      this.simulateAuditResults(process);
    }, 2000);
  }

  simulateAuditResults(process: DeployedProcess) {
    // Mise à jour des résultats d'audit
    process.auditRules.forEach(rule => {
      if (rule.status === 'pending') {
        rule.status = Math.random() > 0.5 ? 'completed' : 'in-progress';
      }
    });

    process.completedRules = process.auditRules.filter(r => r.status === 'completed').length;
    process.lastAuditDate = new Date();

    if (process.completedRules === process.totalRules) {
      process.auditStatus = 'completed';
      this.messageService.add({
        severity: 'success',
        summary: 'Audit terminé',
        detail: `L'audit du processus "${process.name}" s'est terminé avec succès`
      });
    } else {
      process.auditStatus = 'in-progress';
      this.messageService.add({
        severity: 'warn',
        summary: 'Audit partiel',
        detail: `L'audit du processus "${process.name}" nécessite une validation manuelle`
      });
    }
  }

  toggleActivityDecision(ruleId: string, activity: AuditDecision) {
    if (!this.selectedProcess) return;

    const rule = this.selectedProcess.auditRules.find(r => r.id === ruleId);
    if (rule && !rule.isValidated) {
      activity.decision = !activity.decision;
      this.updateRuleStatus(rule);
      this.buildAuditMenuItems(); // Refresh menu
    }
  }

  updateRuleStatus(rule: AuditRule) {
    const allDecisionsTrue = rule.activities.every(a => a.decision);

    if (allDecisionsTrue) {
      rule.status = 'completed';
    } else {
      rule.status = 'in-progress';
    }

    // Mettre à jour le statut global du processus
    if (this.selectedProcess) {
      this.selectedProcess.completedRules = this.selectedProcess.auditRules.filter(r => r.status === 'completed').length;

      if (this.selectedProcess.completedRules === this.selectedProcess.totalRules) {
        this.selectedProcess.auditStatus = 'completed';
      } else if (this.selectedProcess.completedRules > 0) {
        this.selectedProcess.auditStatus = 'in-progress';
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

  getProcessStatusSeverity(status: string): string {
    return status === 'active' ? 'success' : 'warning';
  }

  closeProcessDetails() {
    this.showProcessDetails = false;
    this.selectedProcess = null;
    this.auditMenuItems = [];
  }

  getValidatedActivitiesCount(rule: AuditRule): number {
    return rule.activities.filter(activity => activity.decision).length;
  }
}
