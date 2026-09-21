import { AnimeStaff } from "../services/staff.service";

export interface CommonStaff {
  staff: AnimeStaff['person'];
  leftPosition: string[];
  rightPosition: string[];
}