import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { SliderModule } from 'primeng/slider';
import { Table, TableModule } from 'primeng/table';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RatingModule } from 'primeng/rating';
import { RippleModule } from 'primeng/ripple';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { TagModule } from 'primeng/tag';
import { DictionaryService, DictionaryEntry } from '../../layout/service/dictionary.service';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';

interface expandedRows {
    [key: string]: boolean;
}

@Component({
    selector: 'app-table-demo',
    standalone: true,
    imports: [
        TableModule,
        MultiSelectModule,
        SelectModule,
        InputIconModule,
        TagModule,
        InputTextModule,
        SliderModule,
        ToggleButtonModule,
        ToastModule,
        CommonModule,
        FormsModule,
        ButtonModule,
        RatingModule,
        RippleModule,
        IconFieldModule,
        TooltipModule,
        ConfirmDialogModule,
        DialogModule,
        DropdownModule
    ],
    template: ` <div class="card">
            <div class="font-semibold text-xl mb-4"></div>
            <p-table
                #dt1
                [value]="entries"
                [loading]="loading"
                [paginator]="true"
                [rows]="10"
                [showGridlines]="true"
                [rowHover]="true"
                responsiveLayout="scroll"
                scrollable="true"
                scrollHeight="400px"
                [globalFilterFields]="['elementType', 'elementName', 'elementId', 'processName', 'processId', 'processVersion', 'description', 'createdAt', 'updatedAt']"
            >
                <ng-template #caption>
                    <div class="flex justify-between items-center flex-column sm:flex-row gap-2">
                        <div>
                           <button pButton label="Effacer" class="p-button-outlined mb-2" icon="pi pi-filter-slash" (click)="clear(dt1)"></button>
                           <button pButton label="Ajouter un élément" class="p-button-outlined mb-2 ml-2" icon="pi pi-plus" (click)="openNew()"></button>
                          <p-dropdown 
                              [options]="elementTypeOptions" 
                              [(ngModel)]="selectedType" 
                              (onChange)="onTypeChange()"
                              placeholder="Filtrer par type" 
                              [showClear]="true"
                              class="ml-2">
                          </p-dropdown>
                        </div>
                        <div class="flex items-center gap-2 ml-auto">
                            <p-iconfield iconPosition="left">
                                <p-inputicon>
                                    <i class="pi pi-search"></i>
                                </p-inputicon>
                                <input pInputText type="text" #searchInput (input)="onGlobalFilter(dt1, $event)" placeholder="Recherche..." />
                            </p-iconfield>
                        </div>
                    </div>
                </ng-template>
                <ng-template #header>
                    <tr>
                        <th *ngIf="selectedRow" style="min-width: 130px; text-align: left;">Actions</th>
                        <th style="min-width: 180px">
                            Type d'élément
                        </th>
                        <th style="min-width: 180px">
                            Nom de l'élément
                        </th>
                        <th style="min-width: 180px">
                            Identifiant de l'élément
                        </th>
                        <th style="min-width: 200px">
                            Nom du processus
                        </th>
                        <th style="min-width: 220px">
                            Identifiant du processus
                        </th>
                        <th style="min-width: 200px">
                            Version du processus
                        </th>
                        <th style="min-width: 220px">
                            Description
                        </th>
                        <th style="min-width: 160px">
                            Créé le
                        </th>
                        <th style="min-width: 160px">
                            Mis à jour le
                        </th>
                    </tr>
                </ng-template>
                <ng-template #body let-entry>
                    <tr
                        (click)="onRowSelect(entry)"
                        [class.selected-row-light]="selectedRow === entry"
                        [class.row-hover]="selectedRow !== entry"
                    >
                        <td *ngIf="selectedRow" class="action-cell">
                            <ng-container *ngIf="selectedRow === entry; else emptyCell">
                                <button pButton icon="pi pi-pencil" class="p-button-rounded p-button-text p-button-sm" pTooltip="Modifier" tooltipPosition="top" (click)="onUpdateSelected($event)"></button>
                                <button pButton icon="pi pi-trash" class="p-button-rounded p-button-text p-button-sm" pTooltip="Supprimer" tooltipPosition="top" (click)="onDeleteSelected($event)"></button>
                                <button pButton icon="pi pi-search" class="p-button-rounded p-button-text p-button-sm" pTooltip="Trouver similaire" tooltipPosition="top" (click)="onFindSimilarSelected($event)"></button>
                            </ng-container>
                            <ng-template #emptyCell></ng-template>
                        </td>
                        <td>{{ entry.elementType }}</td>
                        <td>{{ entry.elementName }}</td>
                        <td>{{ entry.elementId }}</td>
                        <td>{{ entry.processName }}</td>
                        <td>{{ entry.processId }}</td>
                        <td>{{ entry.processVersion }}</td>
                        <td>{{ entry.description }}</td>
                        <td>{{ entry.createdAt | date: 'dd/MM/yyyy HH:mm' }}</td>
                        <td>{{ entry.updatedAt | date: 'dd/MM/yyyy HH:mm' }}</td>
                    </tr>
                </ng-template>
                <ng-template #emptymessage>
                    <tr>
                        <td [attr.colspan]="selectedRow ? 10 : 9">Aucun élément trouvé.</td>
                    </tr>
                </ng-template>
                <ng-template #loadingbody>
                    <tr>
                        <td [attr.colspan]="selectedRow ? 10 : 9">Chargement des données. Veuillez patienter.</td>
                    </tr>
                </ng-template>
            </p-table>
            <p-confirmDialog></p-confirmDialog>

            <p-dialog [(visible)]="entryDialog" [style]="{width: '70vw', 'max-width': '600px'}" [header]="dialogTitle" [modal]="true" class="p-fluid">
                <ng-template pTemplate="content">
                    <div class="p-formgrid grid">
                        <div class="field col-12 md:col-6">
                            <label for="elementType">Type d'élément</label>
                            <p-dropdown id="elementType" [options]="elementTypeOptions" [(ngModel)]="entry.elementType" placeholder="Sélectionnez un type" [required]="true"></p-dropdown>
                            <small class="p-error" *ngIf="submitted && !entry.elementType">Le type d'élément est requis.</small>
                        </div>
                        <div class="field col-12 md:col-6">
                            <label for="elementName">Nom de l'élément</label>
                            <input type="text" pInputText id="elementName" [(ngModel)]="entry.elementName" required />
                            <small class="p-error" *ngIf="submitted && !entry.elementName">Le nom de l'élément est requis.</small>
                        </div>
                        <div class="field col-12 md:col-6">
                            <label for="elementId">ID de l'élément</label>
                            <input type="text" pInputText id="elementId" [(ngModel)]="entry.elementId" />
                        </div>
                        <div class="field col-12 md:col-6">
                            <label for="processName">Nom du processus</label>
                            <input type="text" pInputText id="processName" [(ngModel)]="entry.processName" />
                        </div>
                        <div class="field col-12 md:col-6">
                            <label for="processId">ID du processus</label>
                            <input type="text" pInputText id="processId" [(ngModel)]="entry.processId" />
                        </div>
                        <div class="field col-12 md:col-6">
                            <label for="processVersion">Version du processus</label>
                            <input type="text" pInputText id="processVersion" [(ngModel)]="entry.processVersion" />
                        </div>
                        <div class="field col-12">
                            <label for="description">Description (Optionnel)</label>
                            <textarea id="description" pInputTextarea [(ngModel)]="entry.description" rows="3" cols="20"></textarea>
                        </div>
                    </div>
                </ng-template>

                <ng-template pTemplate="footer">
                    <button pButton pRipple label="Annuler" icon="pi pi-times" class="p-button-outlined" (click)="hideDialog()"></button>
                    <button pButton pRipple label="Enregistrer" icon="pi pi-check" (click)="saveEntry()"></button>
                </ng-template>
            </p-dialog>

            <p-dialog [(visible)]="similarDialog" [style]="{width: '800px'}" header="Trouver similaire" [modal]="true" class="p-fluid">
                <ng-template pTemplate="content">
                    <div class="field">
                        <label for="similarElementName">Nom de l'élément</label>
                        <input type="text" pInputText id="similarElementName" [(ngModel)]="similarElementName" />
                    </div>
                    <div class="field">
                        <label for="similarThreshold">Seuil de similarité</label>
                        <input type="number" pInputText id="similarThreshold" [(ngModel)]="similarThreshold" min="0" max="1" step="0.01" />
                    </div>
                    <div *ngIf="similarError" class="p-error mb-2">{{ similarError }}</div>
                    <div *ngIf="similarLoading" class="mb-2">Recherche en cours...</div>
                    <div *ngIf="similarResults.length > 0" style="display: block; width: 100%;">
                        <div *ngFor="let res of similarResults"
                             style="display: block; width: 100%; margin-bottom: 1rem; padding: 1rem; border-radius: 0.5rem; box-shadow: 0 2px 8px rgba(59,130,246,0.08); border: 1px solid #bfdbfe; background: #eff6ff; font-size: 0.92rem;">
                            <div style="color: #1e3a8a; font-weight: 600; margin-bottom: 0.5rem; font-size: 0.98rem;">{{ res.elementName }}</div>
                            <div style="margin-bottom: 0.5rem;">
                                <p-tag [value]="res.elementType" severity="info" [ngStyle]="{'font-size': '0.85em'}"></p-tag>
                            </div>
                            <div style="display: flex; gap: 0.25rem; margin-bottom: 0.5rem;">
                                <ng-container *ngFor="let dot of [].constructor(10); let i = index">
                                    <span [ngClass]="{'bg-blue-500': i < Math.round(res.similarityScorePercentage/10), 'bg-blue-100': i >= Math.round(res.similarityScorePercentage/10)}"
                                          style="display: inline-block; width: 10px; height: 10px; border-radius: 50%;"></span>
                                </ng-container>
                            </div>
                            <div style="color: #2563eb; font-weight: 500; font-size: 0.85em;">{{res.similarityScorePercentage}}%</div>
                        </div>
                    </div>
                </ng-template>
                <ng-template pTemplate="footer">
                    <button pButton pRipple label="Annuler" icon="pi pi-times" class="p-button-outlined" (click)="hideSimilarDialog()"></button>
                    <button pButton pRipple label="Confirmer" icon="pi pi-search" (click)="searchSimilar()"></button>
                </ng-template>
            </p-dialog>
        </div>`,
    styles: `
        .p-datatable-frozen-tbody {
            font-weight: bold;
        }

        .p-datatable-scrollable .p-frozen-column {
            font-weight: bold;
        }

        tr.selected-row-light {
            background: #e3f2fd !important;
            transition: background 0.3s cubic-bezier(0.4,0,0.2,1);
            cursor: pointer;
        }
        tr.selected-row-light:hover {
            background: #bbdefb !important;
        }
        tr.row-hover:hover {
            background: #e3f2fd !important;
            transition: background 0.2s;
            cursor: pointer;
        }
        .action-cell {
            min-width: 110px;
            text-align: left;
            padding-left: 8px;
            padding-right: 0;
        }
        .p-button.p-button-icon-only.p-button-rounded.p-button-text.p-button-sm {
            margin-right: 4px;
        }

        .text-overflow-ellipsis {
            display: inline-block;
            vertical-align: middle;
        }

        .bg-surface-300 {
            background-color: #e5e7eb;
        }

        .bg-blue-500 {
            background-color: #3b82f6;
        }

        .text-blue-500 {
            color: #3b82f6;
        }

        .rounded-border {
            border-radius: 4px;
        }

        /* Use ::ng-deep to ensure the style is applied inside the confirm dialog */
        ::ng-deep .p-confirm-dialog .soft-warning-icon {
            background: #fdecea !important;
            color: #f44336 !important;
            border-radius: 50%;
            font-size: 2.2em !important;
            width: 2.2em;
            height: 2.2em;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1em auto;
            box-shadow: 0 2px 8px rgba(244,67,54,0.08);
        }

        .field {
            display: flex;
            flex-direction: column;
            margin-bottom: 1rem;
        }

        .field label {
            margin-bottom: 0.5rem;
            font-weight: 500;
        }

        /* Ensure the textarea has a visible border like other inputs */
        textarea[pInputTextarea] {
          border: 1px solid var(--p-inputtext-border-color, #ced4da);
        }
    `,
    providers: [ConfirmationService, MessageService, DictionaryService]
})
export class TableDemo implements OnInit {
    Math = Math;
    entries: DictionaryEntry[] = [];
    loading: boolean = true;

