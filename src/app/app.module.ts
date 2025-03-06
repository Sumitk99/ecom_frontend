// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatBadgeModule } from '@angular/material/badge';
import {MatListItem, MatListModule} from '@angular/material/list'; // For cart items list
import { AppComponent } from './app.component';
import { ProductComponent } from './product/product.component';
import {MatToolbarModule} from "@angular/material/toolbar";
import {HttpClientModule} from "@angular/common/http";
import { LoginComponent } from './login/login.component';
import {MatFormFieldModule} from "@angular/material/form-field";
import { SearchComponent } from './search/search.component';
import {MatGridListModule} from "@angular/material/grid-list";
import {RouterModule, Routes} from "@angular/router";
import {MatInputModule} from "@angular/material/input";
import {AppRoutingModule} from "./app-routing.module";
import {MatMenuModule} from "@angular/material/menu";
import { OrdersComponent } from './orders/orders.component';
import {MatTableModule} from "@angular/material/table";
import { OrderDetailsComponent } from './order-details/order-details.component';
import { AddressesComponent } from './addresses/addresses.component';
import { AddAddressDialogComponent } from './add-address-dialog/add-address-dialog.component';
import {MatDialogModule} from "@angular/material/dialog";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import { CartComponent } from './cart/cart.component';
import { CheckoutComponent } from './checkout/checkout.component';
import {MatRadioModule} from "@angular/material/radio";
import {MarkdownModule, MarkedOptions} from "ngx-markdown";
import { ReadMdComponent } from './read-md/read-md.component';
import { SignupComponent } from './signup/signup.component';
import { AuthComponent } from './auth/auth.component';
import {MatSelectModule} from "@angular/material/select";
import {MatTabsModule} from "@angular/material/tabs";

const routes: Routes = [
  { path: '', component: SearchComponent }, // Default route to SearchComponent
  { path: 'login', component: LoginComponent }, // Login page
  { path: 'product/:id', component: ProductComponent }, // Product page with dynamic ID
  { path: '**', redirectTo: '' } // Wildcard route redirects to default
];
@NgModule({
  declarations: [
    AppComponent,
    ProductComponent,
    LoginComponent,
    SearchComponent,
    OrdersComponent,
    OrderDetailsComponent,
    AddressesComponent,
    AddAddressDialogComponent,
    CartComponent,
    CheckoutComponent,
    ReadMdComponent,
    SignupComponent,
    AuthComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    RouterModule.forRoot(routes),
    MatIconModule,
    HttpClientModule,
    MatButtonToggleModule,
    MatBadgeModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatGridListModule,
    MatInputModule,
    AppRoutingModule,
    MatMenuModule,
    MatTableModule,
    MatDialogModule,
    MatSnackBarModule,
    MatRadioModule,
    MatListModule,
    MatTabsModule, // Add for tabs
    MatSelectModule, // Add for dropdown
    MarkdownModule.forRoot({
      markedOptions: {
        provide: MarkedOptions,
        useValue: {
          gfm: true, // Enables GitHub Flavored Markdown
          breaks: true, // Enables line breaks
        },
      },
    }),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
