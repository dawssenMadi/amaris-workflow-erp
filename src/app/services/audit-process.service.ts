import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

export interface ProcessStartResponse {
  success: boolean;
  message?: string;
  processInstanceId?: string;
  error?: string;
  timestamp?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuditProcessService {

  private readonly baseUrl = 'http://localhost:8080/api/process';

  constructor(private http: HttpClient) {}

  /**
   * Démarre un processus d'audit sans variables
   * @param processKey L'identifiant du processus à démarrer
   * @returns Observable<ProcessStartResponse>
   */
  startProcessWithoutVariables(processKey: string): Observable<ProcessStartResponse> {
    const url = `${this.baseUrl}/start/${processKey}/no-variables`;

    return this.http.post<ProcessStartResponse>(url, {})
      .pipe(
        retry(1), // Retry une fois en cas d'échec
        catchError(this.handleError)
      );
  }

  /**
   * Gestion des erreurs HTTP
   * @param error L'erreur HTTP
   * @returns Observable avec erreur formatée
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur inattendue s\'est produite';

    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur client: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      switch (error.status) {
        case 400:
          errorMessage = 'Requête invalide - Vérifiez les paramètres';
          break;
        case 404:
          errorMessage = 'Processus non trouvé';
          break;
        case 500:
          errorMessage = 'Erreur serveur interne';
          break;
        default:
          errorMessage = `Erreur serveur: ${error.status}`;
      }
    }

    console.error('Erreur API:', error);
    return throwError(() => errorMessage);
  }
}
