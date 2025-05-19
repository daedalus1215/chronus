import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CheckItem } from "../entities/notes/check-item.entity";
import { Note } from "../entities/notes/note.entity";
import { CreateCheckItemDto } from "src/notes/apps/dtos/requests/create-check-item.dto";
import { AuthUser } from "src/auth/app/decorators/get-auth-user.decorator";

@Injectable()
export class CreateCheckItemTransactionScript {

  //@TODO: Need to migrate these into legit repo
  constructor(
    @InjectRepository(CheckItem)
    private readonly checkItemRepository: Repository<CheckItem>,
    @InjectRepository(Note)
    private readonly noteRepository: Repository<Note>
  ) {}

  async apply(createCheckItemDto: CreateCheckItemDto & { authUser: AuthUser, noteId: number}): Promise<Note> {
    const { name, noteId, authUser } = createCheckItemDto;

    //@TODO: Creating coupling between note validation and check-item TS. This note could come from a NoteAggregator, and this could be orchestrated in a CheckItemService. 
    //@TODO: CheckItem could be it's own subdomain essentially. But, let's spike this in for now.
    const note = await this.noteRepository.findOne({ where: { id: noteId, userId: authUser.userId } });
    if (!note) {
      throw new NotFoundException("Note not found");
    }

    const checkItem = new CheckItem();
    checkItem.name = name;
    checkItem.note = note;
    await this.checkItemRepository.save(checkItem)
    const checkItems = await this.checkItemRepository.findBy({ note: { id: noteId } })  
    return {...note, checkItems: checkItems}
  }
} 