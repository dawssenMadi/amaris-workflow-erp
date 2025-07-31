import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface WebSocketAuditResult {
  rule: string;
  decision: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketAuditService implements OnDestroy {
  private client: Client;
  private connected = false;
  private auditResultsSubject = new BehaviorSubject<WebSocketAuditResult[]>([]);
  public auditResults$ = this.auditResultsSubject.asObservable();

  constructor() {
    this.initializeWebSocketConnection();
  }

  private initializeWebSocketConnection() {
    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/infinitive'),
      debug: (str) => {
        console.log('WebSocket Debug:', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = () => {
      console.log('WebSocket connecté avec succès');
      this.connected = true;
      this.subscribeToAuditMessages();
    };

    this.client.onDisconnect = () => {
      console.log('WebSocket déconnecté');
      this.connected = false;
    };

    this.client.onStompError = (frame) => {
      console.error('Erreur WebSocket STOMP:', frame.headers['message']);
      console.error('Détails:', frame.body);
    };

    this.client.activate();
  }

  private subscribeToAuditMessages() {
    if (!this.client || !this.connected) {
      console.warn('Client WebSocket non connecté');
      return;
    }

    this.client.subscribe('/topic/kafka-messages', (message) => {
      try {
        console.log('Message WebSocket reçu:', message.body);

        const auditResults: WebSocketAuditResult[] = JSON.parse(message.body);

        const filteredResults = this.filterAuditResultsForRule(auditResults);

        if (filteredResults.length > 0) {
          console.log('Résultats d\'audit filtrés:', filteredResults);
          this.auditResultsSubject.next(filteredResults);
        }

      } catch (error) {
        console.error('Erreur lors du parsing du message WebSocket:', error);
      }
    });
  }

  private filterAuditResultsForRule(results: WebSocketAuditResult[]): WebSocketAuditResult[] {
    return results;
  }

  public sendTestMessage(message: string = 'Test depuis Angular') {
    if (this.client && this.connected) {
      this.client.publish({
        destination: '/app/test',
        body: message
      });
      console.log('Message de test envoyé:', message);
    } else {
      console.warn('WebSocket non connecté, impossible d\'envoyer le message');
    }
  }

  public triggerBackendTest() {
    fetch('http://localhost:8080/api/websocket/test-transform', {
      method: 'GET'
    })
    .then(response => response.text())
    .then(data => {
      console.log('Réponse du test backend:', data);
    })
    .catch(error => {
      console.error('Erreur lors du test backend:', error);
    });
  }

  public isConnected(): boolean {
    return this.connected;
  }

  ngOnDestroy() {
    if (this.client) {
      this.client.deactivate();
    }
  }
}
