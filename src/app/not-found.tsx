import { ButtonLink } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Magnetic } from "@/components/motion/magnetic";

export default function NotFound() {
  return (
    <section className="container-page flex min-h-dvh flex-col items-center justify-center py-32 text-center">
      <Eyebrow>Eroare 404</Eyebrow>
      <h1 className="mt-6 text-display text-gradient">Ai ajuns pe un drum închis.</h1>
      <p className="mt-6 max-w-md text-body-lg text-ink-muted">
        Pagina pe care o cauți nu există sau a fost mutată. Hai să te ducem înapoi
        pe traseu.
      </p>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Magnetic strength={0.22}>
          <ButtonLink href="/" variant="primary" size="lg">
            Prima pagină
          </ButtonLink>
        </Magnetic>
        <ButtonLink href="/rezervare" variant="secondary" size="lg">
          Caută o cursă
        </ButtonLink>
      </div>
    </section>
  );
}
