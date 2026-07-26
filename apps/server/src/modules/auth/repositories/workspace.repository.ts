import { Workspace } from "../models/Workspace";
import { BaseRepository } from "./base.repository";

export class WorkspaceRepository extends BaseRepository<any> {
  constructor() {
    super(Workspace);
  }
}
