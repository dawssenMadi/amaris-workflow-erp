import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AutoCompleteService {
    private basicActivities = [
        'Valider la saisie',
        'Traiter le paiement',
        'Envoyer un email',
        'Mettre à jour la base de données',
        'Générer un rapport',
        'Vérifier les permissions',
        'Créer un utilisateur',
        'Supprimer un enregistrement'
    ];

    private camundaConnectors = [
        'REST Connector',
        'Slack Connector',
        'SendGrid Connector',
        'Google Drive Connector',
        'Microsoft Teams Connector',
        'AWS Lambda Connector',
        'HTTP Webhook Connector',
        'RabbitMQ Connector',
        'Kafka Connector',
        'GraphQL Connector',
        'SOAP Connector',
        'Twilio SMS Connector',
        'Discord Connector',
        'GitHub Connector',
        'GitLab Connector',
        'PostgreSQL Connector',
        'MySQL Connector',
        'MongoDB Connector',
        'Redis Connector',
        'Elasticsearch Connector'
    ];

    private camundaElements = [
        'Service Task',
        'User Task',
        'Script Task',
        'Send Task',
        'Receive Task',
        'Manual Task',
        'Business Rule Task',
        'Call Activity',
        'Sub Process',
        'Event Sub Process',
        'Start Event',
        'End Event',
        'Intermediate Event',
        'Boundary Event',
        'Timer Event',
        'Message Event',
        'Signal Event',
        'Error Event',
        'Escalation Event',
        'Compensation Event',
        'Conditional Event',
        'Link Event',
        'Exclusive Gateway',
        'Parallel Gateway',
        'Inclusive Gateway',
        'Event Gateway',
        'Complex Gateway'
    ];

    getSuggestions(query: string, elementType?: string): Observable<string[]> {
        if (query.length < 2) {
            return of([]);
        }

        let allSuggestions = [
            ...this.basicActivities,
            ...this.camundaConnectors,
            ...this.camundaElements
        ];

        // Filtrer selon le type d'élément si spécifié
        if (elementType === 'bpmn:ServiceTask') {
            allSuggestions = [...this.camundaConnectors, ...this.basicActivities];
        }

        const filtered = allSuggestions.filter(suggestion =>
            suggestion.toLowerCase().includes(query.toLowerCase())
        );

        return of(filtered.slice(0, 8)); // Augmenté à 8 suggestions
    }
}
