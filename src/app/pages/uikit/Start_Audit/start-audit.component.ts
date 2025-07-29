import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditService } from '../../service/audit.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-start-audit',
  standalone: true,
  templateUrl: './start-audit.component.html',
  styleUrls: ['./start-audit.component.css'],
    imports: [CommonModule, FormsModule]
})
export class StartAuditComponent {
    isTechLead: boolean = false;
  isViewerOnly: boolean = false;
  constructor(private auditService: AuditService, private router: Router) {}

  userInfo = {
    firstName: 'Med Amin',
    lastName: 'Riahi',
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
      auditor: 'oussema.bejaoui_amar',
      auditee: `${this.userInfo.firstName} ${this.userInfo.lastName}`,
      type: this.setupData.type,
      department: this.setupData.department,
    };

    this.auditService.addAudit(newAudit);
    this.router.navigate(['/audit']);
  }
}