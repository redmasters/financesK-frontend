import { Component, OnInit } from '@angular/core';
import { ApiService} from '../../services/api.service';
import { Category } from '../../services/api.service';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-category-list',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.css'
})
export class CategoryListComponent {
  categories: Category[] = [];
  loading = true;
  error = '';
  searchTerm = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load categories';
        this.loading = false;
      }
    });
  }
  searchCategories() {
    if (this.searchTerm.trim()) {
      this.loading = true;
      this.apiService.getCategoryByName(this.searchTerm).subscribe({
        next: (data) => {
          this.categories = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load categories';
          this.loading = false;
        }
      });

    }
  }

  clearSearch() {
    this.searchTerm = '';
  }
}
