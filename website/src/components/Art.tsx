// Close-up of the real app catching two mistakes (see public/screens/PROVENANCE.md).
export const HeroShot = () => (
  <picture>
    <source media="(max-width: 639px)" srcSet="./screens/hero-issues-phone.webp" width={1000} height={330} />
    <img
      src="./screens/hero-issues.webp"
      srcSet="./screens/hero-issues.webp 835w, ./screens/hero-issues@2x.webp 1670w"
      sizes="(min-width: 768px) 912px, 100vw"
      width={835}
      height={165}
      decoding="async"
      alt="Archie Editor's Issues tab listing an unclosed {tickets} block and a duplicate price key, beside the doc lines that cause them, with keys and blocks colored"
      className="block h-auto w-full"
    />
  </picture>
)
