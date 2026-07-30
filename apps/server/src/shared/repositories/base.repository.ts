import { Model, Document } from "mongoose";

export class BaseRepository<T extends Document> {
  constructor(protected readonly model: Model<T>) {}

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  async findOne(filter: Record<string, any>): Promise<T | null> {
    return this.model.findOne(filter).exec();
  }

  async find(filter: Record<string, any> = {}): Promise<T[]> {
    return this.model.find(filter).exec();
  }

  async create(item: any): Promise<T> {
    return this.model.create(item);
  }

  async update(id: string, updateData: Record<string, any>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async delete(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id).exec();
  }
}
