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
export interface ProcessDictionaryDto {
  processName: string;
  processId: string;
  processVersion: string;
  elements: DictionaryEntry[];
}
@Injectable({ providedIn: 'root' })
export class DictionaryService {
  private apiUrl = 'http://localhost:8099/api/dictionary/entries';

  constructor(private http: HttpClient) {}

  getEntries(): Observable<DictionaryEntry[]> {
    return this.http.get<DictionaryEntry[]>(this.apiUrl);
  }
  getEntriesGroupedByProcess(): Observable<ProcessDictionaryDto[]> {
  return this.http.get<ProcessDictionaryDto[]>(`${this.apiUrl.replace('/entries', '')}/grouped`);
  }
  deleteEntry(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateEntry(id: number, entry: DictionaryEntry): Observable<DictionaryEntry> {
    return this.http.put<DictionaryEntry>(`${this.apiUrl}/${id}`, entry);
  }

  createEntry(entry: DictionaryEntry): Observable<DictionaryEntry> {
    return this.http.post<DictionaryEntry>(this.apiUrl, entry);
  }

  getEntriesByType(type: string): Observable<DictionaryEntry[]> {
    return this.http.get<DictionaryEntry[]>(`${this.apiUrl.replace('/entries', '')}/types/${type}`);
  }

  searchSimilarEntries(elementName: string, threshold: number): Observable<any[]> {
    const params = new URLSearchParams({ elementName, threshold: threshold.toString() });
    return this.http.get<any[]>(`${this.apiUrl.replace('/entries', '')}/similar?${params.toString()}`);
  }
  extractBpmnData(): Observable<string> {
  const url = this.apiUrl.replace('/entries', '') + '/extract';
  return this.http.post(url, null, { responseType: 'text' });
}

}
