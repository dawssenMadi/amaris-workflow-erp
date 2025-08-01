import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    standalone: true,
    selector: 'app-stats-widget',
    imports: [CommonModule],
    template: `
        <!-- Audits Réalisés -->
        <div class="col-span-12 lg:col-span-6 xl:col-span-4">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Audits Réalisés</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">28</div>
                    </div>
                    <div class="flex items-center justify-center bg-green-100 dark:bg-green-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-check-circle text-green-500 !text-xl"></i>
                    </div>
                </div>
                <span class="text-green-500 font-medium">+12% </span>
                <span class="text-muted-color">ce mois-ci</span>
            </div>
        </div>

        <!-- Taux de Conformité Global -->
        <div class="col-span-12 lg:col-span-6 xl:col-span-4">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Taux de Conformité Global</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">87.5%</div>
                    </div>
                    <div class="flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-chart-line text-orange-500 !text-xl"></i>
                    </div>
                </div>
                <span class="text-orange-500 font-medium">+5.2% </span>
                <span class="text-muted-color">d'amélioration</span>
            </div>
        </div>

        <!-- Actions Planifiées -->
        <div class="col-span-12 lg:col-span-6 xl:col-span-4">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Actions Planifiées</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">42</div>
                    </div>
                    <div class="flex items-center justify-center bg-purple-100 dark:bg-purple-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-list text-purple-500 !text-xl"></i>
                    </div>
                </div>
                <span class="text-purple-500 font-medium">18 prioritaires </span>
                <span class="text-muted-color">cette semaine</span>
            </div>
        </div>

        <!-- Actions en Cours -->
        <div class="col-span-12 lg:col-span-6 xl:col-span-4">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Actions en Cours</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">23</div>
                    </div>
                    <div class="flex items-center justify-center bg-cyan-100 dark:bg-cyan-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-spin pi-cog text-cyan-500 !text-xl"></i>
                    </div>
                </div>
                <span class="text-cyan-500 font-medium">7 en retard </span>
                <span class="text-muted-color">nécessitent attention</span>
            </div>
        </div>

        <!-- Actions Réalisées -->
        <div class="col-span-12 lg:col-span-6 xl:col-span-4">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Actions Réalisées</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">156</div>
                    </div>
                    <div class="flex items-center justify-center bg-teal-100 dark:bg-teal-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-check text-teal-500 !text-xl"></i>
                    </div>
                </div>
                <span class="text-teal-500 font-medium">89% succès </span>
                <span class="text-muted-color">de réalisation</span>
            </div>
        </div>

        <!-- Nombre d'Articles -->
        <div class="col-span-12 lg:col-span-6 xl:col-span-4">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Articles Wiki</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">127</div>
                    </div>
                    <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-file-text text-blue-500 !text-xl"></i>
                    </div>
                </div>
                <span class="text-blue-500 font-medium">8 nouveaux </span>
                <span class="text-muted-color">ce mois-ci</span>
            </div>
        </div>
    `
})
export class StatsWidget {}
