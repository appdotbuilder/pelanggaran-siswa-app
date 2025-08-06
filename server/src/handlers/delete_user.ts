
import { db } from '../db';
import { usersTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export const deleteUser = async (id: number): Promise<void> => {
  try {
    await db.delete(usersTable)
      .where(eq(usersTable.id, id))
      .execute();
  } catch (error) {
    console.error('User deletion failed:', error);
    throw error;
  }
};
