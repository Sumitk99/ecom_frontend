import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { environment } from '../../environments/environment';

interface Product {
  title: string;
  productId: string;
  price: number;
  sellerName: string;
  imageURL: string;
}

interface SearchResponse {
  products: Product[];
}

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  searchControl = new FormControl('');
  products: Product[] = [];
  loading = false;
  error: string | null = null;
  domain: string = environment.domain;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.fetchProducts('');
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(searchTerm => {
        this.fetchProducts(searchTerm || '');
      });
  }

  fetchProducts(searchTerm: string): void {
    this.loading = true;
    this.error = null;
    const apiUrl = `${this.domain}/products?search=${encodeURIComponent(searchTerm)}`;
    this.http.get<SearchResponse>(apiUrl).subscribe({
      next: (response) => {
        this.products = response.products;
          this.loading = false;
          },
      error: (err) => {
        this.error = 'Failed to load products. Please try again later.';
        this.loading = false;
        console.error('Search error:', err);
      }
    });
  }

  goToProduct(productId: string): void {
    this.router.navigate(['/product', productId]);
  }
}
