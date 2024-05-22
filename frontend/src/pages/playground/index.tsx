import React, { useState, useEffect } from "react";
import { getCsrfToken, useSession } from "next-auth/react";

import JsonView from 'react18-json-view'
import 'react18-json-view/src/style.css'
import {
  Bird,
  Book,
  Bot,
  CornerDownLeft,
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



const MODELS = {
  bert: {
    name: "BERT",
    description: "Bidirectional Encoder Representations from Transformers",
  },
  roberta: {
    name: "RoBERTa",
    description: "Robustly optimized BERT approach",
  },
};


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


export default function Playground() {
  const { data: session } = useSession({
    required: true,
  })

  const [prompt, setPrompt] = useState("");
  const [modelName, setModelName] = useState("bert");
  const [type, setType] = useState("sentiment");
  const [jsonDisplay, setJsonDisplay] = useState({})
  const [compute, setCompute] = useState({ computation_time: -1, device: '' }) // [time, device]
  const [tableData, setTableData] = useState([])


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

    // persist the last element of data (computation time and device)
    setCompute(data.slice(-1)[0])
    
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
  }

  function onCLear() {
    setPrompt("");
    setModelName("bert");
    setType("sentiment");
    setJsonDisplay({})
  }

  function getModelsOptions() {
    return Object.entries(MODELS).map(([key, value]) => (
      <SelectItem key={key} value={key}>
        <div className="flex items-start gap-3 text-muted-foreground">
          <Bot className="size-5" />
          <div className="grid gap-0.5">
            <p>
              Neural{" "}
              <span className="font-medium text-foreground">{value.name}</span>
            </p>
            <p className="text-xs" data-description>
              {value.description}
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
          Output
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
