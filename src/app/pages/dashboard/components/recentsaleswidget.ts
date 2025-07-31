import { Component, OnInit } from '@angular/core';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { RouterModule } from '@angular/router';

interface DeployedProcess {
    id: string;
    name: string;
    version: string;
    deployedAt: Date;
    status: 'active' | 'inactive';
    auditStatus: 'ready' | 'in-progress' | 'completed' | 'not-started';
    lastAuditDate?: Date;
}

@Component({
    standalone: true,
    selector: 'app-recent-sales-widget',
    imports: [CommonModule, TableModule, ButtonModule, RippleModule, TagModule, RouterModule],
    template: `<div class="card !mb-8">
        <div class="font-semibold text-xl mb-4">Derniers Processus Déployés - Prêts pour Audit</div>
        <p-table [value]="deployedProcesses" [paginator]="true" [rows]="5" responsiveLayout="scroll">
            <ng-template #header>
                <tr>
                    <th>Statut</th>
                    <th pSortableColumn="name">Nom du Processus <p-sortIcon field="name"></p-sortIcon></th>
                    <th pSortableColumn="version">Version <p-sortIcon field="version"></p-sortIcon></th>
                    <th pSortableColumn="deployedAt">Déployé le <p-sortIcon field="deployedAt"></p-sortIcon></th>
                    <th>Audit</th>
                    <th>Actions</th>
                </tr>
            </ng-template>
            <ng-template #body let-process>
                <tr>
                    <td style="width: 10%; min-width: 4rem;">
                        <p-tag
                            [value]="getStatusLabel(process.status)"
                            [severity]="getStatusSeverity(process.status)">
                        </p-tag>
                    </td>
                    <td style="width: 35%; min-width: 8rem;">
                        <div class="flex flex-col">
                            <span class="font-medium">{{ process.name }}</span>
                            <span class="text-sm text-muted-color">{{ process.id }}</span>
                        </div>
                    </td>
                    <td style="width: 15%; min-width: 5rem;">
                        <span class="font-medium">{{ process.version }}</span>
                    </td>
                    <td style="width: 20%; min-width: 6rem;">
                        <div class="flex flex-col">
                            <span>{{ process.deployedAt | date:'dd/MM/yyyy' }}</span>
                            <span class="text-sm text-muted-color">{{ process.deployedAt | date:'HH:mm' }}</span>
                        </div>
                    </td>
                    <td style="width: 15%; min-width: 5rem;">
                        <p-tag
                            [value]="getAuditStatusLabel(process.auditStatus)"
                            [severity]="getAuditStatusSeverity(process.auditStatus)">
                        </p-tag>
                    </td>
                    <td style="width: 15%; min-width: 6rem;">
                        <div class="flex gap-2">
                            <button
                                pButton
                                pRipple
                                type="button"
                                icon="pi pi-eye"
                                class="p-button-text p-button-sm"
                                [routerLink]="['/rpa-audit/process-detail', process.id]"
                                pTooltip="Voir les détails">
                            </button>
                            <button
                                pButton
                                pRipple
                                type="button"
                                icon="pi pi-play"
                                class="p-button-text p-button-sm"
                                [disabled]="process.auditStatus === 'in-progress'"
                                (click)="startAudit(process)"
                                pTooltip="Lancer l'audit">
                            </button>
                        </div>
                    </td>
                </tr>
            </ng-template>
        </p-table>
    </div>`
})
export class RecentSalesWidget implements OnInit {
    deployedProcesses: DeployedProcess[] = [];

    ngOnInit() {
        this.loadDeployedProcesses();
    }

    loadDeployedProcesses() {
        // Données statiques simulant les processus déployés récemment et prêts pour audit
        this.deployedProcesses = [
            {
                id: 'Process_pt085ol',
                name: 'Validation des Commandes Clients',
                version: '1.2.0',
                deployedAt: new Date(2025, 6, 30, 14, 30),
                status: 'active',
                auditStatus: 'ready'
            },
            {
                id: 'proc-hr-onboard',
                name: 'Onboarding Collaborateurs',
                version: '2.1.0',
                deployedAt: new Date(2025, 6, 29, 16, 45),
                status: 'active',
                auditStatus: 'ready'
            },
            {
                id: 'proc-finance-invoice',
                name: 'Traitement Factures Fournisseurs',
                version: '1.5.0',
                deployedAt: new Date(2025, 6, 28, 10, 15),
                status: 'active',
                auditStatus: 'in-progress',
                lastAuditDate: new Date(2025, 6, 28, 11, 0)
            },
            {
                id: 'proc-crm-lead',
                name: 'Qualification des Leads CRM',
                version: '1.0.0',
                deployedAt: new Date(2025, 6, 27, 9, 20),
                status: 'active',
                auditStatus: 'ready'
            },
            {
                id: 'proc-doc-approval',
                name: 'Workflow Approbation Documents',
                version: '1.3.0',
                deployedAt: new Date(2025, 6, 26, 13, 10),
                status: 'active',
                auditStatus: 'completed',
                lastAuditDate: new Date(2025, 6, 26, 15, 30)
            },
            {
                id: 'proc-inventory-sync',
                name: 'Synchronisation Inventaire',
                version: '2.0.0',
                deployedAt: new Date(2025, 6, 25, 11, 55),
                status: 'active',
                auditStatus: 'ready'
            }
        ];
    }

    getStatusLabel(status: string): string {
        return status === 'active' ? 'Actif' : 'Inactif';
    }

    getStatusSeverity(status: string): string {
        return status === 'active' ? 'success' : 'warning';
    }

    getAuditStatusLabel(auditStatus: string): string {
        switch (auditStatus) {
            case 'ready': return 'Prêt';
            case 'in-progress': return 'En cours';
            case 'completed': return 'Terminé';
            case 'not-started': return 'Non démarré';
            default: return 'Inconnu';
        }
    }

    getAuditStatusSeverity(auditStatus: string): string {
        switch (auditStatus) {
            case 'ready': return 'info';
            case 'in-progress': return 'warning';
            case 'completed': return 'success';
            case 'not-started': return 'secondary';
            default: return 'secondary';
        }
    }

    startAudit(process: DeployedProcess) {
        console.log('Démarrage de l\'audit pour:', process.name);
        // Logique pour démarrer l'audit du processus
        // Vous pouvez rediriger vers la page de détail ou appeler directement l'API
    }
}
