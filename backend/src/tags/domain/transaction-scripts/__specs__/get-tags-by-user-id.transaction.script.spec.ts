import { Test } from "@nestjs/testing";
import {
  GetTagsByUserIdTransactionScript,
  TagWithCount,
} from "../get-tags-by-user-id.transaction.script";
import { TagRepository } from "../../../infra/repositories/tag-repository/tag.repository";
import { TagResponseDto } from "../../../app/dtos/responses/tag.response.dto";
import { createTagRepositoryMock } from "src/tags/test-utils";

describe("GetTagsByUserIdTransactionScript", () => {
  let target: GetTagsByUserIdTransactionScript;
  let mockRepository: jest.Mocked<TagRepository>;

  beforeEach(async () => {
    mockRepository = createTagRepositoryMock();

    const moduleRef = await Test.createTestingModule({
      providers: [
        GetTagsByUserIdTransactionScript,
        { provide: TagRepository, useValue: mockRepository },
      ],
    }).compile();

    target = moduleRef.get(GetTagsByUserIdTransactionScript);
  });

  it("should return TagResponseDto[] for valid userId", async () => {
    // Arrange
    const userId = 1;
    const tags: TagWithCount[] = [
      {
        id: "1",
        name: "Tag1",
        noteCount: 1,
      },
      {
        id: "2",
        name: "Tag2",
        noteCount: 2,
      },
    ];

    mockRepository.getTagsByUserId.mockResolvedValue(tags);
    
    // Act
    const result = await target.apply(userId);

    // Assert
    expect(result).toEqual(tags);
  });
});
