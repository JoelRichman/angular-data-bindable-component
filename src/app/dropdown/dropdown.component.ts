import { Component, forwardRef, Input, OnChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, } from '@angular/forms';
import { ListApiService } from '../list-api.service';

export const DROPDOWN_VALUE_ACCESSOR =  {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => DropdownComponent),
  multi: true
};

@Component({
  selector: 'app-dropdown',
  template: `
    <select (change)="onValueChange($event.target.value)">
      <option *ngFor="let item of items" [value]="item.id">{{ item.name }}</option>
    </select>
  `,
  providers: [DROPDOWN_VALUE_ACCESSOR]
})
export class DropdownComponent implements ControlValueAccessor, OnChanges {

  @Input() list: string;

  items = [];

  // local variable to store the value of the control
  value: number;

  constructor(private listApi: ListApiService) {}

  ngOnChanges() {
    this.listApi
      .getList(this.list)
      .subscribe(listValues => this.items = listValues);
  }

  // Accept an incoming value from the data binding source
  writeValue(value) {
    this.value = value;
  }

  // Function to call when the control value changes.
  // Allow a consumer to register an on change function
  onChange = (number?: Number) => {};
  registerOnChange(fn: (number: Number) => void): void {
    this.onChange = fn;
  }

  // Function to call when the control is touched
  // Allows a consumer to register an on touched function
  onTouched = () => {};
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  // Update the local value and notify the parent
  onValueChange(value: number) {
    this.value = value;
    this.onChange(this.value);
  }
}
