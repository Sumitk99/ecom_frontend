import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

interface CartItem {
  productId: string;
  title: string;
  price: number;
  sellerId: string;
  quantity: number;
  imageURL: string;
}

interface Cart {
  cartId: string;
  items: CartItem[];
  totalPrice: number;
}

interface CartResponse {
  cart: Cart;
}

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  cart: Cart | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchCart();
  }

  fetchCart(): void {
    const token = this.authService.getToken();
    this.loading = true;
    this.error = null;
    const apiUrl = 'http://localhost:8084/cart/get';
    this.http.get<CartResponse>(apiUrl, {
      headers: { authorization: `${token}` }
    }).subscribe({
      next: (response) => {
        this.cart = response.cart;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load cart. Please try again later.';
        this.loading = false;
        console.error('Cart fetch error:', err);
      }
    });
  }

  removeItem(productId: string): void {
    const token = this.authService.getToken();
    this.http.delete(`http://localhost:8084/cart/remove/${productId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: () => {
        if (this.cart) {
          this.cart.items = this.cart.items.filter(item => item.productId !== productId);
          this.updateTotalPrice();
        }
        console.log('Item removed:', productId);
      },
      error: (err) => {
        console.error('Remove item error:', err);
        this.error = 'Failed to remove item from cart.';
      }
    });
  }

  adjustQuantity(productId: string, newQuantity: number): void {
    if (newQuantity < 1) {
      this.removeItem(productId); // Remove if quantity goes below 1
      return;
    }

    const token = this.authService.getToken();
    const apiUrl = `http://localhost:8084/cart/add/${productId}/${newQuantity}`;
    this.http.post<{ success: boolean; cartItemId: string }>(apiUrl, null, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: () => {
        if (this.cart) {
          const item = this.cart.items.find(i => i.productId === productId);
          if (item) {
            item.quantity = newQuantity;
            this.updateTotalPrice();
          }
        }
        console.log('Quantity updated:', { productId, newQuantity });
      },
      error: (err) => {
        console.error('Adjust quantity error:', err);
        this.error = 'Failed to update quantity.';
      }
    });
  }

  updateTotalPrice(): void {
    if (this.cart) {
      this.cart.totalPrice = this.cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
    }
  }

  viewProduct(productId: string): void {
    this.router.navigate(['/product', productId]);
  }
}
