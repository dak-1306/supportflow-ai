import { Model, Document } from "mongoose";

export class BaseRepository<T extends Document> {
  constructor(protected readonly model: Model<T>) {}

  async findById(id: string): Promise<Record<string, any> | null> {
    const doc = await this.model.findById(id).exec();
    return doc ? doc.toJSON() : null;
  }

  async findOne(
    filter: Record<string, any>,
  ): Promise<Record<string, any> | null> {
    const doc = await this.model.findOne(filter).exec();
    return doc ? doc.toJSON() : null;
  }

  async find(filter: Record<string, any> = {}): Promise<Record<string, any>[]> {
    const docs = await this.model.find(filter).exec();
    return docs.map((doc) => doc.toJSON());
  }

  async create(item: any): Promise<Record<string, any>> {
    const doc = await this.model.create(item);
    return doc.toJSON();
  }

  async update(
    id: string,
    updateData: Record<string, any>,
  ): Promise<Record<string, any> | null> {
    const doc = await this.model
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    return doc ? doc.toJSON() : null;
  }

  async delete(id: string): Promise<Record<string, any> | null> {
    const doc = await this.model.findByIdAndDelete(id).exec();
    return doc ? doc.toJSON() : null;
  }
}
