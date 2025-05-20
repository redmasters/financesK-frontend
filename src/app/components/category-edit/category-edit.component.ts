import {Component, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {ApiService} from '../../services/api.service';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-category-edit',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './category-edit.component.html',
  styleUrl: './category-edit.component.css'
})
export class CategoryEditComponent implements OnInit {
  category = {
    id: 0,
    name: '',
    description: ''
  };
  error = '';

  constructor(
    private routes: ActivatedRoute,
    private route: Router,
    private apiService: ApiService,
  ) {
  }

  ngOnInit(): void {
    const id = this.routes.snapshot.params['id'];
    this.apiService.getCategoryById(id).subscribe({
      next: (data) => this.category = data,
      error: () => {
        this.error = 'Failed to load category';
      }
    })
  }

  onSubmit() {
    if (!this.category.name) {
      this.error = 'Name is required';
      return;
    }

    this.apiService.updateCategory(this.category.id, this.category)
      .subscribe({
        next: () => this.route.navigate(['/categories', this.category.id]),
        error: () => this.error = 'Failed to update category'
      })
  }

  onCancel() {
    this.route.navigate(['/categories']);
  }
}
