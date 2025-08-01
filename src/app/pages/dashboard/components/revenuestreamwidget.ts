import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { RouterModule } from '@angular/router';
import { RippleModule } from 'primeng/ripple';

interface WikiArticle {
    id: string;
    title: string;
    author: string;
    authorAvatar?: string;
    category: string;
    publishedAt: Date;
    readTime: number;
    status: 'published' | 'draft' | 'reviewed';
    excerpt: string;
    tags: string[];
    views?: number;
    likes?: number;
}

@Component({
    standalone: true,
    selector: 'app-revenue-stream-widget',
    imports: [CommonModule, ButtonModule, TagModule, AvatarModule, RouterModule, RippleModule],
    template: `<div class="card !mb-8 !p-0 overflow-hidden">
        <!-- En-tête simplifié -->
        <div class="bg-surface-50 dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700 px-6 py-4">
            <div class="flex justify-between items-center">
                <div>
                    <h2 class="text-xl font-semibold text-surface-900 dark:text-surface-0 mb-1">Articles Wiki Récents</h2>
                    <p class="text-surface-600 dark:text-surface-400 text-sm">Découvrez les dernières documentations</p>
                </div>
                <button
                    pButton
                    pRipple
                    type="button"
                    label="Voir tout"
                    icon="pi pi-external-link"
                    class="p-button-outlined p-button-sm"
                    [routerLink]="['/wiki']">
                </button>
            </div>
        </div>

        <!-- Liste des articles -->
        <div class="p-6">
            <div class="space-y-4">
                <div
                    *ngFor="let article of recentArticles"
                    class="group bg-surface-0 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg p-4 hover:shadow-md hover:border-surface-300 dark:hover:border-surface-600 transition-all duration-200 cursor-pointer"
                    [routerLink]="['/wiki/article', article.id]"
                    pRipple>

                    <div class="flex items-start gap-4">
                        <!-- Avatar simplifié -->
                        <p-avatar
                            [label]="getAuthorInitials(article.author)"
                            [image]="article.authorAvatar"
                            shape="circle"
                            size="normal"
                            styleClass="bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300">
                        </p-avatar>

                        <!-- Contenu principal -->
                        <div class="flex-1 min-w-0">
                            <!-- En-tête avec statut -->
                            <div class="flex items-start justify-between gap-3 mb-2">
                                <h3 class="font-semibold text-surface-900 dark:text-surface-0 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                    {{ article.title }}
                                </h3>
                                <div class="flex-shrink-0 flex flex-col items-end gap-2">
                                    <p-tag
                                        [value]="getStatusLabel(article.status)"
                                        [severity]="getStatusSeverity(article.status)"
                                        styleClass="text-xs">
                                    </p-tag>
                                    <div class="text-xs text-surface-500 dark:text-surface-400">
                                        {{ article.publishedAt | date:'dd/MM/yyyy' }}
                                    </div>
                                </div>
                            </div>

                            <!-- Métadonnées simplifiées -->
                            <div class="flex items-center gap-4 text-sm text-surface-600 dark:text-surface-400 mb-3">
                                <span class="flex items-center gap-1">
                                    <i class="pi pi-user text-xs"></i>
                                    {{ article.author }}
                                </span>
                                <span class="flex items-center gap-1">
                                    <i class="pi pi-folder text-xs"></i>
                                    {{ article.category }}
                                </span>
                                <span class="flex items-center gap-1">
                                    <i class="pi pi-clock text-xs"></i>
                                    {{ article.readTime }} min
                                </span>
                            </div>

                            <!-- Extrait -->
                            <p class="text-sm text-surface-600 dark:text-surface-400 line-clamp-2 mb-3">
                                {{ article.excerpt }}
                            </p>

                            <!-- Tags et statistiques -->
                            <div class="flex items-center justify-between">
                                <div class="flex flex-wrap gap-2">
                                    <span
                                        *ngFor="let tag of article.tags.slice(0, 3)"
                                        class="inline-flex items-center px-2 py-1 rounded text-xs bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300">
                                        #{{ tag }}
                                    </span>
                                    <span
                                        *ngIf="article.tags.length > 3"
                                        class="inline-flex items-center px-2 py-1 rounded text-xs bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300">
                                        +{{ article.tags.length - 3 }}
                                    </span>
                                </div>

                                <!-- Statistiques -->
                                <div class="flex items-center gap-3 text-xs text-surface-500 dark:text-surface-400">
                                    <span class="flex items-center gap-1" *ngIf="article.views">
                                        <i class="pi pi-eye"></i>
                                        {{ article.views }}
                                    </span>
                                    <span class="flex items-center gap-1" *ngIf="article.likes">
                                        <i class="pi pi-heart"></i>
                                        {{ article.likes }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- Icône de navigation -->
                        <div class="flex-shrink-0">
                            <i class="pi pi-chevron-right text-surface-400 dark:text-surface-500"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Message d'état vide -->
        <div *ngIf="recentArticles.length === 0" class="text-center py-12 px-6">
            <div class="bg-surface-50 dark:bg-surface-800 rounded-lg p-8">
                <i class="pi pi-file-o text-4xl text-surface-400 dark:text-surface-500 mb-4"></i>
                <h3 class="font-semibold text-surface-700 dark:text-surface-300 mb-2">Aucun article récent</h3>
                <p class="text-surface-500 dark:text-surface-400">Les nouveaux articles du wiki apparaîtront ici</p>
            </div>
        </div>
    </div>`
})
export class RevenueStreamWidget implements OnInit {
    recentArticles: WikiArticle[] = [];

