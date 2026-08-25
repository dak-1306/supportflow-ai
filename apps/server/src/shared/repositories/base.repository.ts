import { Model } from "mongoose";

export class BaseRepository<T = Record<string, any>> {
  constructor(protected readonly model: Model<any>) {}

  async findById(id: string): Promise<T | null> {
    const doc = await this.model.findById(id).exec();
    return doc ? (doc.toJSON() as unknown as T) : null;
  }

  async findOne(filter: Record<string, any>): Promise<T | null> {
    const doc = await this.model.findOne(filter).exec();
    return doc ? (doc.toJSON() as unknown as T) : null;
  }

  async find(filter: Record<string, any> = {}): Promise<T[]> {
    const docs = await this.model.find(filter).exec();
    return docs.map((doc) => doc.toJSON() as unknown as T);
  }

  async create(item: any): Promise<T> {
    const doc = await this.model.create(item);
    return doc.toJSON() as unknown as T;
  }

  async update(id: string, updateData: Record<string, any>): Promise<T | null> {
    const doc = await this.model
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    return doc ? (doc.toJSON() as unknown as T) : null;
  }

  async delete(id: string): Promise<T | null> {
    const doc = await this.model.findByIdAndDelete(id).exec();
    return doc ? (doc.toJSON() as unknown as T) : null;
  }
}
