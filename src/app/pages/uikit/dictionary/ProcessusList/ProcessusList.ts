import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { ProcessDictionaryDto } from '../../../../layout/service/dictionary.service';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon'; 


@Component({
  selector: 'app-processus-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,      
    IconFieldModule,
    InputIconModule,    
  ],
  templateUrl: './ProcessusList.html',
  styleUrls: ['./ProcessusList.css']
})
export class ProcessusList {
  @Input() processGroups: ProcessDictionaryDto[] = [];
  @Output() processSelected = new EventEmitter<ProcessDictionaryDto>();

  searchValue: string = '';

  selectProcess(process: ProcessDictionaryDto) {
    this.processSelected.emit(process);
  }

  onSearchInput(event: any) {
    this.searchValue = event.target.value;
  }

  get filteredProcessGroups(): ProcessDictionaryDto[] {
    if (!this.searchValue) return this.processGroups;
    const val = this.searchValue.toLowerCase();
    return this.processGroups.filter(
      p =>
        p.processName.toLowerCase().includes(val) ||
        p.processId.toLowerCase().includes(val) ||
        p.processVersion.toLowerCase().includes(val)
    );
  }
}