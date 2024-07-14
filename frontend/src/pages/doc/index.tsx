import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import nookies from 'nookies';

export default function ApiDoc({ sessionToken }) {
    return (
        <div className="col-span-full container mx-auto px-4 py-12 md:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-2">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">API Documentation</h1>
                    <p className="mt-4 text-muted-foreground">
                        Learn how to use our powerful API to integrate with your application.
                    </p>
                </div>
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold">Using the API</h2>
                        <p className="mt-2 text-muted-foreground">
                            Access our API by making HTTP requests to the following endpoint:
                        </p>
                        <div className="mt-4 rounded-md bg-background p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <code className="font-mono text-sm text-primary">{process.env.NEXT_PUBLIC_API}/sentiment/predict</code>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex items-center gap-1"
                                        onClick={() => {
                                            navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_API}/sentiment/predict`)
                                        }}
                                    >
                                        <CopyIcon className="h-4 w-4" />
                                        Copy
                                    </Button>
                                </div>
                            </div>
                            <p className="mt-4 text-muted-foreground">Include the following cookies in your requests:</p>
                            <div className="mt-2 flex items-center space-x-2">
                                <code className="font-mono text-sm text-primary">next-auth.session-token={sessionToken.substring(0,30)+'...'};</code>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex items-center gap-1"
                                    onClick={() => {
                                        navigator.clipboard.writeText(`next-auth.session-token=${sessionToken};`)
                                    }}
                                >
                                    <CopyIcon className="h-4 w-4" />
                                    Copy
                                </Button>
                            </div>
                            <div className="mt-4 rounded-md bg-background p-4">
                                <pre className="text-sm text-primary">{`
curl -X POST ${process.env.NEXT_PUBLIC_API}/sentiment/predict \\
     -H "Content-Type: application/json" \\
     --cookie "next-auth.session-token=${sessionToken.substring(0,30)+'...'};" \\
     -d '{
           "prompt": "<your_prompt>",
           "model_name": "<your_model_name>",
           "type": "<your_type>"
         }'
                `}</pre>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex items-center gap-1 mt-2"
                                    onClick={() => {
                                        navigator.clipboard.writeText(`
curl -X POST ${process.env.NEXT_PUBLIC_API}/sentiment/predict \\
     -H "Content-Type: application/json" \\
     --cookie "next-auth.session-token=${sessionToken};" \\
     -d '{
           "prompt": "<your_prompt>",
           "model_name": "<your_model_name>",
           "type": "<your_type>"
         }'
                `)
                                    }}
                                >
                                    <CopyIcon className="h-4 w-4" />
                                    Copy cURL
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Example Usage</h2>
                        <p className="mt-2 text-muted-foreground">Here's an example of how to use the API in your application:</p>
                        <div className="mt-4 rounded-md bg-background p-4">
                            <pre className="text-sm text-primary">{`
import axios from 'axios';
import { parseCookies } from 'nookies';

const fetchData = async () => {
  const cookies = parseCookies();

  try {
    const response = await axios.get(process.env.NEXT_PUBLIC_API + '/sentiment/models', {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': \`next-auth.csrf-token=\${cookies['next-auth.csrf-token']}; next-auth.session-token=\${cookies['next-auth.session-token']};\`,
      },
      withCredentials: true,
    });
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
};

fetchData();
                            `}</pre>
                            <Button
                                size="sm"
                                variant="outline"
                                className="flex items-center gap-1 mt-2"
                                onClick={() => {
                                    navigator.clipboard.writeText(`
import axios from 'axios';
import { parseCookies } from 'nookies';

const fetchData = async () => {
  const cookies = parseCookies();

  try {
    const response = await axios.get(process.env.NEXT_PUBLIC_API + '/sentiment/models', {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': \`next-auth.csrf-token=\${cookies['next-auth.csrf-token']}; next-auth.session-token=\${cookies['next-auth.session-token']};\`,
      },
      withCredentials: true,
    });
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
};

fetchData();
                  `)
                                }}
                            >
                                <CopyIcon className="h-4 w-4" />
                                Copy JavaScript
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CopyIcon(props) {
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
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
        </svg>
    );
}

export async function getServerSideProps(context) {
    const cookies = nookies.get(context);
    const sessionToken = cookies['next-auth.session-token'] || null;

    return {
        props: {
            sessionToken,
        },
    };
}
