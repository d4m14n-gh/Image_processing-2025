import { Routes } from '@angular/router';
import { BitmapEditorComponent } from './components/bitmap-editor/bitmap-editor.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { HomeComponent } from './components/home/home.component';
import { HistogramComponent } from './components/histogram/histogram.component';
import { ConvolutionalFilterAnimationComponent } from './components/convolutional-filter-animation/convolutional-filter-animation.component';
import { HelpComponent } from './components/help/help.component';
import { BinaryBitmapEditorComponent } from './components/binary-bitmap-editor/binary-bitmap-editor.component';
import { StructuringElementEditorComponent } from './components/structuring-element-editor/structuring-element-editor.component';
import { MorphologicalOperationsAnimationComponent } from './components/morphological-operations-animation/morphological-operations-animation.component';
import { MedianFilterAnimationComponent } from './components/median-filter-animation/median-filter-animation.component';
import { HoughTransformAnimationComponent } from './components/hough-transform-animation/hough-transform-animation.component';
import { ShapeBitmapEditorComponent } from './components/shape-bitmap-editor/shape-bitmap-editor.component';

export const routes: Routes = [
    { path: 'editor', component: BitmapEditorComponent },
    { path: 'edit/:id', component: BitmapEditorComponent },
    
    { path: 'binary-editor', component: BinaryBitmapEditorComponent },
    { path: 'binary-edit/:id', component: BinaryBitmapEditorComponent },
    
    { path: 'shape-editor', component: ShapeBitmapEditorComponent },

    { path: 'structuring-element', component: StructuringElementEditorComponent },
    

    { path: 'help', component: HelpComponent },
    { path: 'home', component: HomeComponent },
    
    { path: 'histogram', component: HistogramComponent },
    { path: 'convolutional-filters', component: ConvolutionalFilterAnimationComponent },
    { path: 'median-filters', component: MedianFilterAnimationComponent },
    { path: 'morphological-operations', component: MorphologicalOperationsAnimationComponent },
    { path: 'hough-transform', component: HoughTransformAnimationComponent },

    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: '**', component: PageNotFoundComponent }
];
