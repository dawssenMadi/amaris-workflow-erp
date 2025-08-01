import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AutoCompleteService {
    private basicActivities = [
        'Valider une demande',
        'Traiter une commande',
        'Envoyer une notification',
        'Mettre à jour un dossier',
        'Générer un document PDF',
        'Vérifier une condition',
        'Créer un compte utilisateur',
        'Supprimer des données obsolètes',
        'Consulter les informations d’un client',
        'Télécharger un fichier',
        'Enregistrer les résultats',
        'Attribuer une tâche à un agent',
        'Archiver une facture',
        'Importer des données',
        'Exporter les résultats',
        'Analyser une réclamation',
        'Notifier un superviseur',
        'Calculer un montant',
        'Planifier un rendez-vous',
        'Annuler une réservation',
        'Contrôler la conformité',
        'Assigner un responsable',
        'Notifier le client par SMS',
        'Réinitialiser un mot de passe',
        'Authentifier un utilisateur',
        'Vérifier la disponibilité d’un produit',
        'Bloquer un compte',
        'Débloquer un accès',
        'Générer une facture',
        'Clôturer un dossier',
        'Déclencher une procédure de secours',
        'Envoyer un accusé de réception',
        'Lancer une opération de maintenance',
        'Notifier une erreur technique',
        'Effectuer une sauvegarde',
        'Analyser les logs',
        'Réconcilier des données',
        'Valider une étape du processus',
        'Transférer un dossier à un autre service',
        'Activer un abonnement',
        'Suspendre un service',
        'Relancer un client',
        'Évaluer un dossier',
        'Scanner un document',
        'Classer un fichier',
        'Appliquer une réduction',
        'Saisir une information manuellement',
        'Déterminer une priorité',
        'Configurer un environnement',
        'Synchroniser les données'
    ];


    private camundaConnectors = [

    ];

    private camundaElements = [
        'Une notification email a été envoyée',
        'La demande a été validée',
        'Le montant a été calculé',
        'Le paiement a été traité',
        'Un message de confirmation a été reçu',
        'Le formulaire a été rempli',
        'Les règles métier ont été appliquées',
        'Le processus de facturation a été déclenché',
        'Le dossier client a été traité',
        'L’annulation a été gérée',
        'Le processus a été démarré',
        'Le processus a été terminé',
        'Un événement externe a été capté',
        'Le délai a été dépassé',
        'Trois jours se sont écoulés',
        'Le message a été reçu',
        'Le signal a été envoyé',
        'Une erreur a été détectée',
        'Le superviseur a été alerté',
        'Le remboursement a été effectué',
        'La condition a été remplie',
        'Le lien a été suivi',
        'Une décision a été prise',
        'Les tâches ont été exécutées',
        'Les options ont été activées',
        'Un événement a été reçu',
        'La logique complexe a été résolue'
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
