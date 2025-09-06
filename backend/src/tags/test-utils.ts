import { createMock } from "src/shared-kernel/test-utils";
import { TagRepository } from "./infra/repositories/tag-repository/tag.repository";

export const createTagRepositoryMock = () =>
  createMock<TagRepository>({
    getTagsByUserId: jest.fn(),
    findTagByName: jest.fn(),
    findTagByIdAndUserId: jest.fn(),
    createTag: jest.fn(),
    removeTag: jest.fn(),
    addTagToNote: jest.fn(),
    findTagsByNoteId: jest.fn(),
  });