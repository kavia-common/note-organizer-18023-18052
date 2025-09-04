import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Note } from '../../models/note.model';

@Component({
  selector: 'app-note-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './note-editor.component.html',
  styleUrl: './note-editor.component.css'
})
export class NoteEditorComponent {
  @Input() note!: Note;
  @Output() save = new EventEmitter<Note>();
  @Output() delete = new EventEmitter<string>();

  tagInput = '';

  onTitleChange() {
    this.emitSave();
  }
  onContentChange() {
    this.emitSave();
  }

  togglePinned() {
    this.note = { ...this.note, pinned: !this.note.pinned };
    this.emitSave();
  }

  addTag() {
    const parts = this.tagInput.split(',').map(s => s.trim()).filter(Boolean);
    if (!parts.length) return;
    const unique = Array.from(new Set([...(this.note.tags || []), ...parts]));
    this.note = { ...this.note, tags: unique };
    this.tagInput = '';
    this.emitSave();
  }

  removeTag(tag: string) {
    const next = (this.note.tags || []).filter(t => t !== tag);
    this.note = { ...this.note, tags: next };
    this.emitSave();
  }

  emitSave() {
    this.save.emit({ ...this.note });
  }

  deleteNote() {
    this.delete.emit(this.note.id);
  }
}
