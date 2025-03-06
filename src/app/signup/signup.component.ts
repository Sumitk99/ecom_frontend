import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { environment } from '../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
interface SignupResponse {
  account: {
    id: string;
    name: string;
    email: string;
    phone: string;
    userType: string;
  };
  JWT_Token: string;
  Refresh_Token: string;
  message: string;
}

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  loading = false;
  error: string | null = null;
  hidePassword = true;
  domain: string = environment.domain;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar,
  ) {
    this.signupForm = this.fb.group({
      email: ['demo@demo.com', [Validators.required, Validators.email]],
      name: ['demo', Validators.required],
      password: ['demo123', [Validators.required, Validators.minLength(6)]],
      phone: ['+911264567291', [Validators.required, Validators.pattern(/^\+\d{10,15}$/)]],
      user_type: ['BUYER', Validators.required]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.signupForm.invalid) return;

    this.loading = true;
    this.error = null;

    const signupData = {
      email: this.signupForm.get('email')?.value,
      name: this.signupForm.get('name')?.value,
      password: this.signupForm.get('password')?.value,
      phone: this.signupForm.get('phone')?.value,
      user_type: this.signupForm.get('user_type')?.value
    };

    this.http.post<SignupResponse>(`${this.domain}/signup`, signupData).subscribe({
      next: (response) => {
        this.authService.login(response.JWT_Token, response.Refresh_Token, response.account);
        this.loading = false;
        console.log('Signup successful:', {
          jwtToken: response.JWT_Token,
          refreshToken: response.Refresh_Token,
          account: response.account,
          message: response.message
        });
        this.router.navigate(['/']); // Auto-login redirects to home
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Signup failed. Please try again.', 'OK', {duration:5000})
        this.loading = false;
      }
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }
}
