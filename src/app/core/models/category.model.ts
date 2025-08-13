export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  parentId?: number | null;
}

export interface CreateCategoryRequest {
  name: string;
  icon: string;
  color: string;
  parentId?: number | null;
}

export interface UpdateCategoryRequest {
  name: string;
  icon: string;
  color: string;
  parentId?: number | null;
}
