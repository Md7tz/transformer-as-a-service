/**
 * v0 by Vercel.
 * @see https://v0.dev/t/ZHNKKkNsjr0
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { Progress } from "@/components/ui/progress"

export default function TokensTracker() {
  return (
        <div className="flex items-center gap-2 ms-auto">
          <div className="text-gray-500 dark:text-gray-400">
            <span className="font-medium">25</span>/ 100 tokens{"\n                "}
          </div>
          <Progress className="w-32" max={100} value={25} />
        </div>
  )
}

function KeyIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <circle cx="7.5" cy="15.5" r="5.5" />
      <path d="m21 2-9.6 9.6" />
      <path d="m15.5 7.5 3 3L22 7l-3-3" />
    </svg>
  )
}