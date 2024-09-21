import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { ModeToggle } from "@/components/ui/mode-toggle";

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col min-h-[100dvh] bg-background">
      <header className="flex items-center h-20 px-4 lg:px-6">
        <span className="ml-2 text-2xl font-bold">Channel Connect</span>
        <nav className="flex gap-4 ml-auto sm:gap-6">
          <Button variant="link" className="text-sm ">
            Features
          </Button>
          <Button variant="link" className="text-sm ">
            Pricing
          </Button>
          <Button variant="link" className="text-sm ">
            About
          </Button>
          <Button variant="link" className="text-sm ">
            Contact
          </Button>
          <ModeToggle />
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-primary">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-8 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter text-white sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Connect Your Channels, Amplify Your Reach
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-200 md:text-xl">
                  Channel Connect helps you manage and grow your online presence
                  across multiple platforms. Streamline your content, engage
                  your audience, and boost your visibility.
                </p>
              </div>

              <Button variant="secondary" onClick={() => navigate("/login")}>
                Get Started
              </Button>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ready to Connect Your Channels?
                </h2>
                <p className="mx-auto max-w-[600px] md:text-xl">
                  Join thousands of content creators and businesses using
                  Channel Connect to grow their online presence.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <form className="flex space-x-2">
                  <Input
                    className="flex-1 max-w-lg bg-white text-primary"
                    placeholder="Enter your email"
                    type="email"
                  />
                  <Button
                    className="bg-white text-primary hover:bg-gray-100"
                    type="submit"
                  >
                    Sign Up
                  </Button>
                </form>
                <p className="text-sm">
                  By signing up, you agree to our{" "}
                  <Button variant="link">Terms & Conditions</Button>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col items-center w-full gap-2 px-4 py-6 border-t sm:flex-row shrink-0 md:px-6">
        <p className="text-xs text-gray-500">
          © 2023 Channel Connect. All rights reserved.
        </p>
        <nav className="flex gap-4 sm:ml-auto sm:gap-6">
          <Button variant="link" className="text-sm ">
            Terms of Service
          </Button>
          <Button variant="link" className="text-sm ">
            Privacy
          </Button>
        </nav>
      </footer>
    </div>
  );
}
