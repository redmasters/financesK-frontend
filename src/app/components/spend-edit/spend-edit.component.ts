import {Component, OnInit} from '@angular/core';
import {ApiService, Category, Spend, SpendStatus} from '../../services/api.service';
import {ActivatedRoute, Router} from '@angular/router';
import {forkJoin} from 'rxjs';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-spend-edit',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './spend-edit.component.html',
  styleUrl: './spend-edit.component.css'
})
export class SpendEditComponent implements OnInit {
  spend: Spend = {} as Spend;
  categories: Category[] = [];
  statuses: SpendStatus[] = [];
  loading = true;
  error = '';

  constructor(
    private apiService: ApiService,
    private route: Router,
    private routes: ActivatedRoute
  ) {}

  ngOnInit() {
    const id = this.routes.snapshot.params['id'];

    forkJoin([
      this.apiService.getSpendById(id),
      this.apiService.getCategories(),
      this.apiService.getAllStatuses()
    ]).subscribe({
      next: ([spend, categories, statuses]) => {
        this.spend = spend;
        this.categories = categories;
        this.statuses = statuses;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load spend';
        this.loading = false;
      }
    })
  }

  onSubmit() {
    if(!this.validadeForm()) return;

    this.apiService.updateSpend(this.spend.id!, this.spend).subscribe({
      next: () => this.route.navigate(['/spends', this.spend.id]),
      error: () => this.error = 'Failed to update spend'
    })
  }

  validadeForm() {
    if (!this.spend.name) {
      this.error = 'Name is required';
      return false;
    }
    if (!this.spend.categoryId) {
      this.error = 'Category is required';
      return false;
    }

    return true;
  }

}
