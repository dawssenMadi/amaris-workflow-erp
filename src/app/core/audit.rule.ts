import { AuditDecision } from './audit.decision';

export interface AuditRule {
    id: string;
    name: string;
    description: string;
    category: string;
    activities: AuditDecision[];
    status: 'pending' | 'in-progress' | 'completed' | 'failed';
    isValidated: boolean;
    validatedBy?: string;
    validatedAt?: Date;
    stage: number; // Nouveau: numéro de stage
    isEnabled: boolean; // Nouveau: si la règle est activée
    isLoading: boolean; // Nouveau: si la règle est en cours de chargement
}
