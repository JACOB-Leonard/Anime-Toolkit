import { Component, computed, input, signal } from '@angular/core';
import { AnimeStaff } from '../../../../core/services/staff.service';
import { CommonStaff } from '../../../../core/models/commonStaff.model';

@Component({
  selector: 'app-staff-comparison',
  imports: [],
  templateUrl: './staff-comparison.html',
  styleUrl: './staff-comparison.scss'
})
export class StaffComparison {
  
  readonly leftStaff = input.required<AnimeStaff[]>();
  readonly rightStaff = input.required<AnimeStaff[]>();

  readonly collapsed = signal(false);

  toggleCollapsed(): void {
    this.collapsed.update(value => !value);
  }

  readonly commonStaff = computed<CommonStaff[]>(() => {
    const left = this.leftStaff();
    const right = this.rightStaff();

    const leftMap = new Map<number, string[]>();
    const rightMap = new Map<number, string[]>();
    const staffMap = new Map<number, AnimeStaff['person']>();

    for (const staff of left) {
        const positions = leftMap.get(staff.person.mal_id) ?? [];

        for (const position of staff.positions) {
          positions.push(position);
        }

        leftMap.set(staff.person.mal_id, positions);
        staffMap.set(staff.person.mal_id, staff.person);
    }

    for (const staff of right) {
        const positions = rightMap.get(staff.person.mal_id) ?? [];

        for (const position of staff.positions) {
          positions.push(position);
        }

        rightMap.set(staff.person.mal_id, positions);
    }

    return [...leftMap.entries()]
      .filter(([staffId]) => rightMap.has(staffId))
      .map(([staffId, leftPositions]) => {
        const rightPositions = rightMap.get(staffId)!;
        const person = staffMap.get(staffId)!;
        return {
          staff: person,
          leftPosition: leftPositions,
          rightPosition: rightPositions
        };
      })
  });
}
