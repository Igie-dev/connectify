import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <section className="flex flex-col w-full h-fit">
      <header className="w-full container_padding h-fit">
        <div className="flex items-end justify-between h-20 pb-4 border-b border-muted md:px-4">
          <div className="flex items-center gap-2 h-fit"></div>
        </div>
      </header>
      <div className="flex flex-col w-full pt-20 md:pt-32 container_padding">
        <div className="flex flex-col items-center w-full">
          <span className="text-2xl fancy_font md:text-4xl lg:text-7xl">
            Channel Connect
          </span>
          <p className="text-sm font-light text-center w-full  md:max-w-[50rem] lg:pl-5 lg:text-lg mt-5">
            Welcome to WebChat, the ultimate solution for seamless online
            communication. Our web-based chat application is designed to bring
            people together, offering real-time messaging with lightning-fast
            speed and top-notch security.
          </p>
          <Button onClick={() => navigate("/login")} className="mt-20">
            Log In
          </Button>
        </div>
      </div>
    </section>
  );
}
