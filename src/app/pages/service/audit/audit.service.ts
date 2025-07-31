import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaces pour l'audit API
export interface AuditRequest {
  nomSymbol: string;
  typeSymbol: string;
  idSymbol: string;
}

export interface AuditResponse {
  idSymbol: string;
  resultatAudit: boolean;
  erreurs?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuditService {

  // Configuration de l'API
  private readonly API_BASE_URL = 'https://audit-spring-ai-xml.onrender.com'; // À modifier selon votre backend
  private readonly AUDIT_ENDPOINT = '/audit/symbol';

  constructor(private http: HttpClient) {}

  /**
   * Envoie une requête d'audit pour un symbole BPMN
   * @param auditRequest Les données du symbole à auditer
   * @returns Observable avec la réponse d'audit
   */
  auditSymbol(auditRequest: AuditRequest): Observable<AuditResponse> {
    const url = `${this.API_BASE_URL}${this.AUDIT_ENDPOINT}`;

    console.log('🔍 Envoi requête audit:', auditRequest);

    return this.http.post<AuditResponse>(url, auditRequest);
  }

  /**
   * Configuration de l'URL de l'API (utile pour les environnements)
   * @param baseUrl Nouvelle URL de base de l'API
   */
  setApiBaseUrl(baseUrl: string): void {
    (this as any).API_BASE_URL = baseUrl;
  }
}