    filterFields = [
        { label: "Tous les champs", value: null },
        { label: "Type d'élément", value: "elementType" },
        { label: "Nom de l'élément", value: "elementName" },
        { label: "Identifiant de l'élément", value: "elementId" },
        { label: "Nom du processus", value: "processName" },
        { label: "Identifiant du processus", value: "processId" },
        { label: "Version du processus", value: "processVersion" },
        { label: "Description", value: "description" },
        { label: "Créé le", value: "createdAt" },
        { label: "Mis à jour le", value: "updatedAt" }
    ];
    selectedFilterField: string | null = null;
    selectedDate: Date | null = null;

    selectedRow: DictionaryEntry | null = null;

    entryDialog: boolean = false;

    submitted: boolean = false;

    entry: DictionaryEntry = {} as DictionaryEntry;

    dialogTitle: string = '';

    elementTypeOptions: any[] = [];
    selectedType: string | null = null;

    // Pour le modal de similarité
    similarDialog: boolean = false;
    similarElementName: string = '';
    similarThreshold: number = 0.7;
    similarResults: any[] = [];
    similarLoading: boolean = false;
    similarError: string = '';

    @ViewChild('filter') filter!: ElementRef;
    @ViewChild('searchInput') searchInput!: ElementRef;

    constructor(private dictionaryService: DictionaryService, private confirmationService: ConfirmationService, private messageService: MessageService) {}

