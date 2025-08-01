import { Injectable } from '@angular/core';

export interface WikiArticle {
  id: string;
  title: string;
  content: string;
  author: string;
  creationDate: Date;
  type: 'page' | 'blog' | 'comment';
  space: string;
  owner: string;
  imageUrl?: string;
  category?: string; // Ajouté pour la catégorie
  hashtags?: string[];

  
}

@Injectable({ providedIn: 'root' })
export class WikiService {
  private articles: WikiArticle[] = [
    {
      id: '1',
      author: 'Oussema Bejaoui',
  creationDate: new Date(2025, 7, 6),
  title: 'Erreur Web Service : plus de tentatives de retry disponibles (No more retries left)',
  content: `
    <p>Lors de l’appel à un service externe via une tâche asynchrone, le système a épuisé toutes ses tentatives de retry sans succès.</p>
    <p><strong>Symptômes :</strong></p>
    <ul>
      <li>La tâche échoue définitivement avec l’erreur "No more retries left".</li>
      <li>Le message d’erreur indique : "A network was not found for this address."</li>
      <li>Code de réponse HTTP 500 retourné par le service distant.</li>
    </ul>
    <p><strong>Cause :</strong> Le service externe n’est pas accessible ou l’URL ciblée est incorrecte, empêchant la communication réseau.</p>
    <p><strong>Détails techniques :</strong></p>
    <p>
    {request={method=PATCH, uri=https://apisir.pin.prd.ha.nbyt.fr/loop/ws-usi-roi-api/api/Task/63383/complete/LP_DNSC_COB, 
    headers={Authorization=[], Accept=[*/*], Content-Type=[application/json;charset=UTF-8]}, bodyValue=, connectionTimeout=50000, https=true},
     response={code=500, message={libelle=A network was not found for this address., origine=A network was not found for this address.}}}
    </p>
    <p><strong>Solution :</strong></p>
    <ul>
      <li>Vérifier la disponibilité du réseau et la connectivité vers le service externe.</li>
      <li>Contrôler l’URL appelée pour s’assurer qu’elle est correcte et que le service est bien en ligne.</li>
      <li>Consulter les logs réseau et les éventuelles restrictions de firewall ou proxy.</li>
      <li>Augmenter si besoin le nombre de retries ou mettre en place une stratégie de gestion des erreurs adaptée.</li>
      <li>Informer l’équipe responsable du service externe pour un diagnostic côté backend si le problème persiste.</li>
    </ul>
  `,
  owner: 'Equipe DevOps',
  space: 'Support IT',
  type: 'page',
  category: 'Condition error',
  hashtags: ['#webservice', '#retry', '#network', '#camunda']
},
    {
      id: '2',
      author: 'Amira Gharbi', 
  creationDate: new Date(2025, 7, 5),
  title: 'Erreur de conditions dans le flux BPMN : aucune condition vraie ou absence de flux par défaut',
  content: `
    <p>Cette erreur apparaît lorsqu'une passerelle exclusive (gateway) dans un processus BPMN ne trouve aucune condition évaluée à vrai et qu’aucun flux par défaut n’est défini.</p>
    <p><strong>Symptômes :</strong></p>
    <ul>
      <li>Le processus se bloque à la passerelle conditionnelle.</li>
      <li>Aucune progression possible dans le workflow.</li>
    </ul>
    <p><strong>Cause :</strong> Toutes les conditions des flux sortants de la gateway sont fausses ou non définies, et il n’y a pas de flux par défaut (default flow) prévu pour gérer ce cas.</p>
    <p><strong>Solution :</strong></p>
    <ul>
      <li>Vérifier que les expressions conditionnelles des flux sont correctes et qu’au moins une peut être vraie selon les données du processus.</li>
      <li>Ajouter un flux par défaut dans Camunda Modeler sur la passerelle conditionnelle pour garantir la continuité du processus même si aucune condition n’est satisfaite.</li>
      <li>Tester le scénario avec différentes données pour s’assurer que le processus ne se bloque pas.</li>
    </ul>
  `,
  owner: 'Equipe Support',
  space: 'Support IT',
  type: 'page',
  category: 'Condition error',
  hashtags: ['#condition', '#gateway', '#flow', '#camunda']
    },
    {
      id: '3',
      author: 'Khaled Ben Salah',  creationDate: new Date(2025, 7, 3),
  title: 'Performance dégradée lors de l’interrogation des données historiques dans Operate',
  content: `
    <p>Les requêtes vers la base de données historique prennent trop de temps et ralentissent l’application.</p>
    <p><strong>Symptômes :</strong></p>
    <ul>
      <li>Opérations lentes dans Operate.</li>
      <li>Timeouts de requêtes.</li>
    </ul>
    <p><strong>Causes :</strong> Base de données non indexée, requêtes trop larges, ou données historiques volumineuses.</p>
    <p><strong>Solution :</strong> Ajouter des index sur les colonnes fréquemment interrogées, optimiser les requêtes, archiver les anciennes données.</p>
  `,
  owner: 'Equipe BI',
  space: 'Direction Projet IT',
  type: 'page',
  category: 'Performance',
  hashtags: ['#performance', '#historique', '#database']
    },{
  id: '5',
  author: 'Ton Nom',
  creationDate: new Date(2025, 7, 5),
  title: 'Erreur de conditions dans le flux BPMN : aucune condition vraie ou absence de flux par défaut',
  content: `
    <p>Cette erreur apparaît lorsqu'une passerelle exclusive (gateway) dans un processus BPMN ne trouve aucune condition évaluée à vrai et qu’aucun flux par défaut n’est défini.</p>
    <p><strong>Symptômes :</strong></p>
    <ul>
      <li>Le processus se bloque à la passerelle conditionnelle.</li>
      <li>Aucune progression possible dans le workflow.</li>
    </ul>
    <p><strong>Cause :</strong> Toutes les conditions des flux sortants de la gateway sont fausses ou non définies, et il n’y a pas de flux par défaut (default flow) prévu pour gérer ce cas.</p>
    <p><strong>Solution :</strong></p>
    <ul>
      <li>Vérifier que les expressions conditionnelles des flux sont correctes et qu’au moins une peut être vraie selon les données du processus.</li>
      <li>Ajouter un flux par défaut dans Camunda Modeler sur la passerelle conditionnelle pour garantir la continuité du processus même si aucune condition n’est satisfaite.</li>
      <li>Tester le scénario avec différentes données pour s’assurer que le processus ne se bloque pas.</li>
    </ul>
  `,
  owner: 'Equipe Support',
  space: 'Support IT',
  type: 'page',
  category: 'Condition error',
  hashtags: ['#condition', '#gateway', '#flow', '#camunda']
}

  ];

  getArticles(): WikiArticle[] {
    return this.articles;
  }

  getArticleById(id: string): WikiArticle | undefined {
    return this.articles.find(article => article.id === id);
  }

  addArticle(article: WikiArticle) {
    this.articles.unshift(article);
  }
  deleteArticleById(id: string) {
  this.articles = this.articles.filter(article => article.id !== id);
}

}
