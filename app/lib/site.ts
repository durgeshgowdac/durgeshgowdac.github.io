/** The default origin, used when NEXT_PUBLIC_SITE_URL is not set (GitHub Pages, where the variable doesn't exist). */
export const DEFAULT_SITE_URL = 'https://durgeshgowdac.github.io'

/** `raw` as a bare origin (no path, no trailing slash); anything that isn't a full URL falls back, with a build-time warning. */
function originOf(raw: string | undefined, fallback: string): string {
    if (!raw) return fallback
    try {
        return new URL(raw).origin
    } catch {
        console.warn(`NEXT_PUBLIC_SITE_URL ("${raw}") is not a full URL (https://…); using ${fallback}`)
        return fallback
    }
}

/** This deployment's own origin. Set NEXT_PUBLIC_SITE_URL in each host's environment. Canonical tags, Open Graph, structured data, the sitemap and robots.txt all use it, so every host is its own complete, indexable site. */
export const SITE_URL = originOf(process.env.NEXT_PUBLIC_SITE_URL, DEFAULT_SITE_URL)

/* Search-engine ownership tokens. Every host serves the same build, so list the token of EVERY property you verify (one per host) here and each
   host will find its own. Leave empty until you have them. Bing can also import its sites from Google Search Console, which needs no token. */
export const GOOGLE_VERIFICATION: string[] = [
    'iI1M_BBUyGgqf5SdApLRc5S1miztRIUGIHpePiT5sps',
    'wiBmFj3NKQYsU81LyhBwpV-GmtNNSb-X0Xk-WuHwMCc',
    'ebQzZnQP0ADSq2kR2TbJUKsbpIpCCmYgEr0lAVQdfuI',
    'keNXo4n8_JhvommTSZuomfx1NuhS0oldQ7_aINFOaAc',
    'iqc_cUItxec8sTQB0aGuQSABa3163Crh5SlAY64UfzQ',
    'jC16g_zqSAcUhQw8AC73ky5Gf4IieA356ia68f3Liqc',
    'PX21lMN2GMtXOwd2wJHgYiOvdshdySJk7VZBVbkExm4',
    'OwfH4CCnE8JzzqjNrz96aip4A3_7HSeAC6f0q97ilD0',
    'ZZxh8TMXIEFV_N1CZ7z91MFj3cT2gm3T3-EMCmYWbUY',
    'XqYcvsKPCyThB7Nnh8L2SWQ4Fxyc-VNb3lG9PoJmjG0',
]
