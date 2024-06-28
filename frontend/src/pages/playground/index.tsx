import React, { useState, useEffect } from "react";
import { getCsrfToken, useSession } from "next-auth/react";
import nookies from 'nookies'

import JsonView from 'react18-json-view'
import 'react18-json-view/src/style.css'
import {
  Bird,
  Book,
  Bot,
  CornerDownLeft,
  KeyIcon,
  Rabbit,
  Undo,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { GetServerSideProps } from "next";
import { toast } from "sonner";


export function TableComponent({ data }: { data: any }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Model</TableHead>
          <TableHead>Type of Analysis</TableHead>
          <TableHead>Prompt</TableHead>
          <TableHead>Result</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.map((item: any, index: number) => (
          <TableRow key={index}>
            <TableCell>{item.model}</TableCell>
            <TableCell>{item.type}</TableCell>
            <TableCell>{item.prompt}</TableCell>
            <TableCell>
              {item.result && (
                <>
                  {item.result.sentiment} {item.result.score.toFixed(3) * 100}%
                </>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}


export default function Playground(props: any) {
  const { data: session } = useSession({
    required: true,
  })

  const [prompt, setPrompt] = useState("");
  const [modelName, setModelName] = useState("bert");
  const [type, setType] = useState("sentiment");
  const [jsonDisplay, setJsonDisplay] = useState({})
  const [compute, setCompute] = useState({ computation_time: -1, device: '' }) // [time, device]
  const [tableData, setTableData] = useState([])
  const [models, setModels] = useState([])
  const [allowDownload, setAllowDownload] = useState(false);

  // if the props contain models, update the state
  useEffect(() => {
    if (type === "sentiment" && props?.sentimentModels) {
      setModels(props.sentimentModels.models);
      setModelName(props.sentimentModels.models[0]?.name);
    } else if (type === "ner" && props?.nerModels) {
      setModels(props.nerModels.models);
      setModelName(props.nerModels.models[0]?.name);
    }
  }, [props, type]);

  async function onPredict() {
    const csrfToken = await getCsrfToken()
    let response = null;
    let data = null;

    if (!csrfToken) throw new Error("No csrf token");

    switch (type) {
      case "sentiment":
        response = await fetch(process.env.NEXT_PUBLIC_API + "/sentiment/predict", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-XSRF-Token": csrfToken
          },
          credentials: "include",
          body: JSON.stringify({ prompt, model_name: modelName, type }),
        });
        break;
      case "ner":
        response = await fetch(process.env.NEXT_PUBLIC_API + "/ner/predict", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-XSRF-Token": csrfToken
          },
          credentials: "include",
          body: JSON.stringify({ prompt, model_name: modelName, type }),
        });
        break;
    }

    data = await response?.json();
    if (!response?.ok) {
      console.error(data.detail);
      toast.error(data.detail);
      return;
    }

    // persist the last element of data (computation time and device)
    setCompute(data?.slice(-1)[0])

    // remove last element
    data.pop()

    // Update state with formatted data
    setJsonDisplay(data)

    // Fetch prompt data
    const webhookResponse = await fetch(process.env.NEXT_PUBLIC_API + "/sentiment/webhook", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-XSRF-Token": csrfToken
      },
      credentials: "include",
    });
    const webhookData = await webhookResponse.json();
    // console.log(webhookData);

    // Format result data
    const formattedData = webhookData?.prompts.map((prompt: any) => {
      let maxScore = 0;
      let sentiment = "";
      for (const result of prompt.result.output) {
        if (result.score > maxScore) {
          maxScore = result.score;
          sentiment = result.label;
        }
      }
      return {
        model: prompt.model_id == 1 ? "BERT" : "RoBERTa",
        type: prompt.analysis_type,
        prompt: prompt.input,
        result: { sentiment, score: maxScore }
      };
    });

    // Update state with formatted data
    setTableData(formattedData);
    setAllowDownload(true)
  }

  function onCLear() {
    setPrompt("");
    setModelName("bert");
    setType("sentiment");
    setJsonDisplay({})
    setAllowDownload(false);
  }

  const onDownload = () => {
    const jsonString = JSON.stringify(jsonDisplay, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "inference.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  function getModelsOptions() {
    return models.map((model: any) => (
      <SelectItem key={model?.id} value={model?.name}>
        <div className="flex items-start gap-3 text-muted-foreground">
          <Bot className="size-5" />
          <div className="grid gap-0.5">
  <p className="flex items-center">
    <span>
      Neural{" "}
      <span className="font-medium text-foreground">
        {model?.name} &nbsp;<KeyIcon className="text-pink-500 dark:text-pink-400 h-4 w-4 inline-block" />
        {model?.properties?.token_cost}
      </span>
    </span>
  </p>
  <p className="text-xs" data-description>
    {model?.description}
  </p>
</div>

        </div>
      </SelectItem>
    ));
  }

  return (
    <>
      <div className="relative hidden flex-col items-start gap-8 md:flex" x-chunk="dashboard-03-chunk-0">
        <form className="grid w-full items-start gap-6">
          <fieldset className="grid gap-6 rounded-lg border p-4">
            <legend className="-ml-1 px-1 text-sm font-medium">
              Settings
            </legend>
            <div className="grid gap-3">
              <Label htmlFor="model">Model</Label>
              <Select value={modelName} onValueChange={(val) => setModelName(val)}>
                <SelectTrigger
                  id="model"
                  className="items-start [&_[data-description]]:hidden"
                >
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {getModelsOptions()}
                </SelectContent>
              </Select>
              <Label htmlFor="type">Analysis Type</Label>
              <Select value={type} onValueChange={(val) => setType(val)}>
                <SelectTrigger
                  id="type"
                  className="items-start [&_[data-description]]:hidden"
                >
                  <SelectValue placeholder="Select a Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sentiment">
                    <div className="flex items-start gap-3 text-muted-foreground">
                      <Rabbit className="size-5" />
                      <div className="grid gap-0.5">
                        <p>
                          Sentiment{" "}
                          <span className="font-medium text-foreground">
                            Analysis
                          </span>
                        </p>
                        <p className="text-xs" data-description>
                          Determine if the emotional tone of the text is positive, negative, or neutral.
                        </p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="ner">
                    <div className="flex items-start gap-3 text-muted-foreground">
                      <Bird className="size-5" />
                      <div className="grid gap-0.5">
                        <p>
                          Named-Entity{" "}
                          <span className="font-medium text-foreground">
                            Recognition
                          </span>
                        </p>
                        <p className="text-xs" data-description>
                          Detecting and categorizing important information in text known as named entities.
                        </p>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </fieldset>
          <fieldset className="grid gap-6 rounded-lg border p-4">
            <legend className="-ml-1 px-1 text-sm font-medium">
              Messages
            </legend>
            <div className="grid gap-3">
              <Label htmlFor="content">Prompt</Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Lorem ipsum..."
                className="min-h-[9.5rem]"
              />
            </div>
          </fieldset>
          <div className="flex items-center gap-3">
            <Button type="button" className="gap-1.5" onClick={onPredict}>
              Run
              <Book className="size-3.5" />
            </Button>
            <Button type="reset" variant="outline" className="gap-1.5" onClick={onCLear}>
              Clear
              <Undo className="size-3.5" />
            </Button>
          </div>
          <div className="flex items-center gap-3">
            {compute.computation_time !== -1 && (
              <span>
                Computation time:{" "}
                <span className="font-medium ">
                  {compute.computation_time.toFixed(4)}s
                </span>{" "}
                on{" "}
                <span className="font-medium">{compute.device}</span>.
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/*  */}
          </div>

        </form>
      </div>
      <div className="relative flex h-full min-h-[50vh] flex-col rounded-xl bg-muted/50 p-4 lg:col-span-2">
        <Badge variant="outline" className="absolute right-3 top-3">
          Output &nbsp;
          {allowDownload && (

            <Button
              className="p-0 m-0 bg-transparent dark:bg-gray-900 dark:text-gray-50 hover:bg-gray-100 dark:hover:bg-gray-800"
              size="x-sm"
              variant="link"
              onClick={onDownload}
            >
              <DownloadIcon className="w-4 h-4" />
            </Button>
          )}
        </Badge>
        <JsonView src={jsonDisplay} />

        <div className="flex-1">
          {/* sentiment: Exremely positive 99% */}
          <TableComponent data={tableData} />
        </div>
      </div>
    </>
  );
}

function DownloadIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  )
}


export const getServerSideProps: GetServerSideProps = (async (ctx) => {
  // const csrfToken = await getCsrfToken()
  // if (!csrfToken) throw new Error("No csrf token");

  const cookies = nookies.get(ctx)
  // console.log(cookies)

  // fetch models from the API
  try {
    const response1 = await fetch(process.env.NEXT_PUBLIC_API + "/sentiment/models", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cookie": "next-auth.csrf-token=" + cookies["next-auth.csrf-token"] + "; next-auth.session-token=" + cookies["next-auth.session-token"] + ";"
      },
      credentials: "include",
    });

    const response2 = await fetch(process.env.NEXT_PUBLIC_API + "/ner/models", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cookie": "next-auth.csrf-token=" + cookies["next-auth.csrf-token"] + "; next-auth.session-token=" + cookies["next-auth.session-token"] + ";"
      },
      credentials: "include",
    });

    const sentimentModels = await response1.json();
    const nerModels = await response2.json();

    return {
      props: {
        sentimentModels,
        nerModels,
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