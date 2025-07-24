import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class CamundaPropertiesService {

    getConnectorTemplate(connectorType: string): any {
        const templates = {
            'REST Connector': {
                type: 'io.camunda:http-json:1',
                properties: {
                    url: '',
                    method: 'GET',
                    headers: {},
                    authentication: {
                        type: 'none'
                    },
                    connectionTimeoutInSeconds: 20,
                    readTimeoutInSeconds: 20
                }
            },
            'SendGrid Connector': {
                type: 'io.camunda:sendgrid:1',
                properties: {
                    apiKey: '',
                    from: '',
                    to: '',
                    subject: '',
                    content: '',
                    templateId: ''
                }
            },
            'Slack Connector': {
                type: 'io.camunda:slack:1',
                properties: {
                    token: '',
                    channel: '',
                    message: '',
                    username: 'Camunda Bot'
                }
            },
            'Google Drive Connector': {
                type: 'io.camunda:google-drive:1',
                properties: {
                    authentication: {
                        type: 'bearer',
                        token: ''
                    },
                    operation: 'createFile',
                    fileName: '',
                    content: ''
                }
            },
            'Microsoft Teams Connector': {
                type: 'io.camunda:microsoft-teams:1',
                properties: {
                    webhookUrl: '',
                    message: '',
                    title: ''
                }
            },
            'RabbitMQ Connector': {
                type: 'io.camunda:rabbitmq:1',
                properties: {
                    uri: '',
                    routingKey: '',
                    exchange: '',
                    message: ''
                }
            }
        };

        return templates[connectorType] || null;
    }

    getElementProperties(elementType: string): any[] {
        const properties = {
            'bpmn:ServiceTask': [
                { name: 'Implementation', type: 'dropdown', options: ['Job Worker', 'Connector', 'Script'] },
                { name: 'Job Type', type: 'text', placeholder: 'ex: email-service' },
                { name: 'Retries', type: 'number', default: 3 },
                { name: 'Retry Backoff', type: 'text', placeholder: 'PT15S' },
                { name: 'Input/Output Mappings', type: 'mappings' },
                { name: 'Task Headers', type: 'headers' }
            ],
            'bpmn:UserTask': [
                { name: 'Assignee', type: 'text', placeholder: 'demo' },
                { name: 'Candidate Groups', type: 'text', placeholder: 'sales,support' },
                { name: 'Candidate Users', type: 'text', placeholder: 'john,mary' },
                { name: 'Due Date', type: 'text', placeholder: '=now() + duration("P7D")' },
                { name: 'Follow Up Date', type: 'text', placeholder: '=now() + duration("P3D")' },
                { name: 'Priority', type: 'number', default: 50 },
                { name: 'Form Key', type: 'text', placeholder: 'camunda-forms:bpmn:userTaskForm_1' },
                { name: 'External Form Reference', type: 'text' }
            ],
            'bpmn:TimerEvent': [
                { name: 'Timer Definition', type: 'dropdown', options: ['Duration', 'Date', 'Cycle'] },
                { name: 'Timer Value', type: 'text', placeholder: 'PT30S ou R3/PT10S' }
            ],
            'bpmn:MessageEvent': [
                { name: 'Message Name', type: 'text', placeholder: 'order-received' },
                { name: 'Correlation Key', type: 'text', placeholder: '=orderId' },
                { name: 'TTL', type: 'text', placeholder: 'PT1H' }
            ],
            'bpmn:SignalEvent': [
                { name: 'Signal Name', type: 'text', placeholder: 'payment-completed' }
            ],
            'bpmn:ErrorEvent': [
                { name: 'Error Code', type: 'text', placeholder: 'PAYMENT_FAILED' },
                { name: 'Error Message', type: 'text', placeholder: 'Payment could not be processed' }
            ],
            'bpmn:ExclusiveGateway': [
                { name: 'Default Flow', type: 'text' }
            ],
            'bpmn:CallActivity': [
                { name: 'Process ID', type: 'text', placeholder: 'child-process' },
                { name: 'Propagate All Child Variables', type: 'checkbox', default: false },
                { name: 'Input/Output Mappings', type: 'mappings' }
            ]
        };

        return properties[elementType] || [];
    }

    getJobWorkerTypes(): string[] {
        return [
            'email-service',
            'payment-processor',
            'data-validator',
            'report-generator',
            'notification-sender',
            'file-processor',
            'external-api-caller',
            'database-updater',
            'pdf-generator',
            'document-converter',
            'inventory-checker',
            'credit-scorer',
            'fraud-detector',
            'approval-router'
        ];
    }

    getZeebeProperties(): any {
        return {
            inputOutput: {
                inputParameters: [],
                outputParameters: []
            },
            taskDefinition: {
                type: '',
                retries: '3'
            },
            taskHeaders: {},
            calledElement: {
                processId: '',
                propagateAllChildVariables: false
            },
            ioMapping: {
                inputParameters: [],
                outputParameters: []
            }
        };
    }

    getTimerExpressions(): string[] {
        return [
            'PT30S',      // 30 secondes
            'PT5M',       // 5 minutes
            'PT1H',       // 1 heure
            'P1D',        // 1 jour
            'R3/PT10S',   // Répéter 3 fois toutes les 10 secondes
            'R/PT1H',     // Répéter indéfiniment toutes les heures
            '2023-12-31T23:59:59Z', // Date spécifique
            '=now() + duration("PT1H")', // Expression
            '0 0 12 * * ?'  // Cron expression
        ];
    }

    getConnectorCategories(): any {
        return {
            'Communication': ['Slack Connector', 'Microsoft Teams Connector', 'SendGrid Connector', 'Twilio SMS Connector'],
            'Cloud Storage': ['Google Drive Connector', 'AWS S3 Connector', 'Azure Blob Connector'],
            'Messaging': ['RabbitMQ Connector', 'Kafka Connector', 'HTTP Webhook Connector'],
            'Database': ['PostgreSQL Connector', 'MySQL Connector', 'MongoDB Connector', 'Redis Connector'],
            'Integration': ['REST Connector', 'SOAP Connector', 'GraphQL Connector'],
            'Development': ['GitHub Connector', 'GitLab Connector', 'Discord Connector']
        };
    }
}
