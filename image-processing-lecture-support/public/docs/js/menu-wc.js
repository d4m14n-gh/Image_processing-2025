'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">image-processing-lecture-support documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                                <li class="link">
                                    <a href="overview.html" data-type="chapter-link">
                                        <span class="icon ion-ios-keypad"></span>Overview
                                    </a>
                                </li>

                            <li class="link">
                                <a href="index.html" data-type="chapter-link">
                                    <span class="icon ion-ios-paper"></span>
                                        README
                                </a>
                            </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>

                    </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#components-links"' :
                            'data-bs-target="#xs-components-links"' }>
                            <span class="icon ion-md-cog"></span>
                            <span>Components</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="components-links"' : 'id="xs-components-links"' }>
                            <li class="link">
                                <a href="components/AccumulatorDialogComponent.html" data-type="entity-link" >AccumulatorDialogComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AnimationControllerComponent.html" data-type="entity-link" >AnimationControllerComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AppComponent.html" data-type="entity-link" >AppComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/BinaryBitmapEditorComponent.html" data-type="entity-link" >BinaryBitmapEditorComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/BitmapComponent.html" data-type="entity-link" >BitmapComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/BitmapEditorComponent.html" data-type="entity-link" >BitmapEditorComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ConvolutionalFilterAnimationComponent.html" data-type="entity-link" >ConvolutionalFilterAnimationComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/HelpComponent.html" data-type="entity-link" >HelpComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/HistogramComponent.html" data-type="entity-link" >HistogramComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/HomeComponent.html" data-type="entity-link" >HomeComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/HoughTransformAnimationComponent.html" data-type="entity-link" >HoughTransformAnimationComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/KernelDialogComponent.html" data-type="entity-link" >KernelDialogComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MatrixDisplayComponent.html" data-type="entity-link" >MatrixDisplayComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MedianFilterAnimationComponent.html" data-type="entity-link" >MedianFilterAnimationComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MorphologicalOperationsAnimationComponent.html" data-type="entity-link" >MorphologicalOperationsAnimationComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PageNotFoundComponent.html" data-type="entity-link" >PageNotFoundComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ShapeBitmapEditorComponent.html" data-type="entity-link" >ShapeBitmapEditorComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/StructuringElementEditorComponent.html" data-type="entity-link" >StructuringElementEditorComponent</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#classes-links"' :
                            'data-bs-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/Bitmap.html" data-type="entity-link" >Bitmap</a>
                            </li>
                            <li class="link">
                                <a href="classes/BitmapRenderer.html" data-type="entity-link" >BitmapRenderer</a>
                            </li>
                            <li class="link">
                                <a href="classes/DragArea.html" data-type="entity-link" >DragArea</a>
                            </li>
                            <li class="link">
                                <a href="classes/InteractiveBitmap.html" data-type="entity-link" >InteractiveBitmap</a>
                            </li>
                            <li class="link">
                                <a href="classes/Kernel.html" data-type="entity-link" >Kernel</a>
                            </li>
                            <li class="link">
                                <a href="classes/Line.html" data-type="entity-link" >Line</a>
                            </li>
                            <li class="link">
                                <a href="classes/Point.html" data-type="entity-link" >Point</a>
                            </li>
                            <li class="link">
                                <a href="classes/StructuringElement.html" data-type="entity-link" >StructuringElement</a>
                            </li>
                            <li class="link">
                                <a href="classes/UndoRedo.html" data-type="entity-link" >UndoRedo</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/BitmapStorageService.html" data-type="entity-link" >BitmapStorageService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/HistoryService.html" data-type="entity-link" >HistoryService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ThemeService.html" data-type="entity-link" >ThemeService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/enumerations.html" data-type="entity-link">Enums</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <a data-type="chapter-link" href="routes.html"><span class="icon ion-ios-git-branch"></span>Routes</a>
                        </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});