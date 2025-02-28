import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import {environment} from "../../environments/environment";

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
  domain: string = environment.domain;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.fetchCart();
  }

  fetchCart(): void {
    const token = this.authService.getToken();
    this.loading = true;
    this.error = null;
    const apiUrl = `${this.domain}/cart/get`;
    this.http.get<CartResponse>(apiUrl, {
      headers: { authorization: `${token}` } // Fixed header key casing
    }).subscribe({
      next: (response) => {
        this.cart = response.cart;
        this.loading = false;
        if (!this.cart || this.cart.items.length === 0) {
          this.error = 'Cart is Empty.';
        }
      },
      error: (err) => {
        this.error = 'Cart is Empty.';
        this.loading = false;
        console.error('Cart fetch error:', err);
      }
    });
  }

  removeItem(productId: string): void {
    const token = this.authService.getToken();
    console.log(`Token: ${token}`);
    this.http.delete(`${this.domain}/cart/remove/${productId}`, {
      headers: { authorization: `${token}` } // Fixed header key casing
    }).subscribe({
      next: () => {
        if (this.cart) {
          this.cart.items = this.cart.items.filter(item => item.productId !== productId);
          this.updateTotalPrice();
          if (this.cart.items.length === 0) {
            this.cart = null; // Reset cart to null if empty
            this.error = 'Cart is Empty.';
          }
        }
        console.log('Item removed:', productId);
      },
      error: (err) => {
        console.error('Remove item error:', err);
        // this.snackBar.open(`Error while removing item: ${err.message || 'Unknown error'}`, 'Close', { duration: 3000 });
        // Optionally re-fetch cart to sync with backend
        this.fetchCart();
      }
    });
  }

  adjustQuantity(productId: string, newQuantity: number): void {
    if (newQuantity < 1) {
      this.removeItem(productId); // Remove if quantity goes below 1
      return;
    }

    const token = this.authService.getToken();
    const apiUrl = `${this.domain}/cart/update/${productId}/${newQuantity}`;
    this.http.put<{ success: boolean; cartItemId: string }>(apiUrl, null, {
      headers: { authorization: `${token}` }
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
        this.snackBar.open(`Error while updating quantity: ${err.message || 'Unknown error'}`, 'Close', { duration: 3000 });
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

  proceedToCheckout(){
    this.router.navigate(['/checkout']);
  }
}
