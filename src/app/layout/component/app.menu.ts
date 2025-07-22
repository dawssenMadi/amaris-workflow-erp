import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `
})
export class AppMenu {
    model: MenuItem[] = [];

    ngOnInit() {
        this.model = [
            {
                label: 'applications Pack ',
                items: [
                    { label: 'Dictionnaire de Données', icon: 'pi pi-fw pi-book', routerLink: ['/uikit/table'] },
  {
                    label: 'Audit Application',
                    icon: 'pi pi-fw pi-search',
 items: [
                            {
                                label: 'Démarrer Audit',
                                icon: 'pi pi-fw pi-play',
                                routerLink: ['/uikit/start-audit']
                                // routerLink: ['/audit/start']
                            },
                            {
                                label: 'Audits',
                                icon: 'pi pi-fw pi-list',
                                routerLink: ['/uikit/audit']

                                // routerLink: ['/audit/list']
                            },
                            {
                                label: 'Actions',
                                icon: 'pi pi-fw pi-cog',
                                 routerLink: ['/uikit/actions']

                                // routerLink: ['/audit/actions']
                            },
                            {
                                label: 'Planning',
                                icon: 'pi pi-fw pi-calendar',
                                // routerLink: ['/audit/planning']
                            },
                            {
                                label: 'Reporting',
                                icon: 'pi pi-fw pi-chart-bar',
                                // routerLink: ['/audit/reporting']
                            },
                        ]
                    },
                    { label: 'Test Unitaire', icon: 'pi pi-fw pi-cog', routerLink: ['/test-unitaire'] },
                    
                ]
            },
        ];
    }
}
