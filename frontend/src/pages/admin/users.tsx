import { Button } from "@/components/ui/button"
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table"
import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { GetServerSideProps } from "next/types"
import nookies from "nookies"
import { toast } from "sonner"
import { useState } from "react"

export default function Users(props: any) {
    const [users, setUsers] = useState(props.data?.users || [])

    const onDelete = async (id: string) => {
        try {
            const response = await fetch(process.env.NEXT_PUBLIC_API + "/users/" + id, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });

            if (response.ok) {
                const data = await response.json();
                toast.success(data.message);
                setTimeout(() => {
                    getUsers();
                }, 1000);
            }
        }
        catch (error) {
            console.error(error);
            toast.error("Failed to delete user");
        }
    }

    const getUsers = async () => {
        try {
            const response = await fetch(process.env.NEXT_PUBLIC_API + "/users", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });

            if (response.ok) {
                const data = await response.json();
                setUsers(data.users)
                toast.success("Users fetched successfully");
            }
        }
        catch (error) {
            console.error(error);
            toast.error("Failed to fetch users");
        }
    }

    const updateUserToken = async (userId: string, amount: number) => {
        try {
            console.log(userId, amount)
            console.log(typeof userId, typeof amount)
            const response = await fetch(process.env.NEXT_PUBLIC_API + "/users/token", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ user_id: userId, amount: amount}),
            });

            if (response.ok) {
                const data = await response.json();
                toast.success(data.message);
                setTimeout(() => {
                    getUsers();
                }, 1000)
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to update user token");
        }
    };

    const handleTokenKeyDown = (e: any, userId: string) => {
        if (e.key === 'Enter') {
            const tokenAmount = parseInt(e.target.value);
            updateUserToken(userId, tokenAmount);
        }
    };

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
                            <TableHead>Avatar</TableHead>
                            <TableHead>Username/Email</TableHead>
                            <TableHead>Tokens amount</TableHead>
                            <TableHead>Tokens reserve</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Update</TableHead>
                            <TableHead>Deleted</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            users.map((user: any) => {
                                return (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Avatar>
                                                    <AvatarImage alt="User Avatar" src="/placeholder-avatar.jpg" />
                                                    <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <span>{user.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{user.username}</TableCell>
                                        <TableCell>
                                            <Input
                                                className="w-24 text-right"
                                                defaultValue={user.token?.amount || 100}
                                                type="number"
                                                onKeyDown={(e) => handleTokenKeyDown(e, user.id)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <span>{user.token?.reserve || 100}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span>{new Date(user.created_at).toLocaleString()}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span>{new Date(user.updated_at).toLocaleString()}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span>{user.deleted_at ? new Date(user.deleted_at).toLocaleString() : '-'}</span>
                                        </TableCell>
                                        <TableCell>
                                            {user?.role?.type}
                                        </TableCell>
                                        <TableCell>
                                            <Button className="text-red-500" size="icon" variant="ghost" onClick={() => onDelete(user.id)}>
                                                <TrashIcon className="h-5 w-5" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        }
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = (async (ctx) => {
    // const csrfToken = await getCsrfToken()
    // if (!csrfToken) throw new Error("No csrf token");

    const cookies = nookies.get(ctx)
    // console.log(cookies)

    // fetch models from the API
    try {
        const response = await fetch(process.env.NEXT_PUBLIC_API + "/users", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Cookie": "next-auth.csrf-token=" + cookies["next-auth.csrf-token"] + "; next-auth.session-token=" + cookies["next-auth.session-token"] + ";"
            },
            credentials: "include",
        });

        const data = await response.json();

        return {
            props: {
                data,
            },
        };
    }
    catch (error) {
        console.error(error);
        return {
            props: {},
        };
    }
})


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
