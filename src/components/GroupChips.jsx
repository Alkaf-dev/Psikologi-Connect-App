import { FilterChip } from './ui'

export default function GroupChips({ groups = [], selectedGroupId, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
      {groups.map((group) => (
        <FilterChip
          key={group.id}
          active={String(selectedGroupId) === String(group.id)}
          count={group.members_count ?? group.members?.length ?? 0}
          onClick={() => onSelect(group.id)}
          className="group-chip"
        >
          {group.name}
        </FilterChip>
      ))}
    </div>
  )
}
