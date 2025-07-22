import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditService } from '../service/audit.service';

@Component({
  selector: 'app-actions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
      <!-- Liste des audits -->
      <ng-container *ngIf="!selectedAudit">
        <h2 class="text-3xl font-bold mb-6 text-center">Liste des Audits</h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div
            class="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl cursor-pointer w-full flex flex-col gap-4"
            *ngFor="let audit of completedAudits"
            (click)="selectAudit(audit)"
          >
            <div class="flex justify-between items-center mb-2">
              <h3 class="text-xl font-semibold">{{ audit.title }}</h3>
              <span
                class="text-sm font-medium px-3 py-1 rounded-full"
                [ngClass]="{
                  'bg-blue-100 text-blue-800': audit.status === 'En cours' && !isDarkMode(),
                  'bg-green-100 text-green-800': audit.status === 'Terminé' && !isDarkMode(),
                  'bg-blue-900 text-blue-200': audit.status === 'En cours' && isDarkMode(),
                  'bg-green-900 text-green-200': audit.status === 'Terminé' && isDarkMode()
                }"
              >
                {{ audit.status }}
              </span>
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

      <!-- Détail d'un audit -->
      <ng-container *ngIf="selectedAudit">
        <button
          (click)="selectedAudit = null"
          class="mb-4 px-4 py-2 rounded"
          [ngClass]="isDarkMode() ? 'bg-blue-800 text-white hover:bg-blue-900' : 'bg-blue-500 text-white hover:bg-blue-600'"
        >
          ← Retour à la liste
        </button>

        <div class="shadow rounded-xl p-6 max-w-4xl mx-auto bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
          <h2 class="text-2xl font-bold mb-4">Actions à corriger</h2>

          <table class="w-full border text-sm border-gray-300 dark:border-gray-700">
            <thead class="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th class="p-2 border border-gray-300 dark:border-gray-700">ID</th>
                <th class="p-2 border border-gray-300 dark:border-gray-700">Description</th>
                <th class="p-2 border border-gray-300 dark:border-gray-700">Assigné à</th>
                <th class="p-2 border border-gray-300 dark:border-gray-700">Deadline</th>
                <th class="p-2 border border-gray-300 dark:border-gray-700">Commentaire</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let row of details; let i = index">
                <td class="p-2 border border-gray-300 dark:border-gray-700">{{ i + 1 }}</td>
                <td class="p-2 border border-gray-300 dark:border-gray-700">{{ row.description }}</td>
                <td class="p-2 border border-gray-300 dark:border-gray-700">
                  <select [(ngModel)]="row.assigne" class="p-1 border rounded w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700">
                    <option disabled value="">-- Choisir --</option>
                    <option>Alice</option>
                    <option>Bob</option>
                    <option>Charlie</option>
                  </select>
                </td>
                <td class="p-2 border border-gray-300 dark:border-gray-700">
                  <input type="date" [(ngModel)]="row.deadline" class="p-1 border rounded w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"/>
                </td>
                <td class="p-2 border border-gray-300 dark:border-gray-700">
                  <input type="text" [(ngModel)]="row.commentaire" class="w-full p-1 border rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700" placeholder="Commentaire..." />
                </td>
              </tr>
            </tbody>
          </table>

          <div class="text-right mt-6">
            <button
              (click)="validerAudit()"
              class="px-6 py-2 font-semibold rounded border border-black transition-colors
                     bg-white text-blue-600 hover:bg-blue-700 hover:text-white
                     dark:bg-gray-900 dark:text-white dark:border-gray-300 dark:hover:bg-blue-800 dark:hover:text-white"
            >
              ✅ Valider
            </button>
          </div>
        </div>
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
    </div>
  `
})
export class Actions {
  audits: any[] = [];
  completedAudits: any[] = [];
  selectedAudit: any = null;
  details: any[] = [];
  private sessionDetails: { [auditId: string]: any[] } = {};
  showModal = false;
  constructor(private auditService: AuditService) {}

  ngOnInit() {
    this.audits = this.auditService.getAudits();
    this.completedAudits = this.audits.filter(audit => this.calculateProgress(audit) === 100 && this.calculateConformity(audit) < 100);
  }

  isDarkMode(): boolean {
    return document.documentElement.classList.contains('app-dark');
  }

  selectAudit(audit: any) {
    this.selectedAudit = audit;
    const auditId = audit.id || audit.title;
    if (this.sessionDetails[auditId]) {
      this.details = JSON.parse(JSON.stringify(this.sessionDetails[auditId]));
    } else {
      this.details = [
        ...audit.items
          .filter((item: any) => item.response && item.response !== 'OK')
          .map((item: any) => ({
            description: item.question,
            assigne: '',
            deadline: '',
            commentaire: item.commentaire || ''
          })),
        ...audit.technical
          .filter((item: any) => item.response && item.response !== 'OK')
          .map((item: any) => ({
            description: item.question,
            assigne: '',
            deadline: '',
            commentaire: item.commentaire || ''
          }))
      ];
    }
  }

  validerAudit() {
    const auditId = this.selectedAudit.id || this.selectedAudit.title;
    this.sessionDetails[auditId] = JSON.parse(JSON.stringify(this.details));
    this.showModal = true;

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
}