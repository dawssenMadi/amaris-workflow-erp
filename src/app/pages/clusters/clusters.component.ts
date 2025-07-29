import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, timeout } from 'rxjs/operators';
import { of } from 'rxjs';

export interface CamundaCluster {
  id?: string;
  name: string;
  description?: string;
  environment: 'development' | 'staging' | 'production';
  type: 'saas' | 'self-managed';
  status: 'connected' | 'disconnected' | 'testing' | 'error';
  lastTested?: Date;
  testing?: boolean;

  // SaaS Configuration
  clientId?: string;
  clientSecret?: string;
  clusterId?: string;
  regionId?: string;
  clusterUrl?: string;
  tasklistUrl?: string;
  operateUrl?: string;
  optimizeUrl?: string;
  oauthUrl?: string;
  restApiUrl?: string;

  // Self-Managed Configuration
  zeebeGateway?: string;
  selfManagedTasklistUrl?: string;
  selfManagedOperateUrl?: string;
  selfManagedOptimizeUrl?: string;
  useTls?: boolean;
  username?: string;
  password?: string;
}

@Component({
  selector: 'app-clusters',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './clusters.component.html',
  styleUrl: './clusters.component.scss'
})
export class ClustersComponent implements OnInit {
  clusterForm: FormGroup;
  clusters: CamundaCluster[] = [];
  editingCluster: CamundaCluster | null = null;
  selectedClusterId: string | null = null;
  showPassword = false;
  showClientSecret = false;

  // Toast notifications
  toastMessage: string = '';
  toastType: 'success' | 'error' | 'info' | 'warning' = 'info';

  // Regions disponibles pour SaaS
  saasRegions = [
    { value: 'lhr-1', label: 'London (lhr-1)' },
    { value: 'bru-2', label: 'Brussels (bru-2)' },
    { value: 'gru-1', label: 'São Paulo (gru-1)' },
    { value: 'syd-1', label: 'Sydney (syd-1)' },
    { value: 'us-east-1', label: 'US East (us-east-1)' }
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadClusters();
  }

