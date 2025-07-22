import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { KeycloakService } from './app/pages/service/authentication/keycloak.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterModule],
    template: `<router-outlet></router-outlet>`
})
export class AppComponent implements OnInit{
    private keycloak = inject(KeycloakService);

    ngOnInit() {
        console.log(this.keycloak.getToken());
    }
}
