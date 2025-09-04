import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NoteService } from '../../services/note.service';
import { NoteFilter, defaultFilter } from '../../models/note-filter.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  private notes = inject(NoteService);

  @Output() createNote = new EventEmitter<void>();
  @Output() filterChange = new EventEmitter<NoteFilter>();

  model: NoteFilter = { ...defaultFilter };
  tagsInput = '';

  constructor() {
    this.notes.filterState$.subscribe(f => {
      this.model = { ...f };
    });
  }

  onSearchChange() {
    this.notes.setFilter({ query: this.model.query });
    this.filterChange.emit(this.model);
  }

  togglePinnedOnly() {
    this.model.pinnedOnly = !this.model.pinnedOnly;
    this.notes.setFilter({ pinnedOnly: this.model.pinnedOnly });
    this.filterChange.emit(this.model);
  }

  addTagsFromInput() {
    const parts = this.tagsInput.split(',').map(s => s.trim()).filter(Boolean);
    if (!parts.length) return;
    const unique = Array.from(new Set([...(this.model.tags || []), ...parts]));
    this.model.tags = unique;
    this.tagsInput = '';
    this.notes.setFilter({ tags: unique });
    this.filterChange.emit(this.model);
  }

  removeTag(tag: string) {
    const next = (this.model.tags || []).filter(t => t !== tag);
    this.model.tags = next;
    this.notes.setFilter({ tags: next });
    this.filterChange.emit(this.model);
  }

  changeSort(by: 'updatedAt' | 'createdAt' | 'title') {
    this.model.sortBy = by;
    this.notes.setFilter({ sortBy: by });
    this.filterChange.emit(this.model);
  }

  toggleSortDir() {
    this.model.sortDir = this.model.sortDir === 'asc' ? 'desc' : 'asc';
    this.notes.setFilter({ sortDir: this.model.sortDir });
    this.filterChange.emit(this.model);
  }

  onCreate() {
    this.createNote.emit();
  }
}
