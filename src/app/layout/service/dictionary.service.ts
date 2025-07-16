import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DictionaryEntry {
  id: number;
  elementType: string;
  elementName: string;
  elementId: string;
  processName: string;
  processId: string;
  processVersion: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class DictionaryService {
  private apiUrl = 'http://localhost:8099/api/dictionary/entries';

  constructor(private http: HttpClient) {}

  getEntries(): Observable<DictionaryEntry[]> {
    return this.http.get<DictionaryEntry[]>(this.apiUrl);
  }
}
