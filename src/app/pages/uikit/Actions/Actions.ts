import { Component, HostListener, OnInit } from '@angular/core';
import { AuditService } from '../../service/audit.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KeycloakService } from '../../service/authentication/keycloak.service'; // ajuste le chemin

@Component({
  selector: 'app-actions',
  templateUrl: './Actions.html',
  styleUrls: ['./Actions.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class Actions implements OnInit {
  audits: any[] = [];
  completedAudits: any[] = [];
  visibleActions: any[] = [];
  batchSize = 6;
  loading = false;
  allLoaded = false;
  selectedAudit: any = null;
  details: any[] = [];
  private sessionDetails: { [auditId: string]: any[] } = {};
  showModal = false;
  isTechLead: boolean = false;
  isViewerOnly: boolean = false;

  constructor(private auditService: AuditService, private keycloakService: KeycloakService) {}
  ngOnInit() {
       this.isTechLead = this.keycloakService.hasRole('Tech lead');
    this.isViewerOnly = this.keycloakService.hasRole('Proxy Product Owner') || this.keycloakService.hasRole('Business Analyst');
    this.audits = this.auditService.getAudits();
    this.completedAudits = this.audits.filter(
      audit =>
        this.calculateProgress(audit) === 100 &&
        this.calculateConformity(audit) < 100
    );
    this.visibleActions = [];
    this.allLoaded = false;
    this.loading = false;
    this.loadMore();
  }

  loadMore() {
    if (this.loading || this.allLoaded) return;
    this.loading = true;
    setTimeout(() => {
      const next = this.visibleActions.length + this.batchSize;
      this.visibleActions = this.completedAudits.slice(0, next);
      this.loading = false;
      if (this.visibleActions.length >= this.completedAudits.length) {
        this.allLoaded = true;
      }
    }, 300);
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (this.loading || this.allLoaded) return;
    const scrollPosition = window.innerHeight + window.scrollY;
    const threshold = document.body.offsetHeight - 100;
    if (scrollPosition >= threshold) {
      this.loadMore();
    }
  }

  isDarkMode(): boolean {
    return document.documentElement.classList.contains('app-dark');
  }selectAudit(audit: any) {
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
          anomalie: '',
          assigne: '',
          deadline: '',
          status: '',
          commentaire: item.commentaire || ''
        })),
      ...audit.technical
        .filter((item: any) => item.response && item.response !== 'OK')
        .map((item: any) => ({
          description: item.question,
          anomalie: '',
          assigne: '',
          deadline: '',
          status: '',
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
