import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { AddAddressDialogComponent } from '../add-address-dialog/add-address-dialog.component';

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

interface AddressesResponse {
  addresses: Address[];
}

@Component({
  selector: 'app-addresses',
  templateUrl: './addresses.component.html',
  styleUrls: ['./addresses.component.scss']
})
export class AddressesComponent implements OnInit {
  addresses: Address[] = [];
  loading = true;
  error: string | null = null;

  constructor(private http: HttpClient, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.fetchAddresses();
  }

  fetchAddresses(): void {
    const token = localStorage.getItem('jwtToken');
    this.loading = true;
    this.error = null;
    this.http.get<AddressesResponse>('https://micro-scale.software/api/address/get', {
      headers: { authorization: `${token}` }
    }).subscribe({
      next: (response) => {
        this.addresses = response.addresses;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load addresses. Please try again later.';
        this.loading = false;
        console.error('Addresses error:', err);
      }
    });
  }

  deleteAddress(addressId: string): void {
    const token = localStorage.getItem('jwtToken');
    this.http.delete(`https://micro-scale.software/api/address/delete/${addressId}`, {
      headers: { authorization: `${token}` }
    }).subscribe({
      next: () => {
        this.addresses = this.addresses.filter(addr => addr.AddressId !== addressId);
        console.log('Address deleted:', addressId);
      },
      error: (err) => {
        console.error('Delete error:', err);
        this.error = 'Failed to delete address.';
      }
    });
  }

  editAddress(addressId: string): void {
    const address = this.addresses.find(addr => addr.AddressId === addressId);
    if (!address) return;

    const dialogRef = this.dialog.open(AddAddressDialogComponent, {
      width: '500px',
      data: { isEdit: true, address: address } // Pass address object
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const token = localStorage.getItem('jwtToken');
        this.http.put<Address>(`https://micro-scale.software/api/address/edit/${addressId}`, result, {
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
            this.error = 'Failed to update address.';
          }
        });
      }
    });
  }

  addAddress(): void {
    const dialogRef = this.dialog.open(AddAddressDialogComponent, {
      width: '500px',
      data: { isEdit: false } // No address for add mode
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const token = localStorage.getItem('jwtToken');
        this.http.post<Address>('https://micro-scale.software/api/address/get', result, {
          headers: { authorization: `${token}` }
        }).subscribe({
          next: (newAddress) => {
            this.addresses.push(newAddress);
            console.log('Address added:', newAddress);
          },
          error: (err) => {
            console.error('Add address error:', err);
            this.error = 'Failed to add address.';
          }
        });
      }
    });
  }
}
