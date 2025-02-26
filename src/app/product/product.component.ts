import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';
import {MatSnackBar} from "@angular/material/snack-bar";

interface Color {
  colorName: string;
  hex: string;
}

interface Product {
  locations: string[];
  sizes: string[] | null;
  colors: Color[] | null;
  productId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  sellerId: string;
  sellerName: string;
  availableQuantity: string;
}

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit {
  product: Product | null = null;
  selectedSize: string = '';
  selectedColor: Color = { colorName: '', hex: '' };
  quantity: number = 1;
  loading = true;
  error: string | null = null;
  isAddedToCart = false;

  constructor(
      private http: HttpClient,
      private route: ActivatedRoute,
      private authService: AuthService,
      private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.fetchProductData(productId);
    } else {
      this.error = 'No product ID provided.';
      this.loading = false;
    }
  }

  fetchProductData(productId: string): void {
    const token = this.authService.getToken();
    this.loading = true;
    this.error = null;
    const apiUrl = `http://localhost:8084/product/${productId}`;
    this.http.get<Product>(apiUrl, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (data) => {
        this.product = data; // Assuming createdAt isn’t in this response; adjust if needed
        this.initializeSelections();
        this.loading = false;
      },
      error: (err) => {

        this.error = 'Failed to load product data. Please try again later.';
        this.loading = false;
        console.error('API Error:', err);
      }
    });
  }

  initializeSelections(): void {
    if (!this.product) return;
    if (this.product.sizes?.length) {
      this.selectedSize = this.product.sizes[0];
    }
    if (this.product.colors?.length && this.product.colors[0]?.colorName) {
      this.selectedColor = this.product.colors[0];
    } else {
      this.product.colors = [
        { colorName: 'Black', hex: '#000000' },
        { colorName: 'White', hex: '#FFFFFF' }
      ];
      this.selectedColor = this.product.colors[0];
    }
  }

  hasValidColors(): boolean {
    return !!(this.product?.colors?.length && this.product.colors[0]?.colorName);
  }

  incrementQuantity(): void {
    if (this.product && this.quantity < parseInt(this.product.availableQuantity)) {
      this.quantity++;
    }
  }

  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    if (!this.product || this.isAddedToCart) return;
    const productId = this.route.snapshot.paramMap.get('id');

    const token = this.authService.getToken();
    const apiUrl = `http://localhost:8084/cart/add/${productId}/${this.quantity}`;

    this.http.post<{ success: boolean; cartItemId: string }>(apiUrl, null, {
      headers: { authorization: `${token}` }
    }).subscribe({
      next: (response) => {
        this.isAddedToCart = true; // Disable button and change text
        console.log('Added to cart:', {
          productId: this.product!.productId,
          quantity: this.quantity,
          cartItemId: response.cartItemId
        });
      },
      error: (err) => {
        if (err.status === 409) {
          this.isAddedToCart = true;
          this.snackBar.open('Item already exists in cart.', 'Close', { duration: 3000 });
        } else {
          console.error('Add to cart error:', err);
          this.snackBar.open('Failed to add to cart. Please try again.', 'Close', {duration: 3000});
        }
      }
    });
  }

  buyNow(): void {
    if (!this.product) return;
    console.log('Buy now:', {
      product: this.product.name,
      size: this.selectedSize,
      color: this.selectedColor,
      quantity: this.quantity,
      total: (this.product.price * this.quantity).toFixed(2)
    });
  }
}
