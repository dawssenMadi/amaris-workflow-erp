export interface AuditDecision {
    rule: string;
    decision: boolean;
    isNew?: boolean;
}
