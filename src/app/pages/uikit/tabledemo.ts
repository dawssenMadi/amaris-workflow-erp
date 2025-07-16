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
            <div class="font-semibold text-xl mb-4">Filtering</div>
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
                    <div class="flex justify-between items-center flex-column sm:flex-row">
                        <button pButton label="Clear" class="p-button-outlined mb-2" icon="pi pi-filter-slash" (click)="clear(dt1)"></button>
                        <p-iconfield iconPosition="left" class="ml-auto">
                            <p-inputicon>
                                <i class="pi pi-search"></i>
                            </p-inputicon>
                            <input pInputText type="text" (input)="onGlobalFilter(dt1, $event)" placeholder="Recherche..." />
                        </p-iconfield>
                    </div>
                </ng-template>
                <ng-template #header>
                    <tr>
                        <th style="min-width: 180px">
                            Type d'élément
                            <p-columnFilter type="text" field="elementType" display="menu" placeholder="Filtrer..." />
                        </th>
                        <th style="min-width: 180px">
                            Nom de l'élément
                            <p-columnFilter type="text" field="elementName" display="menu" placeholder="Filtrer..." />
                        </th>
                        <th style="min-width: 180px">
                            Identifiant de l'élément
                            <p-columnFilter type="text" field="elementId" display="menu" placeholder="Filtrer..." />
                        </th>
                        <th style="min-width: 200px">
                            Nom du processus
                            <p-columnFilter type="text" field="processName" display="menu" placeholder="Filtrer..." />
                        </th>
                        <th style="min-width: 180px">
                            Identifiant du processus
                            <p-columnFilter type="text" field="processId" display="menu" placeholder="Filtrer..." />
                        </th>
                        <th style="min-width: 180px">
                            Version du processus
                            <p-columnFilter type="text" field="processVersion" display="menu" placeholder="Filtrer..." />
                        </th>
                        <th style="min-width: 220px">
                            Description
                            <p-columnFilter type="text" field="description" display="menu" placeholder="Filtrer..." />
                        </th>
                        <th style="min-width: 160px">
                            Créé le
                            <p-columnFilter type="date" field="createdAt" display="menu" placeholder="Filtrer..." />
                        </th>
                        <th style="min-width: 160px">
                            Mis à jour le
                            <p-columnFilter type="date" field="updatedAt" display="menu" placeholder="Filtrer..." />
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

    @ViewChild('filter') filter!: ElementRef;

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
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    clear(table: Table) {
        table.clear();
        this.filter.nativeElement.value = '';
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
