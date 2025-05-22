import {Component, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {ApiService, Category, SpendStatus} from '../../services/api.service';
import {Router} from '@angular/router';
import {forkJoin} from 'rxjs';

@Component({
  selector: 'app-spend-create',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './spend-create.component.html',
  styleUrl: './spend-create.component.css'
})
export class SpendCreateComponent implements OnInit {
  categories: Category[] = [];
  statuses: SpendStatus[] = [];
  formData = {
    name: '',
    description: '',
    amount: 0,
    dueDate: '',
    categoryId: 0,
    isDue: false,
    isPaid: false,
    isRecurring: false
  };
  error = '';

  constructor(
    private apiService: ApiService,
    private router: Router,) {
  }

  ngOnInit(): void {
    forkJoin([
      this.apiService.getCategories(),
      this.apiService.getAllStatuses()
    ]).subscribe({
      next: ([categories, statuses]) => {
        this.categories = categories;
        this.statuses = statuses;
      },
      error: () => {
        this.error = 'Failed to load categories or statuses';
      }
    })
  }

  onSubmit(): void {

    const spendPayLoad = {
      ...this.formData
    }

    if (!this.validateForm()) return;
    this.apiService.createSpend(spendPayLoad)
      .subscribe({
        next: () => {
          this.router.navigate(['/spends']);
        },
        error: (err) => {
          this.error = 'Failed to create spend';
        }
      });
  }

  private validateForm(): boolean {
    if (!this.formData.name) {
      this.error = 'Name is required';
      return false;
    }
    if (this.formData.amount <= 0) {
      this.error = 'Amount must be greater than 0';
      return false;
    }
    if (!this.formData.dueDate) {
      this.error = 'Due date is required';
      return false;
    }
    if (!this.formData.categoryId) {
      this.error = 'Category is required';
      return false;
    }
    return true;
  }

  onCancel() {
    this.router.navigate(['/spends']);
  }
}
