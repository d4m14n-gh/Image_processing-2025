import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';

/** Component to display a "Page Not Found" message. */
@Component({
  selector: 'app-page-not-found',
  imports: [
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    RouterModule
  ],
  templateUrl: './page-not-found.component.html',
  styleUrl: './page-not-found.component.css'
})
export class PageNotFoundComponent {
  constructor(private router: Router) {

  }
  /** Navigates back to the previous page or to the home page if no history exists. */
  goBack(): void {
    if (history.length > 1) {
      history.back();
    } else {
      this.router.navigate(['/']);
    }
  }
}
