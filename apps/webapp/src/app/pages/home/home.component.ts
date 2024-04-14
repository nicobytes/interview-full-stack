import { Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatIconModule,
    RouterLink,
    MatButtonModule,
    NgOptimizedImage
  ],
  templateUrl: './home.component.html',
  styles: ``
})
export default class HomeComponent {

}
