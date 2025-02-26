import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

interface OrderProduct {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageURL: string;
}

interface OrderAddress {
  AddressId: string;
  userId: string;
  Street: string;
  ApartmentUnit: string;
  City: string;
  State: string;
  Country: string;
  ZipCode: string;
  CreatedAt: string;
  Name: string;
  Phone: string;
}

interface Order {
  orderId: string;
  createdAt: string;
  accountId: string;
  totalPrice: number;
  MethodOfPayment: string;
  products: OrderProduct[];
  PaymentStatus: string;
  OrderStatus: string;
  address: OrderAddress;
}

interface OrderDetailsResponse {
  order: Order;
}

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss']
})
export class OrderDetailsComponent implements OnInit {
  order: Order | null = null;
  loading = true;
  error: string | null = null;

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.fetchOrderDetails(orderId);
    } else {
      this.error = 'No order ID provided.';
      this.loading = false;
    }
  }

  fetchOrderDetails(orderId: string): void {
    const token = localStorage.getItem('jwtToken');
    this.loading = true;
    this.error = null;
    const apiUrl = `https://micro-scale.software/api/user/order/${orderId}`;
    this.http.get<OrderDetailsResponse>(apiUrl, {
      headers: { authorization: `${token}` }
    }).subscribe({
      next: (response) => {
        this.order = {
          ...response.order,
          createdAt: this.formatDate(response.order.createdAt)
        };
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load order details. Please try again later.';
        this.loading = false;
        console.error('Order details error:', err);
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
}
