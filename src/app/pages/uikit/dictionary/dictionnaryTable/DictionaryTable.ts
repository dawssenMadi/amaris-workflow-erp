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
import { DictionaryService, DictionaryEntry, ProcessDictionaryDto } from '../../../../layout/service/dictionary.service';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { ProcessusList } from '../ProcessusList/ProcessusList';


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
        DropdownModule,
        ProcessusList,
        
    ],
    templateUrl: './DictionaryTable.html',
    styleUrls: ['./DictionaryTable.css'],
    providers: [ConfirmationService, MessageService, DictionaryService]
})
export class DictionaryTable implements OnInit {
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
    selectedType: string[] = [];

    similarDialog: boolean = false;
    similarElementName: string = '';
    similarThreshold: number = 0.7;
    similarResults: any[] = [];
    similarLoading: boolean = false;
    similarError: string = '';

    processGroups: ProcessDictionaryDto[] = [];
    selectedProcess: ProcessDictionaryDto | null = null;

    @ViewChild('filter') filter!: ElementRef;
    @ViewChild('searchInput') searchInput!: ElementRef;
    @ViewChild('dt1') dt1!: Table;

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
        this.dictionaryService.extractBpmnData().subscribe({
        next: () => {
            this.dictionaryService.getEntriesGroupedByProcess().subscribe({
                next: (groups) => {
                    this.processGroups = groups;
                    this.loading = false;
                },
                error: () => {
                    this.processGroups = [];
                    this.loading = false;
                }
            });
        },
        error: () => {
            // Extraction failed but still try to load existing groups
            this.dictionaryService.getEntriesGroupedByProcess().subscribe({
                next: (groups) => {
                    this.processGroups = groups;
                    this.loading = false;
                },
                error: () => {
                    this.processGroups = [];
                    this.loading = false;
                }
            });
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
        this.selectedType = [];
        this.loadAllEntries();
        if (this.selectedFilterField === 'createdAt' || this.selectedFilterField === 'updatedAt') {
            this.selectedDate = null;
        } else {
            if (this.searchInput && this.searchInput.nativeElement) {
                this.searchInput.nativeElement.value = '';
            }
        }
    }

    onFilterTypeChange(table: Table) {
        // Show loader
        this.loading = true;

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
        if (this.selectedType && this.selectedType.length > 0) {
            this.dictionaryService.getEntries().subscribe({
                next: (data) => {
                    this.entries = data.filter(e => this.selectedType.includes(e.elementType));
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
                        this.selectedRow = null;
                    },
                    error: (err) => {
                        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de la mise à jour', life: 3000 });
                    }
                });
            } else {
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
            this.dialogTitle = "Ajouter une description";
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

    getTypeColor(type: string, alpha: number = 1): string {
        const colorMap: { [key: string]: string } = {
            'PROCESS': '#2563eb',
            'USER_TASK': '#0d9488',
            'SERVICE_TASK': '#6366f1',
            'BUSINESS_RULE_TASK': '#f59e42',
            'SCRIPT_TASK': '#64748b',
            'MANUAL_TASK': '#6b7280',
            'SEND_TASK': '#14b8a6',
            'RECEIVE_TASK': '#818cf8',
            'CALL_ACTIVITY': '#fbbf24',
            'SUB_PROCESS': '#10b981',
            'GATEWAY': '#f87171',
            'EVENT': '#3b82f6',
            'SEQUENCE_FLOW': '#a3a3a3',
            'VARIABLE': '#22d3ee',
            'FORM_FIELD': '#facc15',
            'CONNECTOR': '#6366f1',
            'LISTENER': '#64748b',
        };
        const hex = colorMap[type] || '#334155';
        const rgb = hex.replace('#', '').match(/.{1,2}/g)?.map(x => parseInt(x, 16)) || [51, 65, 85];
        return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`;
    }

    onTypeInputFilter(event: any) {
        const filterValue = event.filter || '';
        if (this.dt1) {
            const fakeEvent = { target: { value: filterValue } } as any;
            this.onGlobalFilter(this.dt1, fakeEvent);
        }
    }
  onSelectProcess(process: ProcessDictionaryDto) {
  this.selectedProcess = process;
  this.entries = process.elements;
}
}
