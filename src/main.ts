// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { KeycloakService } from './app/pages/service/authentication/keycloak.service';
import { AppComponent } from './app.component';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations'; // Ajoutez cette ligne

const keycloakService = new KeycloakService();

keycloakService.init()
    .then(() => {
        console.log('Keycloak initialisé avec succès');
        console.log('Début du bootstrap de l\'application...');

        return bootstrapApplication(AppComponent, {
            providers: [
                provideAnimations(),
                provideRouter(appRoutes),
                provideHttpClient(
                    withInterceptors([
                        (req, next) => {
                            const token = keycloakService.getToken();
                            if (token) {
                                req = req.clone({
                                    setHeaders: {
                                        Authorization: `Bearer ${token}`,
                                    },
                                });
                            }
                            return next(req);
                        },
                    ])
                ),
                { provide: KeycloakService, useValue: keycloakService },
            ],
        });
    })
    .then(() => {
        console.log('Application bootstrapée avec succès');
    })
    .catch(error => {
        console.error('Erreur complète:', error);
        // Afficher l'erreur à l'utilisateur
        document.body.innerHTML = `<div>Erreur de chargement: ${error.message}</div>`;
    });
