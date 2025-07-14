import { Container } from "@/components/shared/container";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";


export function PageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Header />
      <Container className="flex flex-col min-h-screen">
        <div className="grow">
          { children }
        </div>
      </Container>
      <Container>
        <Footer />
      </Container>
    </div>
  );
}