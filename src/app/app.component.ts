import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <app-dropdown [(ngModel)]="value" [list]="'list1'"></app-dropdown>
    <app-dropdown [(ngModel)]="value2" [list]="'list2'"></app-dropdown>
    <div>
      selected value: {{ value }}
    </div>
    <div>
      selected value 2: {{ value2 }}
    </div>
  `,
  styles: []
})
export class AppComponent {
  value = 0;
  value2 = 0;
}