    ngOnInit() {
        this.elementTypeOptions = [
            { label: 'Process', value: 'PROCESS' },
            { label: 'User Task', value: 'USER_TASK' },
            { label: 'Service Task', value: 'SERVICE_TASK' },
            { label: 'Business Rule Task', value: 'BUSINESS_RULE_TASK' },
            { label: 'Script Task', value: 'SCRIPT_TASK' },
            { label: 'Manual Task', value: 'MANUAL_TASK' },
            { label: 'Send Task', value: 'SEND_TASK' },
            { label: 'Receive Task', value: 'RECEIVE_TASK' },
            { label: 'Call Activity', value: 'CALL_ACTIVITY' },
            { label: 'Sub Process', value: 'SUB_PROCESS' },
            { label: 'Gateway', value: 'GATEWAY' },
            { label: 'Event', value: 'EVENT' },
            { label: 'Sequence Flow', value: 'SEQUENCE_FLOW' },
            { label: 'Variable', value: 'VARIABLE' },
            { label: 'Form Field', value: 'FORM_FIELD' },
            { label: 'Connector', value: 'CONNECTOR' },
            { label: 'Listener', value: 'LISTENER' }
        ];

        this.loading = true;
        this.dictionaryService.getEntries().subscribe({
            next: (data) => {
                this.entries = data;
                this.loading = false;
            },
            error: (err) => {
                this.entries = [];
                this.loading = false;
            }
        });
    }

