import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

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
interface order {
  orderId: string;
}
interface CheckoutResponse {
  order: order; // Define response structure
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
  selectedPaymentMethod: string = 'COD'; // Default to COD
  loading = true;
  error: string | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchAddresses();
    this.fetchCart();
  }
  placeOrderButton:boolean = true
  fetchAddresses(): void {
    const token = this.authService.getToken();
    this.http.get<AddressesResponse>('http://localhost:8084/address/get', {
      headers: { authorization: `${token}` }
    }).subscribe({
      next: (response) => {
        this.addresses = response.addresses;
        if (this.addresses.length > 0) {
          this.selectedAddressId = this.addresses[0].AddressId; // Default to first address
        }
      },
      error: (err) => {
        this.error = 'Failed to load addresses.';
        console.error('Addresses fetch error:', err);
      },
      complete: () => {
        this.checkLoadingComplete();
      }
    });
  }

  fetchCart(): void {
    const token = this.authService.getToken();
    this.http.get<CartResponse>('http://localhost:8084/cart/get', {
      headers: { authorization: `${token}` }
    }).subscribe({
      next: (response) => {
        this.cart = response.cart;
      },
      error: (err) => {
        this.error = 'Failed to load cart.';
        console.error('Cart fetch error:', err);
      },
      complete: () => {
        this.checkLoadingComplete();
      }
    });
  }

  checkLoadingComplete(): void {
    if (this.addresses && this.cart !== null) {
      this.loading = false;
    }
  }

  placeOrder(): void {
    this.placeOrderButton = false;
    if (!this.selectedAddressId || !this.cart) {
      this.snackBar.open('Please select an address and ensure cart is loaded.', 'Close', { duration: 3000 });
      return;
    }

    const checkoutRequest: CheckoutRequest = {
      method_of_payment: this.selectedPaymentMethod,
      address_id: this.selectedAddressId
      // transactionId omitted for COD
    };
    console.log(checkoutRequest);
    const token = this.authService.getToken();
    this.http.post<CheckoutResponse>('http://localhost:8084/cart/checkout', checkoutRequest, {
      headers: { authorization: `${token}` }
    }).subscribe({
      next: (response) => {
        this.snackBar.open('Order placed successfully!', 'Close', { duration: 3000 });
        console.log(response.order.orderId);
        this.router.navigate(['/orders', response.order.orderId]); // Redirect to orders page
      },
      error: (err) => {
        this.snackBar.open('Failed to place order. Please try again.', 'Close', { duration: 3000 });
        console.error('Checkout error:', err);
      }
    });
    this.placeOrderButton = true;
  }
}
