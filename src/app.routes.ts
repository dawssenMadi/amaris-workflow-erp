import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Documentation } from './app/pages/documentation/documentation';
import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';
import { StartAuditComponent } from './app/pages/uikit/Start_Audit/start-audit.component';
import { AuditsComponent } from './app/pages/uikit/Audits/audits.component';
import { Actions } from './app/pages/uikit/Actions/Actions';
import { Planning } from './app/pages/uikit/Planning/Planning';
import { DictionaryTable } from './app/pages/uikit/dictionary/dictionnaryTable/DictionaryTable';
import { ModelerComponent } from './app/pages/modeler/modeler.component';
import { ClustersComponent } from './app/pages/clusters/clusters.component';
import { WikiComponent } from './app/pages/wiki/wiki.component';

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        children: [
            { path: '', component: Dashboard },
            { path: 'uikit', loadChildren: () => import('./app/pages/uikit/uikit.routes') },
            { path: 'documentation', component: Documentation },
            { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') },
            { path: 'dictionnaire', component: DictionaryTable },
            { path: 'modeler', component: ModelerComponent },
            { path: 'clusters', component: ClustersComponent },
            { path: 'wiki', component: WikiComponent },
            { path: 'start-audit',component: StartAuditComponent,
 },
            { path: 'audit',  component: AuditsComponent ,
 },
            { path: 'actions',  component: Actions , },
            { path: 'Planning', component: Planning },

        ]
    },
    { path: 'landing', component: Landing },
    { path: 'notfound', component: Notfound },
    { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
    { path: '**', redirectTo: '/notfound' }
];
