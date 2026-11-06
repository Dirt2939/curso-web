type User = {
  uuid: string,
  name: string;
  email: string;
  phone: string;
  role: 'CUSTOMER' | 'ADMIN' | 'MANAGER'; 
  isActive: boolean; 
  createdAt: string;
  updatedAt: string;
}

export { type User as default };