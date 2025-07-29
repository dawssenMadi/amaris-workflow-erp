import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditService } from '../service/audit.service';

@Component({
  selector: 'app-audits',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
      <h2 class="text-3xl font-bold mb-6 text-center">Mes Audits</h2>

      <ng-container *ngIf="viewMode === 'list'; else editorView">
        <div id="print-section" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div
            class="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl cursor-pointer w-full flex flex-col gap-4"
            *ngFor="let audit of audits"
            (click)="selectAudit(audit)"
          >
            <div class="flex justify-between items-center mb-2">
              <h3 class="text-xl font-semibold">{{ audit.title }}</h3>
              <span class="text-sm font-medium px-3 py-1 rounded-full"
                [ngClass]="{
                  'bg-blue-100 text-blue-800': audit.status === 'En cours' && !isDarkMode(),
                  'bg-green-100 text-green-800': audit.status === 'Terminé' && !isDarkMode(),
                  'bg-blue-900 text-blue-200': audit.status === 'En cours' && isDarkMode(),
                  'bg-green-900 text-green-200': audit.status === 'Terminé' && isDarkMode()
                }"
              >{{ audit.status }}</span>
            </div>
            <div class="flex flex-wrap gap-6 text-sm font-semibold">
              <div>📋 <strong>Audit:</strong> {{ audit.title }}</div>
              <div>👤 <strong>Auditeur:</strong> {{ audit.auditor }}</div>
              <div>🧑‍💼 <strong>Audité:</strong> {{ audit.auditee }}</div>
              <div>📅 <strong>Date:</strong> {{ audit.date }}</div>
              <div>✅ <strong>Conformité:</strong> {{ calculateConformity(audit) }}%</div>
            </div>
            <div class="mt-2">
              <div class="text-xs mb-1" [ngClass]="isDarkMode() ? 'text-gray-300' : 'text-gray-600'">📊 Progression</div>
              <div [ngClass]="isDarkMode() ? 'bg-gray-700' : 'bg-gray-200'" class="w-full rounded-full h-2 overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                  [style.width.%]="calculateProgress(audit)"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </ng-container>

      <ng-template #editorView>
        <div id="editor-section" class="max-w-5xl mx-auto bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-6 rounded-xl shadow space-y-6">
          <div class="flex justify-between items-center">
            <input
              class="text-xl font-bold border-b w-full mr-4 outline-none bg-transparent dark:bg-transparent"
              [(ngModel)]="currentAudit.title"
            />
            <button class="text-sm text-blue-600 hover:underline" (click)="viewMode = 'list'; resetSelection()">
              ⬅ Retour
            </button>
          </div>

          <div class="text-sm" [ngClass]="isDarkMode() ? 'text-gray-300' : 'text-gray-600'">
            <div><strong>Auditeur:</strong> {{ currentAudit.auditor }}</div>
            <div><strong>Audité:</strong> {{ currentAudit.auditee }}</div>
            <div><strong>Date:</strong> {{ currentAudit.date }}</div>
            <div><strong>Statut:</strong> {{ currentAudit.status }}</div>
          </div>

          <ng-container *ngFor="let table of ['model', 'tech']">
            <h4 class="font-semibold text-lg text-gray-800 dark:text-gray-200 mt-4">
              {{ table === 'model' ? 'Modélisation' : 'Migration' }}
            </h4>
            <table class="w-full border border-gray-300 dark:border-gray-700 text-sm">
              <thead>
                <tr class="bg-gray-50 dark:bg-gray-700 text-left">
                  <th class="p-2 border-b border-gray-300 dark:border-gray-700">No</th>
                  <th class="p-2 border-b border-gray-300 dark:border-gray-700">Règle</th>
                  <th class="p-2 border-b border-gray-300 dark:border-gray-700">Réponse</th>
                  <th class="p-2 border-b border-gray-300 dark:border-gray-700">Commentaire</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  *ngFor="let item of table === 'model' ? currentAudit.items : currentAudit.technical; let i = index"
                  [class.bg-blue-100]="selectedRow.table === table && selectedRow.index === i && !isDarkMode()"
                  [class.bg-blue-900]="selectedRow.table === table && selectedRow.index === i && isDarkMode()"
                  (click)="selectRow(table, i)"
                  class="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <td class="p-2">{{ item.no }}</td>
                  <td class="p-2">{{ item.question }}</td>
                  <td class="p-2 text-center">
                    <span
                      class="inline-block px-2 py-1 rounded font-medium"
                      [ngClass]="responseClass(item.response)"
                    >
                      {{ item.response || '—' }}
                    </span>
                  </td>
                  <td class="p-2">
                    <input
                      class="w-full p-1 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                      [(ngModel)]="item.commentaire"
                      placeholder="Ajouter un commentaire"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </ng-container>
<div
    *ngIf="showModal"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
  >
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-sm w-full text-center">
      <div class="text-3xl mb-4 text-green-500">✔️</div>
      <div class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Modifications enregistrées pour cette session
      </div>
      <button
        (click)="showModal = false"
        class="mt-2 px-6 py-2 rounded font-semibold border border-blue-600 bg-white text-blue-600 hover:bg-blue-600 hover:text-white transition-colors
               dark:bg-gray-900 dark:text-white dark:border-blue-300 dark:hover:bg-blue-800 dark:hover:text-white"
      >
        OK
      </button>
    </div>
  </div>
          <div class="flex justify-between items-center border-t pt-4 mt-6 border-gray-300 dark:border-gray-700">
            <button
              class="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded"
              (click)="terminateAudit()"
            >
              ✅ Terminer l’audit
            </button>
            <button
              class="border border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-200 px-6 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
              (click)="printAudit()"
            >
              🖨️ Imprimer
            </button>
          </div>
        </div>

        <div class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-300 dark:border-gray-700 shadow p-4 flex flex-col items-center">
          <div class="mb-2 text-sm text-gray-700 dark:text-gray-200">
            <span *ngIf="selectedRow.index !== null">
              Ligne {{ selectedRow.index + 1 }} –
              {{ selectedRow.table === 'model' ? 'Modélisation' : 'Migration' }} :
              Choisissez une réponse
            </span>
            <span *ngIf="selectedRow.index === null">Aucune ligne sélectionnée</span>
          </div>
          <div class="flex gap-3">
            <button class="px-3 py-2 rounded border text-sm font-semibold bg-green-100 dark:bg-green-900" (click)="setResponse('OK')" [disabled]="!isRowSelected()">👍 OK</button>
            <button class="px-3 py-2 rounded border text-sm font-semibold bg-red-100 dark:bg-red-900" (click)="setResponse('NOT OK')" [disabled]="!isRowSelected()">👎 NOT OK</button>
            <button class="px-3 py-2 rounded border text-sm font-semibold bg-yellow-100 dark:bg-yellow-900" (click)="setResponse('NC')" [disabled]="!isRowSelected()">⚠ NC</button>
            <button class="px-3 py-2 rounded border text-sm font-semibold bg-gray-100 dark:bg-gray-700" (click)="setResponse('NA')" [disabled]="!isRowSelected()">🚫 NA</button>
          </div>
        </div>
        <div class="pb-28"></div>
      </ng-template>
    </div>
  `
})
export class AuditsComponent implements OnInit {
  viewMode: 'list' | 'editor' = 'list';
  audits: any[] = [];
  currentAudit: any = null;
  selectedRow = { table: '', index: null as number | null };
  showModal = false;

  constructor(private auditService: AuditService) {}

  ngOnInit() {
    this.audits = this.auditService.getAudits();
  }

  isDarkMode(): boolean {
    return document.documentElement.classList.contains('app-dark');
  }

  selectAudit(audit: any) {
    this.currentAudit = JSON.parse(JSON.stringify(audit));
    this.viewMode = 'editor';
    this.selectedRow = { table: 'model', index: 0 };
  }

  resetSelection() {
    this.selectedRow = { table: '', index: null };
  }

  selectRow(table: string, index: number) {
    this.selectedRow = { table, index };
  }

  isRowSelected(): boolean {
    return this.selectedRow.index !== null;
  }

  setResponse(response: string) {
    const table = this.selectedRow.table === 'model' ? this.currentAudit.items : this.currentAudit.technical;
    const index = this.selectedRow.index!;
    table[index].response = response;

    if (index + 1 < table.length) {
      this.selectedRow.index = index + 1;
    } else if (this.selectedRow.table === 'model') {
      this.selectedRow = { table: 'tech', index: 0 };
    } else {
      this.selectedRow = { table: '', index: null };
    }
  }

  terminateAudit() {
    this.currentAudit.status = 'Terminé';
    this.currentAudit.validatedAt = new Date().toISOString();
    this.auditService.updateAudit(this.currentAudit);
    this.showModal = true;
  }

  printAudit() {
    let printContents = '';
    if (this.viewMode === 'list') {
      printContents = document.getElementById('print-section')?.innerHTML || '';
    } else if (this.viewMode === 'editor') {
      printContents = document.getElementById('editor-section')?.innerHTML || '';
    }
    if (!printContents) return;
    const popupWin = window.open('', '_blank', 'width=800,height=600');
    if (popupWin) {
      popupWin.document.open();
      popupWin.document.write(`
        <html>
          <head>
            <title>Impression Audits</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
            </style>
          </head>
          <body>
            ${printContents}
          </body>
        </html>
      `);
      popupWin.document.close();
      popupWin.focus();
      popupWin.print();
      popupWin.close();
    } else {
      alert('Impossible d\'ouvrir la fenêtre d\'impression.');
    }
  }

  calculateProgress(audit: any): number {
    const total = audit.items.length + audit.technical.length;
    const answered = [...audit.items, ...audit.technical].filter(q => q.response).length;
    return total ? Math.round((answered / total) * 100) : 0;
  }

  calculateConformity(audit: any): number {
    const total = audit.items.length + audit.technical.length;
    const okCount = [...audit.items, ...audit.technical].filter(q => q.response === 'OK').length;
    return total ? Math.round((okCount / total) * 100) : 0;
  }

  responseClass(response: string) {
    if (!response) return '';
    if (response === 'OK') return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
    if (response === 'NOT OK') return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
    if (response === 'NC') return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
    if (response === 'NA') return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    return '';
  }
}