    formatCurrency(value: number) {
        return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    }

    onGlobalFilter(table: Table, event: Event) {
        const value = (event.target as HTMLInputElement).value;
        if (this.selectedFilterField) {
            table.filter(value, this.selectedFilterField, 'contains');
        } else {
            table.filterGlobal(value, 'contains');
        }
    }

    onDateFilter(table: Table, value: Date) {
        if (this.selectedFilterField) {
            table.filter(value, this.selectedFilterField, 'equals');
        }
    }

    clear(table: Table) {
        table.clear();
        this.selectedDate = null;
        this.selectedType = null;
        this.loadAllEntries();
        if (this.selectedFilterField === 'createdAt' || this.selectedFilterField === 'updatedAt') {
            // Date picker is used, clear selectedDate
            this.selectedDate = null;
        } else {
            // Text input is used, clear its value
            if (this.searchInput && this.searchInput.nativeElement) {
                this.searchInput.nativeElement.value = '';
            }
        }
    }

    onFilterTypeChange(table: Table) {
        // Show loader
        this.loading = true;

        // Simulate loading delay (e.g., 500ms)
        setTimeout(() => {
            // Clear all filters
            table.clear();

            // Get the current value of the search input
            const value = this.searchInput?.nativeElement?.value || '';

            // If a specific field is selected, filter by that field
            if (this.selectedFilterField) {
                table.filter(value, this.selectedFilterField, 'contains');
            } else {
                // Otherwise, apply global filter
                table.filterGlobal(value, 'contains');
            }

            // Hide loader
            this.loading = false;
        },500 ); 
    }

