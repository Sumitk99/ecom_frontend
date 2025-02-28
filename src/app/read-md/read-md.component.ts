import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-read-md',
  templateUrl: './read-md.component.html',
  styleUrls: ['./read-md.component.scss']
})
export class ReadMdComponent implements OnInit {
  markdownContent: string = '';
  loading: boolean = true;
  error: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadMarkdown();
  }

  loadMarkdown() {
    this.loading = true;
    this.error = '';

    const rawMarkdownUrl = 'https://raw.githubusercontent.com/Sumitk99/ecom_microservices/master/readme.md';

    this.http.get(rawMarkdownUrl, { responseType: 'text' })
      .subscribe({
        next: (data) => {
          this.markdownContent = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = `Failed to load README.md: ${err.message}`;
          this.loading = false;
        }
      });
  }
}
