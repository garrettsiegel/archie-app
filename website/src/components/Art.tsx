// Close-up of the real app catching two mistakes (see public/screens/PROVENANCE.md).
export const HeroShot = () => (
  <picture>
    <source media="(max-width: 639px)" srcSet="./screens/hero-issues-phone.webp" width={838} height={440} />
    <img
      src="./screens/hero-issues.webp"
      srcSet="./screens/hero-issues.webp 755w, ./screens/hero-issues@2x.webp 1510w"
      sizes="(min-width: 768px) 912px, 100vw"
      width={755}
      height={220}
      decoding="async"
      alt="Archie Editor's Issues tab listing an unclosed {tickets} block and a duplicate price key, beside the doc lines that cause them"
      className="block h-auto w-full"
    />
  </picture>
)
