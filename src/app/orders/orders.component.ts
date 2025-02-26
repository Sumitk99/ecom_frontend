import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

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
  displayedColumns: string[] = ['orderId', 'date', 'totalPrice', 'status']; // Removed 'actions'
  orders: Order[] = [];
  loading = true;
  error: string | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.fetchOrders();
  }

  fetchOrders(): void {
    const token = localStorage.getItem('jwtToken');
    this.loading = true;
    this.error = null;
    this.http.get<OrdersResponse>('https://micro-scale.software/api/user/orders', {
      headers: { authorization: `${token}` }
    }).subscribe({
      next: (response) => {
        this.orders = response.orders.map(order => ({
          ...order,
          createdAt: this.formatDate(order.createdAt)
        }));
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load orders. Please try again later.';
        this.loading = false;
        console.error('Orders error:', err);
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
}