  private initializeForm(): void {
    this.clusterForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      environment: ['', Validators.required],
      type: ['', Validators.required],

      // SaaS fields
      clientId: [''],
      clientSecret: [''],
      clusterId: [''],
      regionId: [''],
      clusterUrl: [''],
      tasklistUrl: [''],
      operateUrl: [''],
      optimizeUrl: [''],
      oauthUrl: ['https://login.cloud.camunda.io/oauth/token'],
      restApiUrl: [''],

      // Self-managed fields
      zeebeGateway: [''],
      selfManagedTasklistUrl: [''],
      selfManagedOperateUrl: [''],
      selfManagedOptimizeUrl: [''],
      useTls: [false],
      username: [''],
      password: ['']
    });

    // Add conditional validators based on type
    this.clusterForm.get('type')?.valueChanges.subscribe(type => {
      this.updateValidators(type);
      this.generateUrls(type);
    });

    // Auto-generate URLs for SaaS when clusterId or regionId changes
    this.clusterForm.get('clusterId')?.valueChanges.subscribe(() => {
      if (this.clusterForm.get('type')?.value === 'saas') {
        this.generateUrls('saas');
      }
    });

    this.clusterForm.get('regionId')?.valueChanges.subscribe(() => {
      if (this.clusterForm.get('type')?.value === 'saas') {
        this.generateUrls('saas');
      }
    });
  }

  private updateValidators(type: string): void {
    // Clear all conditional validators
    this.clearValidators(['clientId', 'clientSecret', 'clusterId', 'regionId', 'zeebeGateway']);

    if (type === 'saas') {
      this.addValidators(['clientId', 'clientSecret', 'clusterId', 'regionId']);
    } else if (type === 'self-managed') {
      this.addValidators(['zeebeGateway']);
    }
  }

  private clearValidators(fields: string[]): void {
    fields.forEach(field => {
      const control = this.clusterForm.get(field);
      if (control) {
        control.clearValidators();
        control.updateValueAndValidity();
      }
    });
  }

  private addValidators(fields: string[]): void {
    fields.forEach(field => {
      const control = this.clusterForm.get(field);
      if (control) {
        control.setValidators([Validators.required]);
        control.updateValueAndValidity();
      }
    });
  }

  private generateUrls(type: string): void {
    if (type === 'saas') {
      const clusterId = this.clusterForm.get('clusterId')?.value;
      const regionId = this.clusterForm.get('regionId')?.value;

      if (clusterId && regionId) {
        // Auto-generate SaaS URLs without blocking the form
        const updates = {
          clusterUrl: `grpcs://${clusterId}.${regionId}.zeebe.camunda.io`,
          tasklistUrl: `https://${regionId}.tasklist.camunda.io/${clusterId}`,
          operateUrl: `https://${regionId}.operate.camunda.io/${clusterId}`,
          optimizeUrl: `https://${regionId}.optimize.camunda.io/${clusterId}`,
          oauthUrl: 'https://login.cloud.camunda.io/oauth/token',
          restApiUrl: `https://${regionId}.zeebe.camunda.io:443/${clusterId}/v2/`
        };

        // Update only the URL fields without affecting the main form fields
        Object.keys(updates).forEach(key => {
          const control = this.clusterForm.get(key);
          if (control) {
            control.setValue(updates[key as keyof typeof updates], { emitEvent: false });
          }
        });
      }
    }
  }

  onTypeChange(): void {
    const type = this.clusterForm.get('type')?.value;
    this.updateValidators(type);
    this.generateUrls(type);
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleClientSecret(): void {
    this.showClientSecret = !this.showClientSecret;
  }

  saveCluster(): void {
    if (this.clusterForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const formValue = this.clusterForm.value;
    const cluster: CamundaCluster = {
      ...formValue,
      status: 'disconnected' as const,
      lastTested: undefined
    };

    if (this.editingCluster) {
      // Update existing cluster
      cluster.id = this.editingCluster.id;
      const index = this.clusters.findIndex(c => c.id === this.editingCluster!.id);
      if (index >= 0) {
        this.clusters[index] = cluster;
      }
      this.showToast('Cluster mis à jour avec succès', 'success');
    } else {
      // Add new cluster
      cluster.id = this.generateId();
      this.clusters.push(cluster);
      this.showToast('Cluster ajouté avec succès', 'success');
    }

    this.saveClusters();
    this.resetForm();
  }

  editCluster(cluster: CamundaCluster): void {
    this.editingCluster = cluster;
    this.clusterForm.patchValue(cluster);

    // Scroll to form
    const formElement = document.querySelector('.form-card');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  cancelEdit(): void {
    this.resetForm();
  }

  deleteCluster(clusterId: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce cluster ?')) {
      this.clusters = this.clusters.filter(c => c.id !== clusterId);
      this.saveClusters();
      this.showToast('Cluster supprimé avec succès', 'success');

      if (this.editingCluster?.id === clusterId) {
        this.resetForm();
      }
    }
  }

  async testConnection(): Promise<void> {
    if (this.clusterForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const cluster: CamundaCluster = {
      ...this.clusterForm.value,
      status: 'testing' as const
    };

    await this.testClusterConnection(cluster);
  }

  async testClusterConnection(cluster: CamundaCluster): Promise<void> {
    cluster.testing = true;
    cluster.status = 'testing';

    try {
      if (cluster.type === 'saas') {
        await this.testSaasConnection(cluster);
      } else {
        await this.testSelfManagedConnection(cluster);
      }

      cluster.status = 'connected';
      cluster.lastTested = new Date();
      this.showToast(`✅ Connexion au cluster "${cluster.name}" réussie`, 'success');
    } catch (error) {
      cluster.status = 'error';
      const errorMessage = error instanceof Error ? error.message : 'Erreur de connexion inconnue';
      this.showToast(`❌ Échec de la connexion au cluster "${cluster.name}": ${errorMessage}`, 'error');
    } finally {
      cluster.testing = false;
      this.saveClusters();
    }
  }

  private async testSaasConnection(cluster: CamundaCluster): Promise<void> {
    if (!cluster.clientId || !cluster.clientSecret || !cluster.oauthUrl) {
      throw new Error('Configuration SaaS incomplète');
    }

    try {
      // Test 1: Obtenir un token OAuth pour Zeebe (test de base)
      const zeebeTokenResponse = await this.getSaasAccessToken(cluster, 'zeebe');

      if (!zeebeTokenResponse.access_token) {
        throw new Error('Impossible d\'obtenir le token d\'accès pour Zeebe');
      }

      // Test 2: Tester l'accès à l'API Operate avec son propre token
      if (cluster.operateUrl) {
        const operateTokenResponse = await this.getSaasAccessToken(cluster, 'operate');
        await this.testOperateAccess(cluster.operateUrl, operateTokenResponse.access_token);
      }

      console.log('✅ Test de connexion SaaS réussi');
    } catch (error) {
      console.error('❌ Erreur test SaaS:', error);
      if (error instanceof HttpErrorResponse) {
        if (error.status === 401) {
          throw new Error('Identifiants invalides (Client ID/Secret incorrects) ou permissions insuffisantes');
        } else if (error.status === 403) {
          throw new Error('Accès refusé - Vérifiez les scopes du client (Operate, Tasklist, Zeebe requis)');
        } else if (error.status === 404) {
          throw new Error('Cluster introuvable - Vérifiez l\'ID du cluster et la région');
        } else if (error.status === 0) {
          throw new Error('Problème de réseau - Vérifiez votre connexion internet');
        } else {
          throw new Error(`Erreur HTTP ${error.status}: ${error.message}`);
        }
      } else {
        throw error;
      }
    }
  }

  private async getSaasAccessToken(cluster: CamundaCluster, service: 'zeebe' | 'operate' | 'tasklist' = 'zeebe'): Promise<any> {
    const tokenUrl = cluster.oauthUrl!;

    // Utiliser l'audience appropriée selon le service
    let audience: string;
    switch (service) {
      case 'operate':
        audience = `operate.camunda.io`;
        break;
      case 'tasklist':
        audience = `tasklist.camunda.io`;
        break;
      case 'zeebe':
      default:
        audience = `zeebe.camunda.io`;
        break;
    }

    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      audience: audience,
      client_id: cluster.clientId!,
      client_secret: cluster.clientSecret!
    });

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    console.log(`🔑 Demande de token pour ${service} avec audience: ${audience}`);

    return this.http.post(tokenUrl, body.toString(), { headers })
      .pipe(
        timeout(10000), // 10 secondes de timeout
        catchError((error: HttpErrorResponse) => {
          console.error(`Erreur OAuth pour ${service}:`, error);
          throw error;
        })
      ).toPromise();
  }

  private async testOperateAccess(operateUrl: string, accessToken: string): Promise<void> {
    // Utiliser un endpoint plus simple qui nécessite moins de permissions
    const testUrl = `${operateUrl}/v1/process-definitions`;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    });

    // Faire une simple requête GET au lieu d'un POST search
    await this.http.get(testUrl, { headers })
      .pipe(
        timeout(15000), // 15 secondes de timeout
        catchError((error: HttpErrorResponse) => {
          console.error('Erreur Operate:', error);
          if (error.status === 401) {
            throw new Error('Token invalide pour Operate - Vérifiez les scopes du client');
          }
          throw error;
        })
      ).toPromise();
  }

  private async testSelfManagedConnection(cluster: CamundaCluster): Promise<void> {
    try {
      // Test 1: Tester l'accès à Operate (endpoint principal)
      if (cluster.selfManagedOperateUrl) {
        await this.testSelfManagedEndpoint(cluster.selfManagedOperateUrl + '/actuator/health', cluster);
      } else {
        throw new Error('URL Operate manquante pour le test de connexion');
      }

      // Test 2: Tester l'accès à Tasklist (optionnel)
      if (cluster.selfManagedTasklistUrl) {
        try {
          await this.testSelfManagedEndpoint(cluster.selfManagedTasklistUrl + '/actuator/health', cluster);
        } catch (error) {
          console.warn('⚠️ Tasklist non accessible mais Operate fonctionne');
        }
      }

      console.log('✅ Test de connexion Self-Managed réussi');
    } catch (error) {
      console.error('❌ Erreur test Self-Managed:', error);
      if (error instanceof HttpErrorResponse) {
        if (error.status === 0) {
          throw new Error('Impossible de joindre le serveur - Vérifiez l\'URL et que le service est démarré');
        } else if (error.status === 401) {
          throw new Error('Authentification requise - Configurez les identifiants');
        } else if (error.status === 404) {
          throw new Error('Endpoint non trouvé - Vérifiez l\'URL du service');
        } else {
          throw new Error(`Erreur HTTP ${error.status}: ${error.statusText}`);
        }
      } else {
        throw error;
      }
    }
  }

  private async testSelfManagedEndpoint(url: string, cluster: CamundaCluster): Promise<void> {
    let headers = new HttpHeaders();

    // Ajouter l'authentification si configurée
    if (cluster.username && cluster.password) {
      const credentials = btoa(`${cluster.username}:${cluster.password}`);
      headers = headers.set('Authorization', `Basic ${credentials}`);
    }

    await this.http.get(url, { headers })
      .pipe(
        timeout(10000), // 10 secondes de timeout
        catchError((error: HttpErrorResponse) => {
          console.error('Erreur Self-Managed:', error);
          throw error;
        })
      ).toPromise();
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'connected': return 'pi pi-check-circle';
      case 'disconnected': return 'pi pi-circle';
      case 'testing': return 'pi pi-spin pi-spinner';
      case 'error': return 'pi pi-exclamation-triangle';
      default: return 'pi pi-circle';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'connected': return 'Connecté';
      case 'disconnected': return 'Déconnecté';
      case 'testing': return 'Test en cours...';
      case 'error': return 'Erreur';
      default: return 'Inconnu';
    }
  }

  getToastIcon(): string {
    switch (this.toastType) {
      case 'success': return 'pi pi-check';
      case 'error': return 'pi pi-times';
      case 'warning': return 'pi pi-exclamation-triangle';
      case 'info': return 'pi pi-info-circle';
      default: return 'pi pi-info-circle';
    }
  }

  showToast(message: string, type: 'success' | 'error' | 'info' | 'warning'): void {
    this.toastMessage = message;
    this.toastType = type;

    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.hideToast();
    }, 5000);
  }

  hideToast(): void {
    this.toastMessage = '';
  }

  private resetForm(): void {
    this.editingCluster = null;
    this.clusterForm.reset();
    this.clusterForm.patchValue({
      oauthUrl: 'https://login.cloud.camunda.io/oauth/token',
      useTls: false
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.clusterForm.controls).forEach(key => {
      const control = this.clusterForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  private generateId(): string {
    return 'cluster_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  private loadClusters(): void {
    const saved = localStorage.getItem('camunda_clusters');
    if (saved) {
      try {
        this.clusters = JSON.parse(saved).map((cluster: any) => ({
          ...cluster,
          lastTested: cluster.lastTested ? new Date(cluster.lastTested) : undefined
        }));
      } catch (error) {
        console.error('Error loading clusters:', error);
        this.clusters = [];
      }
    }
  }

  private saveClusters(): void {
    try {
      localStorage.setItem('camunda_clusters', JSON.stringify(this.clusters));
    } catch (error) {
      console.error('Error saving clusters:', error);
      this.showToast('Erreur lors de la sauvegarde', 'error');
    }
  }

  // Méthodes pour obtenir les clusters (sera utilisée par le modeler)
  public getAvailableClusters(): CamundaCluster[] {
    return this.clusters.filter(cluster => cluster.status === 'connected');
  }

  // Méthode pour obtenir un cluster par ID
  public getClusterById(id: string): CamundaCluster | undefined {
    return this.clusters.find(cluster => cluster.id === id);
  }
}
