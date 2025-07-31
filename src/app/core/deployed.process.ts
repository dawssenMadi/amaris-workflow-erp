import { AuditRule } from './audit.rule';

export interface DeployedProcess {
    id: string;
    name: string;
    version: string;
    deployedAt: Date;
    status: 'active' | 'inactive';
    description: string;
    auditStatus: 'not-started' | 'in-progress' | 'completed' | 'failed';
    auditRules: AuditRule[];
    completedRules: number;
    totalRules: number;
    lastAuditDate?: Date;
}
