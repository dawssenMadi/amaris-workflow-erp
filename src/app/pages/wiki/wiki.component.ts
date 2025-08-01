import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface RecentPage {
  id: string;
  title: string;
  spaceName: string;
  lastViewed: Date;
  url?: string;
}

interface ActivityCard {
  id: string;
  author: string;
  creationDate: Date;
  title: string;
  content: string;
  owner: string;
  space: string;
  type: 'page' | 'blog' | 'comment';
}

interface NavigationItem {
  label: string;
  icon: string;
  active?: boolean;
}

interface PinnedSpace {
  name: string;
  icon: string;
}

@Component({
  selector: 'app-wiki',
  imports: [CommonModule, FormsModule],
  templateUrl: './wiki.component.html',
  styleUrl: './wiki.component.scss'
})
export class WikiComponent {
  searchQuery = '';
  activeTab = 'Suivis';

  navigationItems: NavigationItem[] = [
    { label: 'Pour vous', icon: '👤', active: true },
    { label: 'Récent', icon: '🕒' },
    { label: 'Mis en favori', icon: '⭐' },
    { label: 'Espaces', icon: '📁' },
    { label: 'Apps', icon: '📱' },
    { label: 'Équipes', icon: '👥' }
  ];

  pinnedSpaces: PinnedSpace[] = [
    { name: 'Direction Projet IT', icon: '💼' },
    { name: 'MOE DATA', icon: '📊' }
  ];

  recentPages: RecentPage[] = [
    {
      id: '1',
      title: 'Guide de développement Angular',
      spaceName: 'Direction Projet IT',
      lastViewed: new Date(2025, 6, 28, 14, 30)
    },
    {
      id: '2',
      title: 'Architecture microservices',
      spaceName: 'MOE DATA',
      lastViewed: new Date(2025, 6, 28, 10, 15)
    },
    {
      id: '3',
      title: 'Standards de codage',
      spaceName: 'Direction Projet IT',
      lastViewed: new Date(2025, 6, 27, 16, 45)
    },
    {
      id: '4',
      title: 'Procédures de déploiement',
      spaceName: 'MOE DATA',
      lastViewed: new Date(2025, 6, 27, 9, 20)
    }
  ];

  tabs = ['Suivis', 'Populaire', 'Annonces', 'Calendriers'];

  activityCards: ActivityCard[] = [
    {
      id: '1',
      author: 'Marie Dubois',
      creationDate: new Date(2025, 6, 29, 8, 30),
      title: 'Proposition de solution au problème de synchronisation des messages events',
      content: 'Suite à l\'analyse approfondie du système de messaging, voici une proposition de solution pour résoudre les problèmes de synchronisation que nous rencontrons actuellement...',
      owner: 'Marie Dubois',
      space: 'Direction Projet IT',
      type: 'page'
    },
    {
      id: '2',
      author: 'Jean Martin',
      creationDate: new Date(2025, 6, 28, 15, 45),
      title: 'Mise à jour des processus de traitement des données',
      content: 'Les nouveaux processus ETL ont été mis en place pour améliorer les performances de traitement des données volumineuses...',
      owner: 'Jean Martin',
      space: 'MOE DATA',
      type: 'page'
    },
    {
      id: '3',
      author: 'Sophie Laurent',
      creationDate: new Date(2025, 6, 28, 11, 20),
      title: 'Formation sécurité informatique - Planning',
      content: 'Planification des sessions de formation obligatoires sur la sécurité informatique pour tous les développeurs...',
      owner: 'Sophie Laurent',
      space: 'Direction Projet IT',
      type: 'blog'
    }
  ];

  selectNavigationItem(item: NavigationItem) {
    this.navigationItems.forEach(nav => nav.active = false);
    item.active = true;
  }

  selectTab(tab: string) {
    this.activeTab = tab;
  }

  openRecentPage(page: RecentPage) {
    console.log('Opening page:', page.title);
    // mch Logique pour ouvrir la page
  }

  createNew() {
    console.log('Creating new content');
    // Logique pour créer du nouveau contenu
  }

  search() {
    console.log('Searching for:', this.searchQuery);
    // Logique de recherche
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Hier';
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jours`;
    } else {
      return date.toLocaleDateString('fr-FR');
    }
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  previewContent(card: ActivityCard) {
    console.log('Previewing content for:', card.title);
    // Logique pour prévisualiser le contenu
  }
}
