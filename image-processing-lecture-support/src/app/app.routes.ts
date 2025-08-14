import { Routes } from '@angular/router';
import { BitmapEditorComponent } from './bitmap-editor/bitmap-editor.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
    { path: 'editor', component: BitmapEditorComponent },
    { path: 'home', component: HomeComponent },
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: '**', component: PageNotFoundComponent }
];
