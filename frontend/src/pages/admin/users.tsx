import { Button } from "@/components/ui/button"
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table"
import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"

export default function Users() {
  return (
    <div className="col-span-full container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        {/* <Button size="sm">Add User</Button> */}
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Tokens</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage alt="User Avatar" src="/placeholder-avatar.jpg" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <span>johndoe</span>
                </div>
              </TableCell>
              <TableCell>johndoe@example.com</TableCell>
              <TableCell>
                <Input className="w-24 text-right" defaultValue={500} type="number" />
              </TableCell>
              <TableCell>
                <Button className="text-red-500" size="icon" variant="ghost">
                  <TrashIcon className="h-5 w-5" />
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage alt="User Avatar" src="/placeholder-avatar.jpg" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <span>janedoe</span>
                </div>
              </TableCell>
              <TableCell>janedoe@example.com</TableCell>
              <TableCell>
                <Input className="w-24 text-right" defaultValue={750} type="number" />
              </TableCell>
              <TableCell>
                <Button className="text-red-500" size="icon" variant="ghost">
                  <TrashIcon className="h-5 w-5" />
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage alt="User Avatar" src="/placeholder-avatar.jpg" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <span>bobsmith</span>
                </div>
              </TableCell>
              <TableCell>bobsmith@example.com</TableCell>
              <TableCell>
                <Input className="w-24 text-right" defaultValue={300} type="number" />
              </TableCell>
              <TableCell>
                <Button className="text-red-500" size="icon" variant="ghost">
                  <TrashIcon className="h-5 w-5" />
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage alt="User Avatar" src="/placeholder-avatar.jpg" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <span>sarahjones</span>
                </div>
              </TableCell>
              <TableCell>sarahjones@example.com</TableCell>
              <TableCell>
                <Input className="w-24 text-right" defaultValue={1000} type="number" />
              </TableCell>
              <TableCell>
                <Button className="text-red-500" size="icon" variant="ghost">
                  <TrashIcon className="h-5 w-5" />
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function TrashIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  )
}