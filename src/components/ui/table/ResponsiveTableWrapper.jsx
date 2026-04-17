import { useResponsiveView } from "../../../hooks/useResponsiveView";
import SearchBar from "./SearchBar";
import CardList from "./CardList";
import DesktopTable from "./DesktopTable";
import ListHeader from "./ListHeader";
import Pagination from "./Pagination";
import { tokens } from "./tokens";

/**
 * ResponsiveTableWrapper — the single entry-point that wires everything together.
 *
 * On mobile  → SearchBar + CardList (cards)
 * On desktop → SearchBar + DesktopTable (table)
 *
 * Props:
 *   title: string
 *   addLabel: string
 *   onAdd: () => void
 *   countLabel: string
 *
 *   searchValue: string
 *   onSearchChange: (val) => void
 *   searchPlaceholder: string
 *
 *   rows: any[]            — already paginated slice
 *   allRows: any[]         — full filtered list (for count)
 *   keyField: string
 *
 *   columns: DesktopTable columns[]
 *   renderCard: (row, i) => ReactNode
 *   emptyMessage: string
 *
 *   currentPage: number
 *   totalPages: number
 *   onPageChange: (p) => void
 *
 *   highlightRow: (row) => bool
 */
export default function ResponsiveTableWrapper({
  title,
  addLabel,
  onAdd,
  countLabel = "registros",

  searchValue,
  onSearchChange,
  searchPlaceholder,

  rows = [],
  allRows = [],
  keyField = "id",

  columns = [],
  renderCard,
  emptyMessage,

  currentPage,
  totalPages,
  onPageChange,

  highlightRow,
}) {
  const { isMobile } = useResponsiveView();

  return (
    <div style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
      <ListHeader
        title={title}
        count={allRows.length}
        countLabel={countLabel}
        onAdd={onAdd}
        addLabel={addLabel}
      />

      {onSearchChange && (
        <SearchBar
          value={searchValue}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
        />
      )}

      {isMobile ? (
        <>
          <CardList
            items={rows}
            renderItem={renderCard}
            emptyMessage={emptyMessage}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={allRows.length}
            onChange={onPageChange}
          />
        </>
      ) : (
        <DesktopTable
          columns={columns}
          rows={rows}
          keyField={keyField}
          emptyMessage={emptyMessage}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={allRows.length}
          onPageChange={onPageChange}
          highlightRow={highlightRow}
        />
      )}
    </div>
  );
}
