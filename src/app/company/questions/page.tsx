import { QuestionBankList } from "@/modules/questions/components/QuestionBankList";

export const metadata = {
  title: "Question Bank | HireAI Admin",
  description: "Manage interview questions and assessment criteria",
};

export default function QuestionBankPage() {
  return (
    <div className="w-full max-w-5xl mx-auto">
      <QuestionBankList />
    </div>
  );
}
