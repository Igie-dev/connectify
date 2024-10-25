type Props = {
  children: React.ReactNode;
};
function Container({ children }: Props) {
  return (
    <section className="flex items-center justify-center w-screen h-screen bg-background">
      <div className="relative flex items-center justify-center w-full h-full overflow-hidden">
        {children}
      </div>
    </section>
  );
}

export default Container;
