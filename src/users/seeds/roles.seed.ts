import { UserRole } from '../schemas/user.schema';

export const seedRoles = async (RoleModel) => {
  const roles = Object.values(UserRole);

  for (const role of roles) {
    await RoleModel.updateOne(
      { name: role },
      { $setOnInsert: { name: role } },
      { upsert: true },
    );
  }
};