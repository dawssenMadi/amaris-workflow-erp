// role.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { KeycloakService } from '../service/authentication/keycloak.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private keycloakService: KeycloakService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const expectedRoles: string[] = route.data['roles'];

    if (!expectedRoles) return true;

    const hasAnyRole = expectedRoles.some(role => this.keycloakService.hasRole(role));

    if (!hasAnyRole) {
      // Rediriger si non autorisé
      this.router.navigate(['/unauthorized']);
      return false;
    }

    return true;
  }
}
