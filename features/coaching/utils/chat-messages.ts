import type { UIMessage } from "ai";

export function getTextFromUIMessage(
  message: Pick<UIMessage, "parts">,
): string {
  return message.parts
    .filter((part) => part.type === "text" && "text" in part && part.text)
    .map((part) => ("text" in part ? part.text : ""))
    .join("");
}

export function dbMessageToUIMessage(message: {
  id: string;
  role: string;
  content: string;
}): UIMessage {
  return {
    id: message.id,
    role: message.role as UIMessage["role"],
    parts: [{ type: "text", text: message.content }],
  };
}
