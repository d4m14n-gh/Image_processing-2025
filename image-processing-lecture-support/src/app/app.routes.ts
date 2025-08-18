import { Routes } from '@angular/router';
import { BitmapEditorComponent } from './components/bitmap-editor/bitmap-editor.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { HomeComponent } from './components/home/home.component';
import { HistogramComponent } from './components/histogram/histogram.component';

export const routes: Routes = [
    { path: 'editor', component: BitmapEditorComponent },
    { path: 'edit/:id', component: BitmapEditorComponent },
    { path: 'home', component: HomeComponent },
    { path: 'histogram', component: HistogramComponent },
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: '**', component: PageNotFoundComponent }
];
