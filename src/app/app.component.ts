import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatMenuTrigger } from '@angular/material/menu';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Apple Store';
  cartItems = 2;
  userName: string | null = null;
  isLoggedIn = false;

  constructor(private router: Router, private authService: AuthService, private http: HttpClient) {
    console.log('AppComponent initialized');
    this.authService.isLoggedIn$.subscribe(loggedIn => {
      this.isLoggedIn = loggedIn;
      this.userName = this.authService.getUserName();
    });
  }
  // ngOnInit() {
  //   this.fetchCartCount()
  // }
  viewCart(): void {
    this.router.navigate(['/cart']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  openMenu(trigger: MatMenuTrigger): void {
    trigger.openMenu();
  }

  closeMenu(trigger: MatMenuTrigger): void {
    trigger.closeMenu();
  }
  // fetchCartCount(): void {
  //   const token = this.authService.getToken();
  //   this.http.get<CartResponse>('http://localhost:8084/cart/get', {
  //     headers: { authorization: `${token}` }
  //   }).subscribe({
  //     next: (response) => {
  //       this.cartItems = response.cart.items.length;
  //     }
  //   });
  // }
}
