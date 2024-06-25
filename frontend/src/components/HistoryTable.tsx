import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export function HistoryTable(props: any) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ key: "model", order: "asc" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const history = useMemo(() => props.initialData, [props.initialData]);

  const filteredHistory = useMemo(() => {
    return history?.filter(
      (item) =>
        item.model.toLowerCase().includes(search.toLowerCase()) ||
        item.type.toLowerCase().includes(search.toLowerCase()) ||
        item.prompt.toLowerCase().includes(search.toLowerCase()) ||
        (item.result.sentiment?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
        (String((item.result.score * 100).toFixed(2)).concat('%').includes(search.toLowerCase()) ?? false) ||
        (item.result.processed_text?.toLowerCase().includes(search.toLowerCase()) ?? false)
    );
  }, [history, search]);

  const sortedHistory = useMemo(() => {
    return filteredHistory?.sort((a, b) => {
      const aValue = a[sort.key]?.toLowerCase?.() ?? '';
      const bValue = b[sort.key]?.toLowerCase?.() ?? '';
      if (aValue < bValue) return sort.order === "asc" ? -1 : 1;
      if (aValue > bValue) return sort.order === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredHistory, sort]);

  const paginatedHistory = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedHistory?.slice(startIndex, endIndex);
  }, [sortedHistory, page, pageSize]);

  const handleSort = (key: string) => {
    if (sort.key === key) {
      setSort({ key, order: sort.order === "asc" ? "desc" : "asc" });
    } else {
      setSort({ key, order: "asc" });
    }
    setPage(1); // Reset to first page on sort change
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  const totalPages = Math.ceil(filteredHistory.length / pageSize);

  return (
    <div className="col-span-full gap-4 container mx-auto p-4">
      <div className="flex items-center justify-between mb-2">
        <Input
          placeholder="Search history..."
          className="bg-white dark:bg-gray-950 me-2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex items-center gap-2">
          <Label htmlFor="page-size">Show</Label>
          <Select
            id="page-size"
            defaultValue={pageSize.toString()}
            onValueChange={(value) => handlePageSizeChange(Number(value))}
            className="w-24"
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <Label htmlFor="page-size">entries</Label>
        </div>
      </div>
      <div className="overflow-auto border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => handleSort("model")}>
                Model
                {sort.key === "model" && (
                  <span className="ml-1">{sort.order === "asc" ? "\u2191" : "\u2193"}</span>
                )}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("type")}>
                Type of Analysis
                {sort.key === "type" && (
                  <span className="ml-1">{sort.order === "asc" ? "\u2191" : "\u2193"}</span>
                )}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("prompt")}>
                Prompt
                {sort.key === "prompt" && (
                  <span className="ml-1">{sort.order === "asc" ? "\u2191" : "\u2193"}</span>
                )}
              </TableHead>
              <TableHead className="cursor-pointer">
                Result
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedHistory?.map((item: any, index: any) => (
              <TableRow key={index}>
                <TableCell>{item.model}</TableCell>
                <TableCell>{item.type}</TableCell>
                <TableCell>{item.prompt}</TableCell>
                <TableCell>
                  {item.type == "ner" ?
                    <div className="line-clamp-3">{item.result['processed_text']}</div>
                    :
                    <div className="line-clamp-3">{item.result.sentiment} {(item.result.score * 100).toFixed(2)}%</div>
                  }
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between mt-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  if(page === 1) return;
                  e.preventDefault();
                  handlePageChange(page - 1);
                }}
                className={page === 1 ? "opacity-50 cursor-not-allowed" : ""}
                aria-disabled={page === 1}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(index + 1);
                  }}
                  isActive={page === index + 1}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            {totalPages > 5 && page < totalPages - 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  if(page === totalPages) return;
                  e.preventDefault();
                  handlePageChange(page + 1);
                }}
                className={page === totalPages ? "opacity-50 cursor-not-allowed" : ""}
                aria-disabled={page === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
