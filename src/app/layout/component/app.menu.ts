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
                label: 'Applications Pack',
                items: [
                    { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: [''] },
                    { label: 'Data Dictionary', icon: 'pi pi-fw pi-database', routerLink: ['/dictionnaire'] },
                    { label: 'Test Pilot', icon: 'pi pi-fw pi-code', routerLink: ['/test-unitaire'] },
                    { label: 'Resolution Center', icon: 'pi pi-fw pi-question-circle', routerLink: ['/wiki'] },
                    {
                        label: 'Autocomplete',
                        icon: 'pi pi-fw pi-cog',
                        items: [
                            { label: 'Modeler', icon: 'pi pi-fw pi-sitemap', routerLink: ['/modeler'] },
                            { label: 'Clusters', icon: 'pi pi-fw pi-th-large', routerLink: ['/clusters'] }
                        ]
                    },
                    { label: 'Audit360', icon: 'pi pi-fw pi-eye', items: [
                            {
                                label: 'Audit360',
                                icon: 'pi pi-fw pi-eye',
                                routerLink: ['/rpa-audit']
                            },
                            {
                                label: 'Actions',
                                icon: 'pi pi-fw pi-wrench',
                                routerLink: ['/actions']
                            },
                        ],
                    },
                ]
            },
        ];
    }
}
