## Who moved my ngModel?

One of the great features introduced in AngularJS 1.x was two way data binding.  It was easy to add an ngModel attribute to an input and have that element be directly bound to a property on a JSON object.  It was also just as easy to create a new UI element through a directive or component and model bind it using ngModel and have the model binding pass from parent to child.  Then Angular (2+) came along and changed everything with a whole new method for databinding controls and components.

Databinding is still a core part of Angular and ngModel still plays its part.  But if you want to create a custom component that can databind using ngModel or it's reactive form counterpart formControlName, there are a few more steps.

All of the code is available on my [Github Repo](https://github.com/JoelRichman/angular-data-bindable-component)

My business case in this example is a dropdown that populates from an API call that can be reused in multiple places and is data bindable.

We'll start with a scratch Angular project created using the `ng New` method from the Angular CLI.  Next we'll create our reusable dropdown component.

    ng g component dropdown

There is now a folder called dropdown with the files for the new dropdown.component.  I modified the template property to be a select element. For now, we will populate this select from an array.  I've stripped out the constructor and onInit, which are not needed at this time.

    import { Component } from '@angular/core';

    @Component({
      selector: 'app-dropdown',
      template: `
          <select>
          <option *ngFor="let item of items" [value]="item.id" [selected]="item.id == value">{{ item.name }}</option>
                {{ item.name }}
            </option>
          </select>
      `
    })
    export class DropdownComponent {
      items = [
        { id: 1, name: 'item 1' },
        { id: 2, name: 'item 2' },
        { id: 3, name: 'item 3' },
      ];
    }

Let's tackle making this component data bindable.  We will need to implement the interface `ControlValueAccessor` from the '@angular/forms' library.  Let's add that to the class declaration:

`export class DropdownComponent implements ControlValueAccessor {`

Now we need to implement the interface:

The hosting component needs a way to communicate a value to our component.  For this we will need to add a local variable to contain this value and a writeValue method to assign it.  The value can be any type, in this case I will be using a number to represent the Id of the selected item in the dropdown.

    value: Number;

    writeValue(value) {
      this.value = value;
    }

Next we need a way to send that value back to the host.  For that we will need an onChange property that takes a function and a registerOnChange function that will allow the consumer to register the change event.

    onChange = (number?: Number) => {}
    registerOnChange(fn: (number: Number) => void): void {
      this.onChange = fn;
    }

Since Angular forms also notify changes for controls that have been touched, we need to implement methods for that as well.

    onTouched = () => {};
    registerOnTouched(fn: () => void): void {
      this.onTouched = fn;
    }

That fulfills the requirement of the interface, however we do need a way to update our local value variable and call the onChange method.  So I will add one more method:

    onValueChange(value: number) {
      this.value = value;
      this.onChange(this.value);
    }

We will bind this to the change event of the select control:

    <select (change)="onValueChange($event.target.value)">

The final piece of the puzzle is to add a provider for this data bindable component.  We will add the provider above the component declaration.

    export const DROPDOWN_VALUE_ACCESSOR =  {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropdownComponent),
      multi: true
    };

and include it in the providers property:

    providers: [DROPDOWN_VALUE_ACCESSOR]

The final component looks like this:

    import { Component, forwardRef } from '@angular/core';
    import { ControlValueAccessor, NG_VALUE_ACCESSOR, } from '@angular/forms';

    export const DROPDOWN_VALUE_ACCESSOR =  {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropdownComponent),
      multi: true
    };

    @Component({
      selector: 'app-dropdown',
      template: `
        <select (change)="onValueChange($event.target.value)">
          <option *ngFor="let item of items" [value]="item.id" [selected]="item.id == value">{{ item.name }}</option>
        </select>
      `,
      providers: [DROPDOWN_VALUE_ACCESSOR]
    })
    export class DropdownComponent implements ControlValueAccessor {

      items = [
        { id: 1, name: 'item 1' },
        { id: 2, name: 'item 2' },
        { id: 3, name: 'item 3' },
      ];

      // local variable to store the value of the control
      value: number;

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

Let's implement this on a form and see how it works.  Open up the app.component file.  Replace the content in the template property with the dropdown component.  We'll also need a value property on our component to bind to.

    import { Component } from '@angular/core';

    @Component({
      selector: 'app-root',
      template: `
        <app-dropdown [(ngModel)]="value"></app-dropdown>
        <div>
          selected value: {{ value }}
        </div>
      `,
      styles: []
    })
    export class AppComponent {
      value = 1;
    }

Let's run the app and checkout our work thus far.

`ng serve`

Open the browser of choice and load http://localhost:4200.  Try changing the dropdown, you should see the selected value change as well.

That is all that is needed to implement model binding on a component.  This method works with template driven forms using ngModel and reactive forms using formControlName.  This will fulfill most needs of creating reusable components. The rest of this post will be devoted to scaffolding out an implementation to populate the list from a service.  This will fulfill the need of making this component reusable in a multitude of other components.

Let's create our list API service.  Run the cli command to create the service:

`ng g service listApi`

Typically in this type of service I would add a reference to httpClient.  For the sake of the demonstration I'm going to mock the response and return it as an Observable.  This way, I can consume it in my component the same as if I had made the API call.

    import { Injectable } from '@angular/core';
    import { Observable, of } from 'rxjs';

    @Injectable({
      providedIn: 'root'
    })
    export class ListApiService {

      lists = {
        'list1': [
          { id: 1, name: 'item 1' },
          { id: 2, name: 'item 2' },
          { id: 3, name: 'item 3' }
        ],
        'list2': [
          { id: 4, name: 'item 4' },
          { id: 5, name: 'item 5' },
          { id: 6, name: 'item 6' }
        ]
      };

      constructor() { }

      public getList(key: string): Observable<any> {
        return of(this.lists[key]);
      }
    }

Notice that I'm returning an observable result using the `of` operator.  This allows me to subscribe to the return the same way as an http call.  I will then modify the dropdown component to inject the listApiService in the constructor.

    constructor(private listApi: ListApiService) {}

We also need a way to indicate which list we would like to retrieve.  For that we will add an Input.

    @Input() list: string;

We will need to watch when the list input changes to know when to make our API call and retrieve the list.  For that we will use the ngOnChanges event.  I will also remove the hard-coded list of items.

    ngOnChanges() {
      this.listApi
        .getList(this.list)
        .subscribe(listValues => this.items = listValues);
    }

The final component looks like this:

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
          <option *ngFor="let item of items" [value]="item.id" [selected]="item.id == value">{{ item.name }}</option>
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

Lastly, we will update the implementation of the dropdown component in our app component to utilize the list input.  I've added second select to demonstrate loading multiple copies of the component with different dropdown lists and separate data bindings.

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

This completes the objective.  The implementation of ngModel in AngularJS was block box.  It was easy to use in simple applications, when requirements became more complex, it was much harder to modify the behavior.  The Angular implementation does require more code to implement, it is much more configurable to individual use cases.  We have clear access to the change pipeline and can modify as needed.

Thank you for reading.  Please leave questions, comments and feedback below.
