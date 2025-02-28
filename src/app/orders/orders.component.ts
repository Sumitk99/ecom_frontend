import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

interface Order {
  OrderId: string;
  createdAt: string;
  TotalPrice: string;
  OrderStatus: string;
}

interface OrdersResponse {
  orders: Order[];
}

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  displayedColumns: string[] = ['orderId', 'date', 'totalPrice', 'status'];
  orders: Order[] = [];
  loading = true;
  error: string | null = null;
  domain: string = environment.domain;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.fetchOrders();
  }

  fetchOrders(): void {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      this.error = 'No authentication token found. Please log in.';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.error = null;
    this.http.get<OrdersResponse>(`${this.domain}/user/orders`, {
      headers: { authorization: `${token}` }
    }).subscribe({
      next: (response) => {
        console.log('Orders response:', response); // Debug log
        if (response && Array.isArray(response.orders)) {
          this.orders = response.orders.map(order => ({
            ...order,
            createdAt: this.formatDate(order.createdAt)
          }));
        } else {
          this.orders = []; // Default to empty array if response is invalid
          console.warn('No orders found or invalid response structure:', response);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Orders fetch error:', err); // Debug log
        this.error = err.error?.message || 'Failed to load orders. Please try again later.';
        this.orders = []; // Reset orders on error
        this.loading = false;
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  viewOrderDetails(orderId: string): void {
    this.router.navigate(['/orders', orderId]);
  }

  startShopping(): void {
    this.router.navigate(['/']);
  }
}
