import { Container } from "@/components/shared/container";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";


export function PageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-dvh">
      <Header />
      <Container className="grow w-full">
        { children }
      </Container>
      <Container className="w-full">
        <Footer />
      </Container>
    </div>
  );
}