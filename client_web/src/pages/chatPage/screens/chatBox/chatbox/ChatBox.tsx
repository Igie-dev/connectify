import ChatInput from "./ChatInput";
import MessageList from "./MessageList";
export default function ChatBox() {
  return (
    <section className="relative flex flex-col items-center flex-1 h-full pt-10 border">
      <MessageList />
      <ChatInput />
    </section>
  );
}
