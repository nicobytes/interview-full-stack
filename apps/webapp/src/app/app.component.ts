import { Component, inject, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class AppComponent implements OnInit {
  matIconReg = inject(MatIconRegistry);

  ngOnInit() {
    this.matIconReg.setDefaultFontSetClass('material-symbols-outlined');
  }
}
