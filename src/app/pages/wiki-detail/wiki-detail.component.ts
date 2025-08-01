import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { WikiService, WikiArticle } from '../service/WIKI/wiki.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-wiki-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wiki-detail.component.html',
  styleUrl: './wiki-detail.component.scss'
})
export class WikiDetailComponent implements OnInit {
  article: WikiArticle | undefined;
  safeContent: SafeHtml = '';
newComment: string = '';

  constructor(
    private route: ActivatedRoute,
    private wikiService: WikiService,
    private sanitizer: DomSanitizer,
    private router: Router // 👈 injecte Router

  ) {}
goBack() {
  this.router.navigate(['/wiki']);
}
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.article = this.wikiService.getArticleById(id);
      if (this.article) {
        this.safeContent = this.sanitizer.bypassSecurityTrustHtml(this.article.content);
      }
    }
  }
  editArticle() {
  if (this.article) {
    this.router.navigate(['/wiki', this.article.id, 'edit']);
  }
}

deleteArticle() {
  if (this.article && confirm('Voulez-vous vraiment supprimer cet article ?')) {
    this.wikiService.deleteArticleById(this.article.id);
    this.router.navigate(['/wiki']);
  }
}
}