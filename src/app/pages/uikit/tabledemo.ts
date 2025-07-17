import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { SliderModule } from 'primeng/slider';
import { Table, TableModule } from 'primeng/table';
import { ProgressBarModule } from 'primeng/progressbar';
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
        ProgressBarModule,
        ToggleButtonModule,
        ToastModule,
        CommonModule,
        FormsModule,
        ButtonModule,
        RatingModule,
        RippleModule,
        IconFieldModule
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
                        <button pButton label="Effacer" class="p-button-outlined mb-2" icon="pi pi-filter-slash" (click)="clear(dt1)"></button>
                        <div class="flex items-center gap-2 ml-auto">
                            <p-iconfield iconPosition="left">
                                <p-inputicon>
                                    <i class="pi pi-search"></i>
                                </p-inputicon>
                                <input pInputText type="text" #searchInput (input)="onGlobalFilter(dt1, $event)" placeholder="Recherche..." />
                            </p-iconfield>
                            <p-select
                                [(ngModel)]="selectedFilterField"
                                [options]="filterFields"
                                optionLabel="label"
                                optionValue="value"
                                [style]="{ 'min-width': '180px' }"
                                placeholder="Filtrer par..."
                                (onChange)="onFilterTypeChange(dt1)"
                            />
                        </div>
                    </div>
                </ng-template>
                <ng-template #header>
                    <tr>
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
                    <tr>
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
                        <td colspan="9">Aucun élément trouvé.</td>
                    </tr>
                </ng-template>
                <ng-template #loadingbody>
                    <tr>
                        <td colspan="9">Chargement des données. Veuillez patienter.</td>
                    </tr>
                </ng-template>
            </p-table>
        </div>`,
    styles: `
        .p-datatable-frozen-tbody {
            font-weight: bold;
        }

        .p-datatable-scrollable .p-frozen-column {
            font-weight: bold;
        }
    `,
    providers: [ConfirmationService, MessageService, DictionaryService]
})
export class TableDemo implements OnInit {
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

    @ViewChild('filter') filter!: ElementRef;
    @ViewChild('searchInput') searchInput!: ElementRef;

    constructor(private dictionaryService: DictionaryService) {}

    ngOnInit() {
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
