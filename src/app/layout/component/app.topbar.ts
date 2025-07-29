import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from '../service/layout.service';
import { SplitButton, SplitButtonModule } from 'primeng/splitbutton';
import { KeycloakService } from '../../pages/service/authentication/keycloak.service';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, AppConfigurator, SplitButtonModule],
    template: ` <div class="layout-topbar" style="display: flex; align-items: center; justify-content: space-between;">
        <div class="layout-topbar-logo-container" style="display: flex; align-items: center;">
            <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
                <i class="pi pi-bars"></i>
            </button>
            <img src="assets/logos/bouygues.png" alt="Bouygues Logo" style="height: 2.5rem; margin-left: 0.5rem;" />
            <img src="assets/logos/plus.png" alt="Amaris Logo" style="height: 1rem; margin-left: 1.5rem;" />

            <img src="assets/logos/amaris.png" alt="Amaris Logo" style="height: 2rem; margin-left: 1.5rem;" />
        </div>
        <div style="flex: 1; display: flex; align-items: center;">
            <div class="layout-topbar-actions" style="display: flex; justify-content: flex-end; align-items: center; flex: 1;">
                <!-- existing topbar actions here -->
                <div class="layout-config-menu">
                    <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()">
                        <i [ngClass]="{ 'pi ': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme() }"></i>
                    </button>
                    <app-configurator />
                </div>

                <button class="layout-topbar-menu-button layout-topbar-action" pStyleClass="@next" enterFromClass="hidden" enterActiveClass="animate-scalein" leaveToClass="hidden" leaveActiveClass="animate-fadeout" [hideOnOutsideClick]="true">
                    <i class="pi pi-ellipsis-v"></i>
                </button>

                <div class="layout-topbar-menu hidden lg:block">
                    <div class="layout-topbar-menu-content">
                        <button type="button" class="layout-topbar-action">
                            <i class="pi pi-calendar"></i>
                            <span>Calendar</span>
                        </button>
                        <button type="button" class="layout-topbar-action">
                            <i class="pi pi-inbox"></i>
                            <span>Messages</span>
                        </button>
                        <p-splitbutton [label]="username" [model]="items" severity="secondary" [style]="{'background-color': 'transparent', 'border-color': 'transparent'}" />
                    </div>
                </div>
            </div>

        </div>
    </div>`
})
export class AppTopbar {
    items: MenuItem[];
    username: string;

    constructor(public layoutService: LayoutService, keycloak: KeycloakService) {
        this.username = keycloak.getUsername();
        this.items = [
            {
                separator: true,
            },
            {
                label: 'Déconnecter',
                icon: 'pi pi-power-off',
                command: () => {
                   keycloak.keycloak.logout();
                },
            },
        ];
    }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }
}
