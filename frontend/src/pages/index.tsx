import Image from "next/image";
import { Inter } from "next/font/google";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const { redirect } = router.query;
    console.log(redirect)
    if (redirect === "success") {
      toast.success("Sign-in successful!");
    } else if (redirect === "payment-success") {
      toast.success("Payment successful!");
    } else if (redirect === "payment-failed") {
      toast.error("Payment failed!");
    }
    
    // router.replace(router.pathname, undefined, { shallow: true });
  }, [router]);
  return (
    <div className="flex items-center justify-center p-10 text-center font-inter col-span-full">
      <div>
        <h1 className="text-3xl font-bold mb-4">Transformers as a Service (TaaS)</h1>
        <p className="mb-8">
          TaaS allows users to leverage fine-tuned language models for multiple downstream tasks, accessible via GUI and API.
        </p>
        <p className="mb-8">
          The service is designed to utilize fine-tuned models on various datasets for predictions.
        </p>
        <p className="mb-8">
          To use the service, head to the Playground in the sidebar. Details of pre-loaded pre-trained models will be available based on the service.
        </p>
        <p>
          Fill in the prompt on which you want to run the service and let the magic happen!
        </p>
      </div>
    </div>
  );
}
