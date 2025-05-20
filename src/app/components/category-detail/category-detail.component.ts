import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ApiService, Category} from '../../services/api.service';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';

@Component({
  selector: 'app-category-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './category-detail.component.html',
  styleUrl: './category-detail.component.css'
})
export class CategoryDetailComponent {
  category?: Category;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) {
  }

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.loadCategory(id);
  }

  private loadCategory(id: number): void {
    this.apiService.getCategoryById(id).subscribe({
      next: (category) => {
        this.category = category;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load category';
        this.loading = false;
      }
    });
  }

  deleteCategory() {
    if (confirm('Are you sure you want to delete this category?')) {
      this.apiService.deleteCategory(this.category!.id).subscribe({
        next: () => this.router.navigate(['/categories']),
        error: () => this.error = 'Failed to delete category'
      });
    }
  }

  onCancel() {
    this.router.navigate(['/categories']);
  }
}
