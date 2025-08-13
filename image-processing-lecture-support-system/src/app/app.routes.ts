import { Routes } from '@angular/router';
import { BitmapEditorComponent } from './bitmap-editor/bitmap-editor.component';

export const routes: Routes = [
    { path: 'editor', component: BitmapEditorComponent },
    // { path: '**', component: PageNotFoundViewComponent }
];