    onTypeChange() {
        this.loading = true;
        if (this.selectedType) {
            this.dictionaryService.getEntriesByType(this.selectedType).subscribe({
                next: (data) => {
                    this.entries = data;
                    this.loading = false;
                },
                error: (err) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: 'Erreur lors du filtrage par type'
                    });
                    this.loading = false;
                }
            });
        } else {
            this.loadAllEntries();
        }
    }

    loadAllEntries() {
        this.loading = true;
        this.dictionaryService.getEntries().subscribe({
            next: (data) => {
                this.entries = data;
                this.loading = false;
            },
            error: (err) => {
                this.entries = [];
                this.loading = false;
            }
        });
    }

    onRowSelect(entry: DictionaryEntry) {
        this.selectedRow = this.selectedRow === entry ? null : entry;
    }

    openNew() {
        this.dialogTitle = 'Créer un nouvel élément';
        this.entry = {} as DictionaryEntry;
        this.submitted = false;
        this.entryDialog = true;
    }

    hideDialog() {
        this.entryDialog = false;
        this.submitted = false;
    }

    saveEntry() {
        this.submitted = true;

        if (this.entry.elementName?.trim() && this.entry.elementType) {
            if (this.entry.id) {
                this.dictionaryService.updateEntry(this.entry.id, this.entry).subscribe({
                    next: (updatedEntry) => {
                        const index = this.entries.findIndex(e => e.id === updatedEntry.id);
                        this.entries[index] = updatedEntry;
                        this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Entrée mise à jour', life: 3000 });
                        this.entries = [...this.entries];
                        this.entryDialog = false;
                        this.entry = {} as DictionaryEntry;
                        this.selectedRow = null; // Hide the actions column
                    },
                    error: (err) => {
                        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de la mise à jour', life: 3000 });
                    }
                });
            } else {
                // Create a clean payload, omitting fields generated by the backend
                const { id, createdAt, updatedAt, ...newEntryPayload } = this.entry;
                this.dictionaryService.createEntry(newEntryPayload as DictionaryEntry).subscribe({
                    next: (newEntry) => {
                        this.entries.push(newEntry);
                        this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Entrée créée avec succès', life: 3000 });
                        this.entries = [...this.entries];
                        this.entryDialog = false;
                        this.entry = {} as DictionaryEntry;
                    },
                    error: (err) => {
                        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'La création de l\'entrée a échoué', life: 3000 });
                    }
                });
            }
        }
    }

    clearSelectedRow() {
        this.selectedRow = null;
    }

    onUpdateSelected(event: Event) {
        event.stopPropagation();
        if (this.selectedRow) {
            this.dialogTitle = "Modifier l'élément";
            this.entry = { ...this.selectedRow };
            this.entryDialog = true;
        }
    }

    onDeleteSelected(event: Event) {
        event.stopPropagation();
        if (!this.selectedRow) return;

        this.confirmationService.confirm({
            message: `Êtes-vous sûr de vouloir supprimer l'élément <b>${this.selectedRow.elementName}</b> ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            acceptButtonStyleClass: 'p-button-danger',
            rejectButtonStyleClass: 'p-button-secondary',
            accept: () => {
                if (!this.selectedRow) return;
                
                this.dictionaryService.deleteEntry(this.selectedRow.id).subscribe({
                    next: () => {
                        this.entries = this.entries.filter(e => e.id !== this.selectedRow?.id);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Succès',
                            detail: `L'élément '${this.selectedRow?.elementName}' a été supprimé avec succès.`
                        });
                        this.selectedRow = null;
                    },
                    error: (err) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erreur',
                            detail: `La suppression de l'élément a échoué`
                        });
                    }
                });
            }
        });
    }

    onFindSimilarSelected(event: Event) {
        event.stopPropagation();
        if (this.selectedRow) {
            this.similarElementName = this.selectedRow.elementName;
            this.similarThreshold = 0.7;
            this.similarDialog = true;
        }
    }

    hideSimilarDialog() {
        this.similarDialog = false;
        this.similarResults = [];
        this.similarError = '';
        this.similarLoading = false;
        this.similarElementName = '';
        this.similarThreshold = 0.7;
    }

    searchSimilar() {
        this.similarLoading = true;
        this.similarError = '';
        this.similarResults = [];
        this.dictionaryService.searchSimilarEntries(this.similarElementName, this.similarThreshold).subscribe({
            next: (results) => {
                this.similarResults = results.map(res => ({
                    ...res,
                    similarityScorePercentage: Math.round(res.similarityScore * 100)
                }));
                this.similarLoading = false;
            },
            error: (err) => {
                this.similarError = 'Erreur lors de la recherche de similarité';
                this.similarLoading = false;
            }
        });
    }

    getSeverity(status: string) {
        switch (status) {
            case 'qualified':
            case 'instock':
            case 'INSTOCK':
            case 'DELIVERED':
            case 'delivered':
                return 'success';

            case 'negotiation':
            case 'lowstock':
            case 'LOWSTOCK':
            case 'PENDING':
            case 'pending':
                return 'warn';

            case 'unqualified':
            case 'outofstock':
            case 'OUTOFSTOCK':
            case 'CANCELLED':
            case 'cancelled':
                return 'danger';

            default:
                return 'info';
        }
    }
}
