// API utility functions to replace Supabase client calls

const API_BASE_URL = '/api';

export interface Equipment {
  id: string;
  name: string;
  category: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  condition: string;
  notes?: string;
  purchaseDate?: string;
  inspectionFrom?: string;
  inspectionTo?: string;
  insuranceCompany?: string;
  insurancePolicyNumber?: string;
  insuranceOc?: boolean;
  insuranceAc?: boolean;
  insuranceAssistance?: boolean;
  insuranceFrom?: string;
  insuranceTo?: string;
  leaseCompany?: string;
  leaseFrom?: string;
  leaseTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SystemUser {
  id: string;
  username: string;
  role: string;
  permissions: any;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface EquipmentAssignment {
  id: string;
  equipmentId: string;
  projectId: string;
  assignedDate: string;
  returnedDate?: string;
  isActive: boolean;
  notes?: string;
}

export interface ManagerAssignment {
  id: string;
  managerId: string;
  projectId: string;
  assignedDate: string;
  isActive: boolean;
}

// Generic API function
async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Equipment API functions
export const equipmentApi = {
  async getAll(): Promise<Equipment[]> {
    return apiCall<Equipment[]>('/equipment');
  },

  async create(data: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Equipment> {
    return apiCall<Equipment>('/equipment', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: Partial<Equipment>): Promise<Equipment> {
    return apiCall<Equipment>(`/equipment/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<{ message: string }> {
    return apiCall<{ message: string }>(`/equipment/${id}`, {
      method: 'DELETE',
    });
  },
};

// System Users API functions
export const usersApi = {
  async getAll(): Promise<SystemUser[]> {
    return apiCall<SystemUser[]>('/users');
  },

  async create(data: { username: string; password: string; role: string; permissions: any; isActive: boolean }): Promise<SystemUser> {
    return apiCall<SystemUser>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: { username?: string; password?: string; role?: string; permissions?: any; isActive?: boolean }): Promise<SystemUser> {
    return apiCall<SystemUser>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<{ message: string }> {
    return apiCall<{ message: string }>(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};

// Equipment Assignments API functions
export const equipmentAssignmentsApi = {
  async getAll(): Promise<EquipmentAssignment[]> {
    return apiCall<EquipmentAssignment[]>('/equipment-assignments');
  },

  async create(data: Omit<EquipmentAssignment, 'id'>): Promise<EquipmentAssignment> {
    return apiCall<EquipmentAssignment>('/equipment-assignments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Manager Assignments API functions
export const managerAssignmentsApi = {
  async getAll(): Promise<ManagerAssignment[]> {
    return apiCall<ManagerAssignment[]>('/manager-assignments');
  },

  async create(data: Omit<ManagerAssignment, 'id'>): Promise<ManagerAssignment> {
    return apiCall<ManagerAssignment>('/manager-assignments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};