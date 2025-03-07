import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SearchComponent } from './search/search.component';
import { LoginComponent } from './login/login.component';
import { ProductComponent } from './product/product.component';
import {OrdersComponent} from "./orders/orders.component";
import {OrderDetailsComponent} from "./order-details/order-details.component";
import {AddressesComponent} from "./addresses/addresses.component";
import {CartComponent} from "./cart/cart.component";
import {CheckoutComponent} from "./checkout/checkout.component";
import {ReadMdComponent} from "./read-md/read-md.component";
import {AuthComponent} from "./auth/auth.component";

const routes: Routes = [
  { path: '', component: SearchComponent }, // Default route (Products page)
  { path: 'auth', component: AuthComponent },
  { path: 'login', component: LoginComponent }, // Login page
  { path: 'product/:id', component: ProductComponent }, // Product page
  { path: 'profile', component: SearchComponent }, // Placeholder
  { path: 'orders', component: OrdersComponent }, // Orders page
  { path: 'orders/:id', component: OrderDetailsComponent }, // New route for order details
  { path: 'cart', component: CartComponent }, // Add this
  { path: 'checkout', component: CheckoutComponent }, // New route for order details
  { path: 'architecture', component: ReadMdComponent},
  { path: 'addresses', component: AddressesComponent }, // Placeholder
  { path: '**', redirectTo: '' }, // Wildcard redirects to default
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
