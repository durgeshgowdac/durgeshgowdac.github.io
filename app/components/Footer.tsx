"use client";
import { useEffect, useState } from "react";

// The static HTML carries the year of the build; the effect swaps in the visitor's current year, so the footer never goes stale.
const BUILD_YEAR = new Date().getFullYear();

function Footer() {
    const [year, setYear] = useState(BUILD_YEAR);
    useEffect(() => { setYear(new Date().getFullYear()); }, []);

    return (
        <footer className="footer">
            <div className="container">
                <blockquote className="footer-quote">
                    &ldquo;The Revolution will be A/B tested.&rdquo;
                    <cite>— Aaron Swartz</cite>
                </blockquote>
                <div className="footer-inner">
                    <p className="footer-line">
                        <span className="creator">Built (and occasionally broken, then fixed) by Durgesh Gowda C</span>
                        <span className="footer-sep" aria-hidden="true">·</span>
                        <span className="copyright">
                            Copyright <span className="copyright-symbol">&copy;</span>{" "}
                            <span>{year}</span> Durgesh Gowda C. All rights reserved.
                        </span>
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;