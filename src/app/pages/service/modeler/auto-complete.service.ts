import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AutoCompleteService {
    private suggestions = [
        'Valider la saisie',
        'Traiter le paiement',
        'Envoyer un email',
        'Mettre à jour la base de données',
        'Générer un rapport',
        'Vérifier les permissions',
        'Créer un utilisateur',
        'Supprimer un enregistrement',
        'Archiver les données',
        'Sauvegarder le système',
        'Réviser le document',
        'Approuver la demande',
        'Rejeter la candidature',
        'Calculer le total',
        'Transformer les données',
        'Exporter les résultats',
        'Importer un fichier',
        'Synchroniser les données',
        'Notifier l\'utilisateur',
        'Enregistrer l\'activité'
    ];

    getSuggestions(query: string): Observable<string[]> {
        if (query.length < 2) {
            return of([]);
        }

        const filtered = this.suggestions.filter(suggestion =>
            suggestion.toLowerCase().includes(query.toLowerCase())
        );

        return of(filtered.slice(0, 5)); // Limite à 5 suggestions
    }
}
