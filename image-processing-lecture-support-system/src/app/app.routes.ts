import { Routes } from '@angular/router';
import { ImageMatrixEditorComponent } from './image-matrix-editor/image-matrix-editor.component';

export const routes: Routes = [
    { path: 'editor', component: ImageMatrixEditorComponent },
    // { path: '**', component: PageNotFoundViewComponent }
];
