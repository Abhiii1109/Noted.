import React from 'react';
import { Shield, Copyright } from 'lucide-react';

const year = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="footer-inner">
        {/* Brand */}
        <div className="footer-brand">
          <span className="footer-logo">N.</span>
          <span className="footer-tagline">Sticky wisdom for the modern mind.</span>
        </div>

        {/* Copyright */}
        <div className="footer-copy">
          <Copyright size={13} strokeWidth={2} />
          <span>{year} <strong>NOTED.</strong> All rights reserved.</span>
        </div>

        {/* Legal notice */}
        <div className="footer-legal">
          <Shield size={12} strokeWidth={2} />
          <span>
            All content, design, and code on this site is the exclusive intellectual property of NOTED.
            Unauthorized reproduction, copying, or distribution is strictly prohibited.
          </span>
        </div>
      </div>
    </footer>
  );
}
