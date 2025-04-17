export interface User {
  id: string;
  name: string;
}

export interface Item {
  id: string;
  name: string;
  cost: number;
  quantity: number;
  users: string[]; // Array of user IDs
}

export interface UserTotal {
  items: { name: string; cost: number; quantity: number }[];
  subtotal: number;
  tax: number;
  total: number;
}
