import { User } from "../../../models/User";
import { BaseRepository } from "./base.repository";

export class UserRepository extends BaseRepository<any> {
  constructor() {
    super(User);
  }

  async findByEmail(email: string) {
    return this.model.findOne({ email }).exec();
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.model.findByIdAndUpdate(userId, { lastLogin: new Date() });
  }
}
