export interface User {
  id: number;
  username: string;
  email: string;
  token: string;
  avatar?: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  avatar?: File | string;
}

export interface CreateUserResponse {
  id: number;
  username: string;
  email: string;
  token: string;
  avatar?: string;
}
