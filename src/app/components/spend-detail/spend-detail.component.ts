import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {ApiService, Category, Spend} from '../../services/api.service';
import {CategoryNamePipe} from '../../pipes/category-name.pipe';
import {forkJoin} from 'rxjs';

@Component({
  selector: 'app-spend-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, CategoryNamePipe],
  templateUrl: './spend-detail.component.html',
  styleUrl: './spend-detail.component.css'
})
export class SpendDetailComponent implements OnInit {
  spend?: Spend;
  loading = true;
  error = '';
  categories: Category[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) {
  }

  ngOnInit(): void {
        const id = this.route.snapshot.params['id'];
        this.loadSpend(id);
    }

  private loadSpend(id: number): void {
    forkJoin([
      this.apiService.getSpendById(id),
      this.apiService.getCategories()
    ]).subscribe({
      next: ([spend, categories]) => {
        this.spend = spend;
        this.categories = categories;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load spend';
        this.loading = false;
      }
    })

  }

  deleteSpend() {
    if (confirm('Are you sure you want to delete this spend?')) {
      this.apiService.deleteSpend(this.spend!.id).subscribe({
        next: () => this.router.navigate(['/spends']),
        error: () => this.error = 'Failed to delete spend'
      });
    }
  }

  statusClass(statusName?: string): string {
    if(!statusName) return 'bg-secondary';
    return {
      'PENDING': 'bg-warning',
      'PAID': 'bg-success',
      'OVERDUE': 'bg-danger'
    }[statusName] || 'bg-secondary';
  }

  onCancel() {
    this.router.navigate(['/spends']);
  }
}
