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
      <Container>
        { children }
      </Container>
      <Container>
        <Footer />
      </Container>
    </div>
  );
}