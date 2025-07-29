import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import { CalendarOptions } from '@fullcalendar/core';
interface Audit {
    id?: number;
    domain?: string;
    processus?: string;
    datePrevue?: Date;
    dateRealisation?: Date;
    status?: string;
    audite?: string;
    auditeur?: string;
}

@Component({
    selector: 'app-planning',
    standalone: true,
    templateUrl: './Planning.html',
    styleUrls: ['./Planning.css'],
    imports: [
        TableModule,
        SelectModule,
        InputIconModule,
        TagModule,
        InputTextModule,
        ToastModule,
        CommonModule,
        FormsModule,
        ButtonModule,
        IconFieldModule,
        TooltipModule,
        DialogModule,
        CalendarModule,
        ConfirmDialogModule,
        FullCalendarModule
    ],
    providers: [ConfirmationService, MessageService]
})
export class Planning implements OnInit {
    audits: Audit[] = [];
    loading: boolean = true;

    domains: any[] = [];
    processus: any[] = [];
    statusOptions: any[] = [];
    auditeurs: any[] = [];

    // Modal variables
    displayModal: boolean = false;
    currentStep: number = 1;
selectedDate: Date | null = null;
selectedTime: Date | null = null;    newAudit: Audit = {};calendarPlugins = [dayGridPlugin];

events = []; // Tu peux ajouter ici des audits programmés ou horaires

onDateClick(arg: any) {
  const selectedDate = arg.date;
  this.selectedDate = selectedDate;
  this.currentStep = 2;
  this.newAudit.datePrevue = selectedDate;
}


    @ViewChild('filter') filter!: ElementRef;

    constructor(
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.initializeData();
        this.loadAudits();
    }

    initializeData() {
        this.domains = [
            { label: 'Qualité', value: 'qualite' },
            { label: 'Sécurité', value: 'securite' },
            { label: 'Environnement', value: 'environnement' },
            { label: 'Finance', value: 'finance' },
            { label: 'RH', value: 'rh' },
            { label: 'IT', value: 'it' }
        ];

        this.processus = [
            { label: 'Gestion documentaire', value: 'gestion_doc' },
            { label: 'Formation', value: 'formation' },
            { label: 'Maintenance', value: 'maintenance' },
            { label: 'Production', value: 'production' },
            { label: 'Contrôle qualité', value: 'controle_qualite' },
            { label: 'Amélioration continue', value: 'amelioration' }
        ];

        this.statusOptions = [
            { label: 'Créé', value: 'cree' },
            { label: 'En cours', value: 'en_cours' },
            { label: 'Terminé', value: 'termine' }
        ];

        this.auditeurs = [
            { label: 'Marie Martin', value: 'Marie Martin' },
            { label: 'Sophie Bernard', value: 'Sophie Bernard' },
            { label: 'Luc Robert', value: 'Luc Robert' },
            { label: 'Michel Leroy', value: 'Michel Leroy' },
            { label: 'Julie Thomas', value: 'Julie Thomas' },
            { label: 'Pierre Dubois', value: 'Pierre Dubois' },
            { label: 'Anne Moreau', value: 'Anne Moreau' }
        ];
    }

loadAudits() {
    // Laisse le tableau vide au départ
    this.audits = [];
    this.loading = false;
}

    planifierAudit() {
        this.displayModal = true;
        this.currentStep = 1;
        this.selectedDate = null;
        this.selectedTime = null;
            this.newAudit = {
            status: 'cree' // Par défaut, nouvel audit est créé
        };
    }

closeModal() {
    this.displayModal = false;
    this.currentStep = 1;
    this.selectedDate = null;
    this.selectedTime = null;
    this.newAudit = {};
}


nextStep() {
    if (this.selectedDate && this.selectedTime) {
        const combinedDateTime = new Date(this.selectedDate);
        combinedDateTime.setHours(this.selectedTime.getHours());
        combinedDateTime.setMinutes(this.selectedTime.getMinutes());
        combinedDateTime.setSeconds(0);
        this.newAudit.datePrevue = combinedDateTime;
        this.currentStep = 2;
    }
}

    previousStep() {
        this.currentStep = 1;
    }

    isFormValid(): boolean {
        return !!(
            this.newAudit.domain &&
            this.newAudit.processus &&
            this.newAudit.datePrevue &&
            this.newAudit.audite &&
            this.newAudit.auditeur
        );
    }

    validatePlanification() {
        if (this.isFormValid()) {
            // Générer un nouvel ID
            const newId = Math.max(...this.audits.map(a => a.id || 0)) + 1;
            
            const auditToAdd: Audit = {
                id: newId,
                domain: this.getDomainLabel(this.newAudit.domain!),
                processus: this.getProcessusLabel(this.newAudit.processus!),
                datePrevue: this.newAudit.datePrevue,
                dateRealisation: null,
                status: 'cree',
                audite: this.newAudit.audite,
                auditeur: this.newAudit.auditeur
            };

            this.audits = [...this.audits, auditToAdd];
            
            this.messageService.add({
                severity: 'success',
                summary: 'Succès',
                detail: 'Audit planifié avec succès'
            });

            this.closeModal();
        }
    }

    getDomainLabel(value: string): string {
        const domain = this.domains.find(d => d.value === value);
        return domain ? domain.label : value;
    }

    getProcessusLabel(value: string): string {
        const proc = this.processus.find(p => p.value === value);
        return proc ? proc.label : value;
    }

    viewAudit(audit: Audit) {
        // Fonction pour voir les détails d'un audit
        this.messageService.add({
            severity: 'info',
            summary: 'Voir Audit',
            detail: `Détails de l'audit ${audit.id}`
        });
    }

    editAudit(audit: Audit) {
        // Fonction pour modifier un audit
        this.messageService.add({
            severity: 'info',
            summary: 'Modifier Audit',
            detail: `Modification de l'audit ${audit.id}`
        });
    }

    deleteAudit(audit: Audit) {
        this.confirmationService.confirm({
            message: `Êtes-vous sûr de vouloir supprimer l'audit ${audit.id} ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                // Supprimer l'audit de la liste
                this.audits = this.audits.filter(a => a.id !== audit.id);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Supprimé',
                    detail: 'Audit supprimé avec succès'
                });
            }
        });
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    clear(table: Table) {
        table.clear();
        if (this.filter?.nativeElement) {
            this.filter.nativeElement.value = '';
        }
    }

    getStatusSeverity(status: string): string {
        switch (status) {
            case 'termine':
                return 'success';
            case 'en_cours':
                return 'warn';
            case 'cree':
                return 'info';
            default:
                return 'info';
        }
    }
}