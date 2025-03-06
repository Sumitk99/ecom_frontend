import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AddAddressDialogComponent } from '../add-address-dialog/add-address-dialog.component';
import {environment} from "../../environments/environment";

interface Address {
  AddressId: string;
  Street: string;
  ApartmentUnit: string;
  City: string;
  State: string;
  Country: string;
  ZipCode: string;
  Name: string;
  Phone: string;
}

interface Order {
  orderId: string;
}

interface CheckoutResponse {
  order: Order;
}

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

interface AddressesResponse {
  addresses: Address[];
}

interface CartResponse {
  cart: Cart;
}

interface CheckoutRequest {
  method_of_payment: string;
  transaction_id?: string;
  address_id: string;
}

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  addresses: Address[] = [];
  cart: Cart | null = null;
  selectedAddressId: string | null = null;
  selectedPaymentMethod: string = 'COD';
  loading = true;
  error: string | null = null;
  placeOrderButton: boolean = true;
  domain: string = environment.domain;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const token = this.authService.getToken();
    if (!token) {
      this.router.navigate(['/auth']);
    }
    this.fetchAddresses();
    this.fetchCart();
  }

  fetchAddresses(): void {
    const token = this.authService.getToken();
    this.http.get<AddressesResponse>(`${this.domain}/address/get`, {
      headers: { authorization: `${token}` }
    }).subscribe({
      next: (response) => {
        this.addresses = response.addresses || []; // Ensure empty array if null/undefined
        if (this.addresses.length > 0 && !this.selectedAddressId) {
          this.selectedAddressId = this.addresses[0].AddressId;
        }
      },
      error: (err) => {
        this.error = 'Failed to load addresses.';
        this.addresses = []; // Set to empty array on error
        console.error('Addresses fetch error:', err);
      },
      complete: () => {
        this.checkLoadingComplete();
      }
    });
  }

  fetchCart(): void {
    const token = this.authService.getToken();
    this.http.get<CartResponse>(`${this.domain}/cart/get`, {
      headers: { authorization: `${token}` }
    }).subscribe({
      next: (response) => {
        this.cart = response.cart;
      },
      error: (err) => {
        this.error = 'Failed to load cart.';
        this.cart = null;
        console.error('Cart fetch error:', err);
      },
      complete: () => {
        this.checkLoadingComplete();
      }
    });
  }

  checkLoadingComplete(): void {
    // Check if both fetch operations have completed (success or error)
    if (this.addresses !== undefined && this.cart !== undefined) {
      this.loading = false;
    }
  }

  editAddress(addressId: string): void {
    const address = this.addresses.find(addr => addr.AddressId === addressId);
    if (!address) return;

    const dialogRef = this.dialog.open(AddAddressDialogComponent, {
      width: '500px',
      data: { isEdit: true, address: address }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const token = this.authService.getToken();
        this.http.put<Address>(`${this.domain}/address/update/${addressId}`, result, {
          headers: { authorization: `${token}` }
        }).subscribe({
          next: (updatedAddress) => {
            const index = this.addresses.findIndex(addr => addr.AddressId === addressId);
            if (index !== -1) {
              this.addresses[index] = updatedAddress;
            }
            console.log('Address updated:', updatedAddress);
          },
          error: (err) => {
            console.error('Update address error:', err);
            this.snackBar.open('Failed to update address.', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  addAddress(): void {
    const dialogRef = this.dialog.open(AddAddressDialogComponent, {
      width: '500px',
      data: { isEdit: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const token = this.authService.getToken();
        this.http.post<Address>(`${this.domain}/address/add`, result, {
          headers: { authorization: `${token}` }
        }).subscribe({
          next: (newAddress) => {
            this.addresses.push(newAddress);
            this.selectedAddressId = newAddress.AddressId; // Auto-select the new address
            console.log('Address added:', newAddress);
          },
          error: (err) => {
            console.error('Add address error:', err);
            this.snackBar.open('Failed to add address.', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  adjustQuantity(productId: string, newQuantity: number): void {
    if (newQuantity < 1) {
      this.removeItem(productId);
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

  removeItem(productId: string): void {
    const token = this.authService.getToken();
    this.http.delete(`${this.domain}/cart/remove/${productId}`, {
      headers: { authorization: `${token}` }
    }).subscribe({
      next: () => {
        if (this.cart) {
          this.cart.items = this.cart.items.filter(item => item.productId !== productId);
          this.updateTotalPrice();
          if (this.cart.items.length === 0) {
            this.cart = null;
            this.error = 'Cart is Empty.';
          }
        }
        console.log('Item removed:', productId);
      },
      error: (err) => {
        console.error('Remove item error:', err);
        this.fetchCart();
      }
    });
  }

  updateTotalPrice(): void {
    if (this.cart) {
      this.cart.totalPrice = this.cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
    }
  }

  placeOrder(): void {
    this.placeOrderButton = false;
    if (!this.selectedAddressId || !this.cart) {
      this.snackBar.open('Please select an address and ensure cart is loaded.', 'Close', { duration: 3000 });
      this.placeOrderButton = true;
      return;
    }

    const checkoutRequest: CheckoutRequest = {
      method_of_payment: this.selectedPaymentMethod,
      address_id: this.selectedAddressId
    };
    console.log('Checkout Request:', checkoutRequest);

    const token = this.authService.getToken();
    this.http.post<CheckoutResponse>(`${this.domain}/cart/checkout`, checkoutRequest, {
      headers: { authorization: `${token}` }
    }).subscribe({
      next: (response) => {
        this.snackBar.open('Order placed successfully!', 'Close', { duration: 3000 });
        console.log(response.order.orderId);
        this.router.navigate(['/orders', response.order.orderId]);
      },
      error: (err) => {
        this.snackBar.open('Failed to place order. Please try again.', 'Close', { duration: 3000 });
        console.error('Checkout error:', err);
      },
      complete: () => {
        this.placeOrderButton = true;
      }
    });
  }
}
