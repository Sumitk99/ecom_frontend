import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface Address {
  AddressId?: string;
  Street: string;
  ApartmentUnit: string;
  City: string;
  State: string;
  Country: string;
  ZipCode: string;
  Name: string;
  Phone: string;
}

interface DialogData {
  isEdit: boolean;
  address?: Address;
}

@Component({
  selector: 'app-add-address-dialog',
  templateUrl: './add-address-dialog.component.html',
  styleUrls: ['./add-address-dialog.component.scss']
})
export class AddAddressDialogComponent {
  addressForm: FormGroup;
  isEdit: boolean;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddAddressDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.isEdit = data.isEdit;
    // Define a default Address object when no data is provided
    const defaultAddress: Address = {
      Street: '',
      ApartmentUnit: '',
      City: '',
      State: '',
      Country: '',
      ZipCode: '',
      Name: '',
      Phone: ''
    };
    const address = data.address || defaultAddress; // Use typed default
    this.addressForm = this.fb.group({
      Name: [address.Name, Validators.required],
      Street: [address.Street, Validators.required],
      ApartmentUnit: [address.ApartmentUnit],
      City: [address.City, Validators.required],
      State: [address.State, Validators.required],
      Country: [address.Country, Validators.required],
      ZipCode: [address.ZipCode, [Validators.required, Validators.pattern(/^\d{5,6}$/)]],
      Phone: [address.Phone, [Validators.required, Validators.pattern(/^\d{10}$/)]]
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.addressForm.valid) {
      this.dialogRef.close(this.addressForm.value);
    }
  }
}
