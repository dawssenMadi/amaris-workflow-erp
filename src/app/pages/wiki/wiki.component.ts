import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EditorModule } from 'primeng/editor';
import { RouterModule } from '@angular/router';
import { WikiService,WikiArticle } from '../service/WIKI/wiki.service';

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
  imageUrl?: string; // ajouté pour capture
  hashtags?: string[];

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
  imports: [CommonModule, FormsModule, EditorModule , RouterModule],
  templateUrl: './wiki.component.html',
  styleUrl: './wiki.component.scss'
})
export class WikiComponent {
  searchQuery = '';
  activeTab = 'Suivis';
  newPostTitle = '';
  newPostContent = '';
  selectedImageUrl: string | null = null; // image ajoutée
  chatbotOpen = false;
  userInput = '';
  messages: { sender: 'user' | 'ai'; text: string }[] = [];
  showEditor = false;
  selectedCard: ActivityCard | null = null; // modale sélectionnée
  activityCards: WikiArticle[] = [];
categories: string[] = ['No more retries left', 'Condition error	','Extract value error'];
selectedCategory: string = '';
categoryDropdownOpen = false;
selectedCategoryFilter: string = '';
newPostHashtagInput: string = '';
hashtags: string[] = [];
searchHashtag: string = '';

toggleCategoryDropdown() {
  this.categoryDropdownOpen = !this.categoryDropdownOpen;
}

selectCategory(cat: string) {
  this.selectedCategory = cat;
  this.categoryDropdownOpen = false;
}
  selectCategoryFilter(cat: string) {
    this.selectedCategoryFilter = cat;
  }
constructor(private wikiService: WikiService) {}

  @ViewChild('postCard', { static: false }) postCardRef!: ElementRef;
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const clickedInside = this.postCardRef?.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.showEditor = false;
    }
  }


ngOnInit() {
  this.activityCards = this.wikiService.getArticles();
}
  toggleChatbot() {
    this.chatbotOpen = !this.chatbotOpen;
  }

  sendMessage() {
    const message = this.userInput.trim();
    if (!message) return;

    this.messages.push({ sender: 'user', text: message });

    setTimeout(() => {
      this.messages.push({
        sender: 'ai',
        text: `🤖 Réponse simulée à: "${message}"`
      });
    }, 800);

    this.userInput = '';
  }

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

  tabs = ['Recent', 'Populaire'];
filterByHashtag() {
  const tag = this.searchHashtag.trim().toLowerCase();

  if (!tag) {
    this.activityCards = this.wikiService.getArticles(); // reset
    return;
  }

  this.activityCards = this.wikiService.getArticles().filter(article =>
    article.hashtags?.some(h => h.toLowerCase().includes(tag))
  );
}

addHashtag() {
  const tag = this.newPostHashtagInput.trim();
  if (tag && !this.hashtags.includes(tag)) {
    this.hashtags.push(tag.startsWith('#') ? tag : `#${tag}`);
  }
  this.newPostHashtagInput = '';
}

removeHashtag(tag: string) {
  this.hashtags = this.hashtags.filter(t => t !== tag);
}


  publishPost() {
    if (!this.newPostTitle.trim()) {
      alert('Le titre est obligatoire.');
      return;
    }
    if (!this.newPostContent.trim()) {
      alert('Le contenu de l’article ne peut pas être vide.');
      return;
    }
  if (!this.selectedCategory) {
    alert('Veuillez sélectionner une catégorie avant de publier.');
    return;
  }

  // Implémente ici ta logique de publication
  console.log('Article publié avec la catégorie :', this.selectedCategory);
    const newCard: ActivityCard = {
      id: Date.now().toString(),
      author: 'Moi',
      creationDate: new Date(),
      title: this.newPostTitle,
      content: this.newPostContent,
      owner: 'Moi',
      space: 'Espace personnel',
      type: 'page',
      imageUrl: this.selectedImageUrl || undefined,
        hashtags: [...this.hashtags]

    };

    this.activityCards.unshift(newCard);
this.hashtags = [];

    this.newPostTitle = '';
    this.newPostContent = '';
    this.selectedImageUrl = null;
    this.showEditor = false;
  }

  onImageSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedImageUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  selectNavigationItem(item: NavigationItem) {
    this.navigationItems.forEach(nav => nav.active = false);
    item.active = true;
  }

  selectTab(tab: string) {
    this.activeTab = tab;
  }

  openRecentPage(page: RecentPage) {
    console.log('Opening page:', page.title);
  }

  createNew() {
    console.log('Creating new content');
  }

  search() {
    console.log('Searching for:', this.searchQuery);
  }
  onSave() {
  const newArticle: WikiArticle = {
    id: `article-${Date.now()}`,
    title: this.newPostTitle,
    content: this.newPostContent,
    author: 'Moi',
    creationDate: new Date(),
    type: 'page',
    space: 'Espace personnel',
    owner: 'Moi',
    imageUrl: this.selectedImageUrl || undefined,
    hashtags: [...this.hashtags]

  };

  this.wikiService.addArticle(newArticle);
  this.activityCards = this.wikiService.getArticles(); // recharge les articles
  this.hashtags = [];
  this.newPostTitle = '';
  this.newPostContent = '';
  this.selectedImageUrl = null;
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
    this.selectedCard = card;
  }

  closeModal() {
    this.selectedCard = null;
  }
}
