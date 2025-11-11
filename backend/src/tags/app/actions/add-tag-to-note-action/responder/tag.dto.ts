import { ApiProperty } from "@nestjs/swagger";
import { Tag } from "src/tags/domain/entities/tag.entity";

export class TagDto {
  @ApiProperty()
  id: Tag["id"];

  @ApiProperty()
  name: Tag["name"];
  
  @ApiProperty()
  description: Tag["description"];

  constructor(tag: Tag) {
    this.id = tag.id;
    this.name = tag.name;
    this.description = tag.description;
  }
}
