import { HistoryTable } from "@/components/HistoryTable";
import { createDecipheriv } from "crypto";
import { GetServerSideProps } from "next";
import nookies from "nookies"

export default function HistoryPage({ history }: { history: any }) {
  return (
    <>
      <h1 className="text-2xl font-bold">History</h1>
      <HistoryTable initialData={history} />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = (async (ctx) => {
  const cookies = nookies.get(ctx)

  try {

    const res = await fetch(process.env.NEXT_PUBLIC_API + "/sentiment/webhook", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cookie": "next-auth.csrf-token=" + cookies["next-auth.csrf-token"] + "; next-auth.session-token=" + cookies["next-auth.session-token"] + ";"
      },
      credentials: "include",
    });
    const webhookData = await res.json();
   // Format result data
    interface Prompt {
      id: any;
      created_at: any;
      model_id: number;
      analysis_type: string;
      input: string;
      result: {
        id: any;
        output: any;
        score: number;
      };
    }

    interface FormattedData {
      model: string;
      type: string;
      prompt: string;
      result: {
        sentiment: string;
        score: number;
      };
    }

    const formattedData: FormattedData[] = webhookData?.prompts.map((prompt: Prompt) => {
      let maxScore = 0;
      let sentiment = "";
      for (const result of prompt.result.output) {
        if (result.score > maxScore) {
          maxScore = result.score;
          sentiment = result.label || "";
        }
      }
      return {
        id: prompt.id,
        created_at: prompt?.created_at,
        model: prompt.model_id === 1 ? "BERT" : "RoBERTa",
        type: prompt.analysis_type,
        prompt: prompt.input,
        result: { id: prompt.result?.id, sentiment, score: maxScore, processed_text: prompt.result.output[prompt.result.output.length - 2]['processed_text'] || ""}
      };
    });

    // console.log(formattedData)
    return {
      props: {
        history: formattedData,
      },
    }
  }
  catch (error) {
    console.error(error);
    return {
      props: {},
    };
  }
});
