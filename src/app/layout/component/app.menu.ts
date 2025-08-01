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
                items: [{
                    label: 'Audit Application',
                    icon: 'pi pi-fw pi-search',
                    items: [
                            {
                                label: 'Démarrer Audit',
                                icon: 'pi pi-fw pi-play',
                                routerLink: ['/start-audit']
                            },
                            {
                                label: 'Audits',
                                icon: 'pi pi-fw pi-list',
                                routerLink: ['/audit']

                            },
                            {
                                label: 'Actions',
                                icon: 'pi pi-fw pi-cog',
                                 routerLink: ['/actions']
                            },
                            {
                                label: 'Planning',
                                icon: 'pi pi-fw pi-calendar',
                                routerLink: ['/Planning']
                            },
                            {
                                label: 'Reporting',
                                icon: 'pi pi-fw pi-chart-bar',
                            },
                        ]
                    },
                    { label: 'Data Dictionnary', icon: 'pi pi-fw pi-book', routerLink: ['/dictionnaire'] },
                    { label: 'Audit Application', icon: 'pi pi-fw pi-search', routerLink: ['/audit'] },
                    { label: 'Test Pilot', icon: 'pi pi-fw pi-cog', routerLink: ['/test-unitaire'] },
                    { label: 'Resolution Center', icon: 'pi pi-fw pi-cog', routerLink: ['/wiki'] },
                    {label: 'Camunda',
                        icon: 'pi pi-fw pi-search',
                        items: [{ label: 'Modeler', icon: 'pi pi-fw pi-book', routerLink: ['/modeler']},
                                { label: 'Clusters', icon: 'pi pi-fw pi-book', routerLink: ['/clusters']}
                        ]},
                    { label: 'Audit360', icon: 'pi pi-fw pi-cog', routerLink: ['/rpa-audit'] },


                ]
            },
        ];
    }
}
