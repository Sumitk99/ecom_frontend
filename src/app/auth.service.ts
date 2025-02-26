import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  userType: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Reactive state for login status
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.loggedIn.asObservable();

  constructor() {
    // Optional: Log initial state for debugging
    console.log('AuthService initialized. Logged in:', this.loggedIn.value);
  }

  // Check if a token exists in localStorage
  private hasToken(): boolean {
    return !!localStorage.getItem('jwtToken');
  }

  // Login method to store tokens and user data
  login(jwtToken: string, refreshToken: string, user: User): void {
    localStorage.setItem('jwtToken', jwtToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    this.loggedIn.next(true); // Update login state
  }

  // Logout method to clear tokens and user data
  logout(): void {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.loggedIn.next(false); // Update login state
  }

  // Get the JWT token
  getToken(): string | null {
    return localStorage.getItem('jwtToken');
  }

  // Get the refresh token
  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  // Get the user object
  getUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Get the user's name (convenience method)
  getUserName(): string | null {
    const user = this.getUser();
    return user ? user.name : null;
  }

  // Check login status synchronously (non-reactive)
  isLoggedIn(): boolean {
    return this.hasToken();
  }
}
