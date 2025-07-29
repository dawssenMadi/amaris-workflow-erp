import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditService } from '../service/audit.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-start-audit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen p-6 flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div class="w-full max-w-2xl">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4 shadow-lg">
            <span class="text-white text-2xl font-bold">✓</span>
          </div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Initialiser un Nouvel Audit</h1>
          <p class="text-gray-600 dark:text-gray-300 text-lg">Configurez les paramètres de votre audit en quelques étapes simples</p>
        </div>

        <div class="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg dark:shadow-gray-900">
          <div class="bg-gradient-to-r from-blue-600 to-indigo-600 h-1">
            <div
              class="bg-gradient-to-r from-green-400 to-blue-500 h-full transition-all duration-500 ease-out"
              [style.width.%]="progressPercentage"
            ></div>
          </div>

          <div class="p-8 space-y-8">
            <div>
              <label class="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                <span class="w-4 h-4 mr-2 text-blue-600 font-bold">👤</span> Audité
              </label>
              <div class="relative">
                <input
                  type="text"
                  [value]="userInfo.firstName + ' ' + userInfo.lastName || 'Utilisateur connecté'"
                  class="w-full p-4 pl-12 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 font-medium cursor-not-allowed"
                  disabled
                />
                <span class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">👤</span>
                <div class="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-500 text-lg">✓</div>
              </div>
            </div>

            <div>
              <label class="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                <span class="w-4 h-4 mr-2 text-blue-600 font-bold">🏢</span> Domaine
              </label>
              <div class="relative">
                <select [(ngModel)]="setupData.type" class="w-full p-4 pl-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 font-medium">
                  <option value="">Sélectionnez le domaine</option>
                  <option *ngFor="let dom of domains" [value]="dom">{{ dom }}</option>
                </select>
                <span class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">🏢</span>
                <div *ngIf="setupData.type" class="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-500 text-lg">✓</div>
              </div>
              <p *ngIf="setupData.type" class="text-xs text-green-600 dark:text-green-300 mt-2 pl-12 font-medium">
                ✓ Domaine sélectionné: {{ setupData.type }}
              </p>
            </div>

            <div>
              <label class="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                <span class="w-4 h-4 mr-2 text-blue-600 font-bold">⚙️</span> Processus
              </label>
              <div class="relative">
                <select [(ngModel)]="setupData.department" class="w-full p-4 pl-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 font-medium">
                  <option value="">Sélectionnez le processus</option>
                  <option *ngFor="let dep of departments" [value]="dep">{{ dep }}</option>
                </select>
                <span class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">⚙️</span>
                <div *ngIf="setupData.department" class="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-500 text-lg">✓</div>
              </div>
              <p *ngIf="setupData.department" class="text-xs text-green-600 dark:text-green-300 mt-2 pl-12 font-medium">
                ✓ Processus sélectionné: {{ setupData.department }}
              </p>
            </div>

            <div class="mt-10 pt-6 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div class="text-sm text-gray-500 dark:text-gray-300">
                <span *ngIf="isFormValid" class="text-green-600 dark:text-green-300 font-medium flex items-center"><span class="mr-1">✓</span>Prêt à continuer</span>
                <span *ngIf="!isFormValid">Veuillez remplir tous les champs requis</span>
              </div>

              <div class="flex items-center gap-4">
                <button (click)="cancelStartAudit()" class="px-8 py-3 rounded-xl font-semibold bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600">
                  ✕ Annuler
                </button>
                <button
                  [disabled]="!isFormValid"
                  (click)="completeAuditSetup()"
                  [ngClass]="isFormValid 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:scale-105 shadow-lg'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'"
                  class="px-8 py-3 rounded-xl font-semibold transition-all duration-200 transform"
                >
                  Continuer →
                </button>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="isFormValid" class="mt-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-green-200 dark:border-green-700">
          <h3 class="font-semibold text-gray-900 dark:text-gray-100 mb-3">Résumé de l'audit</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span class="text-gray-600 dark:text-gray-300">Audité:</span>
              <p class="font-medium text-gray-900 dark:text-gray-100">{{ userInfo.firstName }} {{ userInfo.lastName }}</p>
            </div>
            <div>
              <span class="text-gray-600 dark:text-gray-300">Domaine:</span>
              <p class="font-medium text-gray-900 dark:text-gray-100">{{ setupData.type }}</p>
            </div>
            <div>
              <span class="text-gray-600 dark:text-gray-300">Processus:</span>
              <p class="font-medium text-gray-900 dark:text-gray-100">{{ setupData.department }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class StartAuditComponent {
  constructor(private auditService: AuditService, private router: Router) {}

  userInfo = {
    firstName: 'Ayoub',
    lastName: 'BEN KHIROUN',
  };

  setupData = {
    type: '',
    department: '',
  };

  domains = ['Informatique', 'RH', 'Qualité', 'Sécurité'];
  departments = ['Développement', 'Support', 'Maintenance'];

  get isFormValid(): boolean {
    return this.setupData.type !== '' && this.setupData.department !== '';
  }

  get progressPercentage(): number {
    let filled = 0;
    if (this.setupData.type) filled++;
    if (this.setupData.department) filled++;
    return (filled / 2) * 100;
  }

  cancelStartAudit(): void {
    this.setupData = { type: '', department: '' };
  }

  completeAuditSetup(): void {
    const newAudit = {
      title: 'AUDIT ' + new Date().getTime(),
      auditor: 'AYOUB BEN KHIROUN',
      auditee: `${this.userInfo.firstName} ${this.userInfo.lastName}`,
      type: this.setupData.type,
      department: this.setupData.department,
    };

    this.auditService.addAudit(newAudit);
    this.router.navigate(['/uikit/audit']);
  }
}