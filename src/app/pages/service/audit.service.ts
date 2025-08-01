import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuditService {
  private audits: any[] = [];
  private nextId = 1;
private correctionAudit: any;
  getAudits() {
    return this.audits;
  }
  updateAudit(updatedAudit: any) {
    const index = this.audits.findIndex(a => a.id === updatedAudit.id);
    if (index !== -1) {
      this.audits[index] = updatedAudit;
    }
  }
  addAudit(audit: any) {
    audit.id = this.nextId++;
    audit.status = 'En cours';
    audit.date = new Date().toISOString().split('T')[0]; // format yyyy-mm-dd
    audit.items = this.getDefaultModelItems();
    audit.technical = this.getDefaultTechItems();
    this.audits.push(audit);
  }

  private getDefaultModelItems() {
    return [
      { no: 1, question: 'Nomenclature normalisée', response: '', commentaire: '' },
      { no: 2, question: 'Utilisation des sous-processus', response: '', commentaire: '' },
      { no: 3, question: 'Utilisation correcte des gateways', response: '', commentaire: '' },
      { no: 4, question: 'Événements de début et fin', response: '', commentaire: '' },
      { no: 5, question: 'Modèle lisible visuellement', response: '', commentaire: '' },
      { no: 6, question: 'Utilisation correcte des pools et lanes (participants)', response: '', commentaire: '' },
      { no: 7, question: 'Documentation BPMN intégrée', response: '', commentaire: '' },
      { no: 8, question: 'Optimisation de la modélisation', response: '', commentaire: '' }
    ];
  }

  private getDefaultTechItems() {
    return [
      { no: 1, question: 'Mapping clair des erreurs attendues dans les connecteurs', response: '', commentaire: '' },
      { no: 2, question: 'Tests de bout en bout', response: '', commentaire: '' },
      { no: 3, question: 'Intégration des formulaires de tâches utilisateur', response: '', commentaire: '' },
      { no: 4, question: 'Mise en place d\'un système de retry dans les workers', response: '', commentaire: '' },
      { no: 5, question: 'Vérification des timeouts et durées d\'expiration des jobs', response: '', commentaire: '' },
      { no: 6, question: 'Validation avec métier', response: '', commentaire: '' }
    ];
  }
  sendToCorrection(audit: any) {
  this.correctionAudit = {
    ...audit,
    statusCorrection: 'En cours', // initialiser le status
    items: [...audit.items],
    technical: [...audit.technical]
  };
}

getCorrectionAudit() {
  return this.correctionAudit;
}
}
