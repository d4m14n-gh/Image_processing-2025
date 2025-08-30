import { Routes } from '@angular/router';
import { BitmapEditorComponent } from './components/bitmap-editor/bitmap-editor.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { HomeComponent } from './components/home/home.component';
import { HistogramComponent } from './components/histogram/histogram.component';
import { ConvolutionalFilterAnimationComponent } from './components/convolutional-filter-animation/convolutional-filter-animation.component';
import { HelpComponent } from './components/help/help.component';

export const routes: Routes = [
    { path: 'editor', component: BitmapEditorComponent },
    { path: 'edit/:id', component: BitmapEditorComponent },
    { path: 'help', component: HelpComponent },
    { path: 'home', component: HomeComponent },
    { path: 'histogram', component: HistogramComponent },
    { path: 'convolutional-filter', component: ConvolutionalFilterAnimationComponent },
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: '**', component: PageNotFoundComponent }
];
