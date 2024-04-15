import { Component, inject, signal } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '@services/api.service';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [ ReactiveFormsModule, RouterModule ],
  templateUrl: './create.component.html',
})
export default  class CreateComponent {

  formBuilder = inject(FormBuilder);
  apiService = inject(ApiService);
  router = inject(Router);
  status = signal<'init' | 'loading' | 'success'>('init');

  form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required]],
    role: ['', [Validators.required]],
  });

  onSubmit() {
    if (this.form.valid) {
      const data = this.form.getRawValue();
      this.createSession(data);
    } else {
      this.form.markAllAsTouched();
    }
  }

  createSession(data: { role: string, name: string }) {
    this.status.set('loading');
    this.apiService.createSimulation(data).subscribe((response) => {
      this.router.navigate([`/simulator/${response.id}`]);
      this.status.set('success');
    });
  }

}
