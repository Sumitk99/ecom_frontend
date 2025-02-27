import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
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
  stock: string;
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
  isProcessing = false;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router : Router,
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
      headers: { authorization: `${token}` }
    }).subscribe({
      next: (data) => {
        this.product = data;
        this.initializeSelections();
        this.loading = false;
        console.log
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
    if (this.hasValidColors()) {
      this.selectedColor = this.product.colors![0];
    }
  }

  hasValidColors(): boolean {
    return !!(this.product?.colors?.length && this.product.colors[0]?.colorName);
  }

  incrementQuantity(): void {
    if (this.product && this.quantity < parseInt(this.product.stock)) {
      this.quantity++;
    } else {
      this.snackBar.open("Maximum Quantity Reached", 'Close', { duration: 3000 })
    }
  }

  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  isQuantityAtMax(): boolean {
    return this.product ? this.quantity >= parseInt(this.product.stock) : false;
  }

  addToCart(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.product || this.isAddedToCart || this.isProcessing) {
        return resolve(); // Ensure function always returns a Promise
      }

      this.isProcessing = true; // Disable buttons immediately

      const productId = this.route.snapshot.paramMap.get('id');
      const token = this.authService.getToken();
      const apiUrl = `http://localhost:8084/cart/add/${productId}/${this.quantity}`;

      this.http.post<{ success: boolean; cartItemId: string }>(apiUrl, null, {
        headers: { authorization: `${token}` }
      }).subscribe({
        next: () => {
          this.isAddedToCart = true;
          this.isProcessing = false;
          resolve();
        },
        error: (err) => {
          if (err.status === 409) {
            this.isAddedToCart = true;
            this.snackBar.open('Item already exists in cart.', 'Close', { duration: 3000 });
            this.isProcessing = false;
            resolve();
          } else {
            console.error('Add to cart error:', err);
            this.snackBar.open('Failed to add to cart. Please try again.', 'Close', { duration: 3000 });
            this.isProcessing = false;
            reject(err);
          }
        }
      });
    });
  }

  buyNow(): void {
    // if (this.isProcessing) return;
    //
    // this.isProcessing = true; // Disable button immediately
    this.addToCart().then(() => {
      this.router.navigate(['/cart']);
      this.isProcessing = false; // Re-enable buttons after navigation
    }).catch(() => {
      this.isProcessing = false; // Ensure buttons are re-enabled on error
      this.snackBar.open('Failed to add to cart.', 'Close', { duration: 3000 });
    });
  }
}
