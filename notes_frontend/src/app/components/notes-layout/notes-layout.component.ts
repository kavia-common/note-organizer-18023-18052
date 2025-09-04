import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoteService } from '../../services/note.service';
import { Note } from '../../models/note.model';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NotesListComponent } from '../notes-list/notes-list.component';
import { NoteEditorComponent } from '../note-editor/note-editor.component';

@Component({
  selector: 'app-notes-layout',
  standalone: true,
  imports: [CommonModule, SidebarComponent, NotesListComponent, NoteEditorComponent],
  templateUrl: './notes-layout.component.html',
  styleUrl: './notes-layout.component.css'
})
export class NotesLayoutComponent {
  private notes = inject(NoteService);

  filteredNotes = signal<Note[]>([]);
  selectedNote = signal<Note | null>(null);

  constructor() {
    // Initialize demo notes or backend fetch
    this.notes.init();

    effect(() => {
      this.notes.filtered$.subscribe(list => this.filteredNotes.set(list));
    });

    effect(() => {
      this.notes.selected$.subscribe(n => this.selectedNote.set(n));
    });
  }

  // Events bubbled from children
  onCreateNote() {
    this.notes.create();
  }

  onSelectNote(id: string) {
    this.notes.select(id);
  }

  onDeleteNote(id: string) {
    this.notes.remove(id);
  }

  onUpdateNote(note: Note) {
    this.notes.update(note.id, note);
  }

  // PUBLIC_INTERFACE
  /** No-op handler for filter change hook point */
  noop() {}
}
