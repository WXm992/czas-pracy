import express from 'express';
import cors from 'cors';
import { db } from './db';
import {
  equipment,
  systemUsers,
  equipmentProjectAssignments,
  managerProjectAssignments
} from '../shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Equipment routes
app.get('/api/equipment', async (req, res) => {
  try {
    const equipmentList = await db.select().from(equipment).orderBy(equipment.name);
    res.json(equipmentList);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({ error: 'Failed to fetch equipment' });
  }
});

app.post('/api/equipment', async (req, res) => {
  try {
    const newEquipment = await db.insert(equipment).values(req.body).returning();
    res.status(201).json(newEquipment[0]);
  } catch (error) {
    console.error('Error creating equipment:', error);
    res.status(500).json({ error: 'Failed to create equipment' });
  }
});

app.put('/api/equipment/:id', async (req, res) => {
  try {
    const updatedEquipment = await db
      .update(equipment)
      .set(req.body)
      .where(eq(equipment.id, req.params.id))
      .returning();
    
    if (updatedEquipment.length === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    
    res.json(updatedEquipment[0]);
  } catch (error) {
    console.error('Error updating equipment:', error);
    res.status(500).json({ error: 'Failed to update equipment' });
  }
});

app.delete('/api/equipment/:id', async (req, res) => {
  try {
    const deletedEquipment = await db
      .delete(equipment)
      .where(eq(equipment.id, req.params.id))
      .returning();
    
    if (deletedEquipment.length === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    
    res.json({ message: 'Equipment deleted successfully' });
  } catch (error) {
    console.error('Error deleting equipment:', error);
    res.status(500).json({ error: 'Failed to delete equipment' });
  }
});

// Users routes
app.get('/api/users', async (req, res) => {
  try {
    const usersList = await db.select().from(systemUsers).orderBy(systemUsers.createdAt);
    // Remove password_hash from response
    const sanitizedUsers = usersList.map(user => {
      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    res.json(sanitizedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { password, ...userData } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = await db.insert(systemUsers).values({
      ...userData,
      passwordHash: hashedPassword
    }).returning();
    
    // Remove password_hash from response
    const { passwordHash, ...userWithoutPassword } = newUser[0];
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { password, ...userData } = req.body;
    
    let updateData = userData;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData = { ...userData, passwordHash: hashedPassword };
    }
    
    const updatedUser = await db
      .update(systemUsers)
      .set(updateData)
      .where(eq(systemUsers.id, req.params.id))
      .returning();
    
    if (updatedUser.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Remove password_hash from response
    const { passwordHash, ...userWithoutPassword } = updatedUser[0];
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const deletedUser = await db
      .delete(systemUsers)
      .where(eq(systemUsers.id, req.params.id))
      .returning();
    
    if (deletedUser.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Equipment assignments routes
app.get('/api/equipment-assignments', async (req, res) => {
  try {
    const assignments = await db.select().from(equipmentProjectAssignments);
    res.json(assignments);
  } catch (error) {
    console.error('Error fetching equipment assignments:', error);
    res.status(500).json({ error: 'Failed to fetch equipment assignments' });
  }
});

app.post('/api/equipment-assignments', async (req, res) => {
  try {
    const newAssignment = await db.insert(equipmentProjectAssignments).values(req.body).returning();
    res.status(201).json(newAssignment[0]);
  } catch (error) {
    console.error('Error creating equipment assignment:', error);
    res.status(500).json({ error: 'Failed to create equipment assignment' });
  }
});

// Manager assignments routes
app.get('/api/manager-assignments', async (req, res) => {
  try {
    const assignments = await db.select().from(managerProjectAssignments);
    res.json(assignments);
  } catch (error) {
    console.error('Error fetching manager assignments:', error);
    res.status(500).json({ error: 'Failed to fetch manager assignments' });
  }
});

app.post('/api/manager-assignments', async (req, res) => {
  try {
    const newAssignment = await db.insert(managerProjectAssignments).values(req.body).returning();
    res.status(201).json(newAssignment[0]);
  } catch (error) {
    console.error('Error creating manager assignment:', error);
    res.status(500).json({ error: 'Failed to create manager assignment' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});