import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {ApiService} from '../../services/api.service';
import {Router} from '@angular/router';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-category-create',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './category-create.component.html',
  styleUrls: ['./category-create.component.css']
})
export class CategoryCreateComponent {
  name = '';
  description = '';
  error = '';

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  onSubmit() {
    if(!this.name) {
      this.error = 'Name is required';
      return;
    }
    this.apiService.createCategory(this.name, this.description)
      .subscribe({
        next: () => {
          this.router.navigate(['/categories']);
        },
        error: (err) => {
          this.error = 'Failed to create category';
        }
      })
  }
}
