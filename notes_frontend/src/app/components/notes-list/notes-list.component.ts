import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Note } from '../../models/note.model';

@Component({
  selector: 'app-notes-list',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './notes-list.component.html',
  styleUrl: './notes-list.component.css'
})
export class NotesListComponent {
  @Input() notes: Note[] = [];
  @Output() selectNote = new EventEmitter<string>();
  @Output() deleteNote = new EventEmitter<string>();

  // PUBLIC_INTERFACE
  onSelect(id: string) {
    this.selectNote.emit(id);
  }

  // PUBLIC_INTERFACE
  onDelete(id: string, ev: any) {
    if (ev?.stopPropagation) ev.stopPropagation();
    this.deleteNote.emit(id);
  }

  excerpt(text: string, max = 120): string {
    const t = text.replace(/\s+/g, ' ').trim();
    if (t.length <= max) return t;
    return t.slice(0, max - 1) + '…';
  }
}
