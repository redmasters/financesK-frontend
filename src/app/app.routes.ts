import {Routes, RouterModule} from '@angular/router';
import {CategoryListComponent} from './components/category-list/category-list.component';
import {CategoryCreateComponent} from './components/category-create/category-create.component';
import {SpendListComponent} from './components/spend-list/spend-list.component';
import {SpendCreateComponent} from './components/spend-create/spend-create.component';
import {CategoryDetailComponent} from './components/category-detail/category-detail.component';
import {CategoryEditComponent} from './components/category-edit/category-edit.component';
import {SpendEditComponent} from './components/spend-edit/spend-edit.component';
import {SpendDetailComponent} from './components/spend-detail/spend-detail.component';

export const routes: Routes = [
  {path: 'categories', component: CategoryListComponent},
  {path: 'categories/create', component: CategoryCreateComponent},
  {path: 'spends', component: SpendListComponent},
  {path: 'spends/create', component: SpendCreateComponent},
  {path: 'categories/:id', component: CategoryDetailComponent},
  {path: 'categories/:id/edit', component: CategoryEditComponent},
  {path: 'spends/:id', component: SpendDetailComponent},
  {path: 'spends/:id/edit', component: SpendEditComponent},


  {path: '', redirectTo: '/spends', pathMatch: 'full'},
];


