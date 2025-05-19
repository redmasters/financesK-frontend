import {Routes, RouterModule} from '@angular/router';
import {CategoryListComponent} from './components/category-list/category-list.component';
import {CategoryCreateComponent} from './components/category-create/category-create.component';
import {SpendListComponent} from './components/spend-list/spend-list.component';
import {SpendCreateComponent} from './components/spend-create/spend-create.component';

export const routes: Routes = [
  {path: 'categories', component: CategoryListComponent},
  {path: 'categories/create', component: CategoryCreateComponent},
  {path: 'spends', component: SpendListComponent},
  {path: 'spends/create', component: SpendCreateComponent},
  {path: '', redirectTo: '/categories', pathMatch: 'full'},
];


