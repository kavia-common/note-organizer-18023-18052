import { Routes } from '@angular/router';
import { NotesLayoutComponent } from './components/notes-layout/notes-layout.component';

export const routes: Routes = [
  { path: '', component: NotesLayoutComponent },
  { path: '**', redirectTo: '' }
];
