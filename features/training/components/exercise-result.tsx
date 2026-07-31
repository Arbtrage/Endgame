type ExerciseResultProps = {
  result: "correct" | "incorrect";
  explanation?: string;
};

export function ExerciseResult({ result, explanation }: ExerciseResultProps) {
  return (
    <div
      className={
        result === "correct"
          ? "rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-center"
          : "rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-center"
      }
    >
      <p className="font-medium">
        {result === "correct" ? "Correct!" : "Not quite — try again"}
      </p>
      {result === "correct" && explanation ? (
        <p className="mt-2 text-sm text-muted-foreground">{explanation}</p>
      ) : null}
    </div>
  );
}
