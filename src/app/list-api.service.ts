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
