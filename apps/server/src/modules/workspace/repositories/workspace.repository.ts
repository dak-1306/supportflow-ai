import { Workspace } from "../models/Workspace";
import { BaseRepository } from "../../../shared/repositories/base.repository";

export class WorkspaceRepository extends BaseRepository<any> {
  constructor() {
    super(Workspace);
  }
}
