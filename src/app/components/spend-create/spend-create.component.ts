import {Component, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {ApiService} from '../../services/api.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-spend-create',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './spend-create.component.html',
  styleUrl: './spend-create.component.css'
})
export class SpendCreateComponent implements OnInit {
  categories: any[] = [];
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
    this.apiService.getCategories().subscribe({
      next: (categories) => this.categories = categories,
      error: (err) =>
        this.error = 'Failed to load categories'
    });
  }

  onSubmit(): void {
    if(!this.validateForm()) return;
    this.apiService.createSpend(this.formData)
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

}
