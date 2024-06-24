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
import { Pagination } from "@/components/ui/pagination";

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
        item.result.sentiment.toLowerCase().includes(search.toLowerCase())
    );
  }, [history, search]);

  const sortedHistory = useMemo(() => {
    return filteredHistory?.sort((a, b) => {
      if (a[sort.key] < b[sort.key]) return sort.order === "asc" ? -1 : 1;
      if (a[sort.key] > b[sort.key]) return sort.order === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredHistory, sort]);

  const paginatedHistory = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedHistory?.slice(startIndex, endIndex);
  }, [sortedHistory, page, pageSize]);

  console.log(paginatedHistory)
  const handleSort = (key: string) => {
    if (sort.key === key) {
      setSort({ key, order: sort.order === "asc" ? "desc" : "asc" });
    } else {
      setSort({ key, order: "asc" });
    }
  };

  const handlePageChange = (page: number) => {
    setPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

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
            onValueChange={handlePageSizeChange}
            className="w-24"
            value={10}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={10}>10</SelectItem>
              <SelectItem value={20}>20</SelectItem>
              <SelectItem value={50}>50</SelectItem>
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
              <TableHead className="cursor-pointer" onClick={() => handleSort("result")}>
                Result
                {sort.key === "result" && (
                  <span className="ml-1">{sort.order === "asc" ? "\u2191" : "\u2193"}</span>
                )}
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
      <div className="flex items-center justify-between">
        {/* <Pagination
          currentPage={page}
          pageSize={pageSize}
          totalItems={filteredHistory?.length}
          onPageChange={handlePageChange}
        /> */}
      </div>
    </div>
  );
}
