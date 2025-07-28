import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CamundaCluster } from '../../clusters/clusters.component';

export interface DeploymentRequest {
  name: string;
  bpmnXml: string;
  clusterId: string;
}

export interface DeploymentResponse {
  key: string;
  deployments: Array<{
    process: {
      bpmnProcessId: string;
      version: number;
      processDefinitionKey: string;
      resourceName: string;
    };
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class ClusterService {
  private clustersSubject = new BehaviorSubject<CamundaCluster[]>([]);
  public clusters$ = this.clustersSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadClusters();
  }

  /**
   * Charge les clusters depuis le localStorage
   */
  private loadClusters(): void {
    const saved = localStorage.getItem('camunda_clusters');
    if (saved) {
      try {
        const clusters = JSON.parse(saved).map((cluster: any) => ({
          ...cluster,
          lastTested: cluster.lastTested ? new Date(cluster.lastTested) : undefined
        }));
        this.clustersSubject.next(clusters);
      } catch (error) {
        console.error('Error loading clusters:', error);
        this.clustersSubject.next([]);
      }
    }
  }

  /**
   * Obtient tous les clusters
   */
  getClusters(): CamundaCluster[] {
    return this.clustersSubject.value;
  }

  /**
   * Obtient les clusters connectés
   */
  getConnectedClusters(): CamundaCluster[] {
    return this.clustersSubject.value.filter(cluster => cluster.status === 'connected');
  }

  /**
   * Obtient un cluster par ID
   */
  getClusterById(id: string): CamundaCluster | undefined {
    return this.clustersSubject.value.find(cluster => cluster.id === id);
  }

  /**
   * Déploie un processus BPMN sur un cluster
   */
  deployProcess(request: DeploymentRequest): Observable<DeploymentResponse> {
    const cluster = this.getClusterById(request.clusterId);

    if (!cluster) {
      return throwError(() => new Error('Cluster introuvable'));
    }

    if (cluster.status !== 'connected') {
      return throwError(() => new Error('Le cluster n\'est pas connecté'));
    }

    if (cluster.type === 'saas') {
      return this.deploySaas(cluster, request);
    } else {
      return this.deploySelfManaged(cluster, request);
    }
  }

  /**
   * Déploiement sur Camunda SaaS
   */
  private deploySaas(cluster: CamundaCluster, request: DeploymentRequest): Observable<DeploymentResponse> {
    // Pour les déploiements SaaS, nous utiliserions l'API REST de Camunda Cloud
    const deploymentUrl = cluster.restApiUrl + 'deployments';

    const formData = new FormData();
    const bpmnBlob = new Blob([request.bpmnXml], { type: 'application/xml' });
    formData.append('deployment-name', request.name);
    formData.append('deployment-source', 'modeler');
    formData.append(`${request.name}.bpmn`, bpmnBlob, `${request.name}.bpmn`);

    // Pour la démo, nous simulons une réponse
    return this.simulateDeployment(request);
  }

  /**
   * Déploiement sur instance Self-Managed
   */
  private deploySelfManaged(cluster: CamundaCluster, request: DeploymentRequest): Observable<DeploymentResponse> {
    // Pour les instances self-managed, nous utiliserions l'API REST de Camunda
    const deploymentUrl = `${cluster.selfManagedOperateUrl || 'http://localhost:8080'}/v1/deployments`;

    const formData = new FormData();
    const bpmnBlob = new Blob([request.bpmnXml], { type: 'application/xml' });
    formData.append('deployment-name', request.name);
    formData.append('deployment-source', 'modeler');
    formData.append(`${request.name}.bpmn`, bpmnBlob, `${request.name}.bpmn`);

    // Pour la démo, nous simulons une réponse
    return this.simulateDeployment(request);
  }

  /**
   * Simule un déploiement pour la démo
   */
  private simulateDeployment(request: DeploymentRequest): Observable<DeploymentResponse> {
    return new Observable(observer => {
      setTimeout(() => {
        const success = Math.random() > 0.2; // 80% de chance de succès

        if (success) {
          const response: DeploymentResponse = {
            key: `deployment_${Date.now()}`,
            deployments: [{
              process: {
                bpmnProcessId: `process_${Date.now()}`,
                version: 1,
                processDefinitionKey: `processDefinition_${Date.now()}`,
                resourceName: `${request.name}.bpmn`
              }
            }]
          };
          observer.next(response);
          observer.complete();
        } else {
          observer.error(new Error('Échec du déploiement (simulation)'));
        }
      }, 2000); // Simule un délai de déploiement
    });
  }

  /**
   * Teste la connexion à un cluster
   */
  testConnection(cluster: CamundaCluster): Observable<boolean> {
    if (cluster.type === 'saas') {
      return this.testSaasConnection(cluster);
    } else {
      return this.testSelfManagedConnection(cluster);
    }
  }

  /**
   * Test de connexion SaaS
   */
  private testSaasConnection(cluster: CamundaCluster): Observable<boolean> {
    // Dans un vrai projet, ceci ferait un appel à l'API Camunda Cloud
    return new Observable(observer => {
      setTimeout(() => {
        const success = Math.random() > 0.3;
        if (success) {
          observer.next(true);
          observer.complete();
        } else {
          observer.error(new Error('Connexion SaaS échouée'));
        }
      }, 1500);
    });
  }

  /**
   * Test de connexion Self-Managed
   */
  private testSelfManagedConnection(cluster: CamundaCluster): Observable<boolean> {
    // Dans un vrai projet, ceci ferait un appel à l'endpoint de santé
    return new Observable(observer => {
      setTimeout(() => {
        const success = Math.random() > 0.3;
        if (success) {
          observer.next(true);
          observer.complete();
        } else {
          observer.error(new Error('Connexion self-managed échouée'));
        }
      }, 1500);
    });
  }

  /**
   * Obtient les processus déployés sur un cluster
   */
  getDeployedProcesses(clusterId: string): Observable<any[]> {
    const cluster = this.getClusterById(clusterId);

    if (!cluster) {
      return throwError(() => new Error('Cluster introuvable'));
    }

    // Simulation de récupération des processus
    return new Observable(observer => {
      setTimeout(() => {
        const processes = [
          {
            id: 'process1',
            name: 'Processus de Validation',
            version: 1,
            deployed: new Date()
          },
          {
            id: 'process2',
            name: 'Workflow Approbation',
            version: 2,
            deployed: new Date()
          }
        ];
        observer.next(processes);
        observer.complete();
      }, 1000);
    });
  }

  /**
   * Met à jour le statut d'un cluster
   */
  updateClusterStatus(clusterId: string, status: CamundaCluster['status']): void {
    const clusters = this.clustersSubject.value;
    const clusterIndex = clusters.findIndex(c => c.id === clusterId);

    if (clusterIndex >= 0) {
      clusters[clusterIndex].status = status;
      clusters[clusterIndex].lastTested = new Date();
      this.clustersSubject.next([...clusters]);
      this.saveClusters(clusters);
    }
  }

  /**
   * Sauvegarde les clusters dans le localStorage
   */
  private saveClusters(clusters: CamundaCluster[]): void {
    try {
      localStorage.setItem('camunda_clusters', JSON.stringify(clusters));
    } catch (error) {
      console.error('Error saving clusters:', error);
    }
  }
}
