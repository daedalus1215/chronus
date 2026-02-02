import { IsIn, IsString } from 'class-validator';

export const CHECK_ITEM_STATUS_VALUES = [
  'ready',
  'in_progress',
  'review',
  'done',
] as const;

export type CheckItemStatus = (typeof CHECK_ITEM_STATUS_VALUES)[number];

export class UpdateCheckItemStatusDto {
  @IsString()
  @IsIn(CHECK_ITEM_STATUS_VALUES)
  status: CheckItemStatus;
}
