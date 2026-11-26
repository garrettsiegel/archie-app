// Real screenshots of the app (see public/screens/PROVENANCE.md).
export const Screenshot = ({ name, alt, eager = false }: { name: string; alt: string; eager?: boolean }) => (
  <img
    src={`./screens/app-${name}.webp`}
    srcSet={`./screens/app-${name}.webp 1000w, ./screens/app-${name}@2x.webp 2000w`}
    sizes="(min-width: 1024px) 1000px, 100vw"
    width={1000}
    height={640}
    loading={eager ? 'eager' : 'lazy'}
    decoding="async"
    alt={alt}
    className="h-auto w-full"
  />
)

