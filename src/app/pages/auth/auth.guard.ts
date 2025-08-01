import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { KeycloakService } from '../service/authentication/keycloak.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private keycloakService: KeycloakService, private router: Router) {}

  canActivate(): boolean {
    const token = this.keycloakService.getToken();
    if (token) {
      return true;
    } else {
      this.router.navigate(['/login']); // ou déclenche login via Keycloak ?
      return false;
    }
  }
}