    ngOnInit() {
        this.loadRecentWikiArticles();
    }

    loadRecentWikiArticles() {
        // Données statiques simulant les derniers articles du wiki avec statistiques
        this.recentArticles = [
            {
                id: 'wiki-001',
                title: 'Guide complet d\'audit des processus BPMN',
                author: 'Sarah Martinez',
                authorAvatar: '',
                category: 'Audit & Conformité',
                publishedAt: new Date(2025, 6, 30, 16, 20),
                readTime: 8,
                status: 'published',
                excerpt: 'Ce guide détaille les meilleures pratiques pour auditer efficacement vos processus BPMN et garantir leur conformité aux standards.',
                tags: ['audit', 'bpmn', 'conformité', 'best-practices'],
                views: 245,
                likes: 18
            },
            {
                id: 'wiki-002',
                title: 'Configuration avancée de Camunda Platform 8',
                author: 'Thomas Dubois',
                authorAvatar: '',
                category: 'Configuration',
                publishedAt: new Date(2025, 6, 29, 14, 15),
                readTime: 12,
                status: 'published',
                excerpt: 'Apprenez à configurer et optimiser votre environnement Camunda Platform 8 pour des performances maximales.',
                tags: ['camunda', 'configuration', 'performance', 'zeebe', 'docker'],
                views: 189,
                likes: 12
            },
            {
                id: 'wiki-003',
                title: 'Intégration WebSocket pour le monitoring temps réel',
                author: 'Julie Chen',
                authorAvatar: '',
                category: 'Développement',
                publishedAt: new Date(2025, 6, 28, 10, 30),
                readTime: 6,
                status: 'published',
                excerpt: 'Découvrez comment implémenter une solution de monitoring temps réel avec WebSocket pour suivre vos processus.',
                tags: ['websocket', 'monitoring', 'temps-réel', 'angular'],
                views: 167,
                likes: 9
            },
            {
                id: 'wiki-004',
                title: 'Troubleshooting des erreurs communes',
                author: 'Marc Lefebvre',
                authorAvatar: '',
                category: 'Support',
                publishedAt: new Date(2025, 6, 27, 9, 45),
                readTime: 5,
                status: 'reviewed',
                excerpt: 'Un guide de résolution des erreurs les plus fréquemment rencontrées lors du déploiement et de l\'exécution des processus.',
                tags: ['troubleshooting', 'erreurs', 'support', 'debug'],
                views: 203,
                likes: 15
            }
        ];
    }

    getAuthorInitials(author: string): string {
        return author
            .split(' ')
            .map(name => name.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 2);
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case 'published': return 'Publié';
            case 'draft': return 'Brouillon';
            case 'reviewed': return 'Relu';
            default: return 'Inconnu';
        }
    }

    getStatusSeverity(status: string): string {
        switch (status) {
            case 'published': return 'success';
            case 'draft': return 'warning';
            case 'reviewed': return 'info';
            default: return 'secondary';
        }
    }
}
